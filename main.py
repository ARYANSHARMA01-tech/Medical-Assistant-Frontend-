# =========================================
# FastAPI Chatbot API - Medical Assistant
# =========================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from langdetect import detect
from deep_translator import GoogleTranslator
import joblib

# ==============================
# Load Model & Tokenizer
# ==============================
model_path = "my_chatbot_model"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# ==============================
# Load Label Encoder & Data
# ==============================
le = joblib.load("label_encoder.pkl")
desc_df = pd.read_csv("symptom_Description.csv")
prec_df = pd.read_csv("symptom_precaution.csv")

disease_desc = dict(zip(desc_df["Disease"], desc_df["Description"]))
disease_prec = prec_df.set_index("Disease").T.to_dict("list")

# ==============================
# Translations & Greetings
# ==============================
disease_translations = {
    "Common Cold": {"ar": "نزلة برد", "fr": "Rhume commun"},
    "Diabetes": {"ar": "داء السكري", "fr": "Diabète"},
    "Migraine": {"ar": "صداع نصفي", "fr": "Migraine"},
    "Malaria": {"ar": "الملاريا", "fr": "Paludisme"},
    "Tuberculosis": {"ar": "السل", "fr": "Tuberculose"},
}

greetings = {
    "ar": ["اهلا", "مرحبا", "هلا", "السلام عليكم"],
    "en": ["hello", "hi", "hey"],
    "fr": ["bonjour", "salut"]
}

greeting_responses = {
    "ar": "أهلا بيك 👋، قوللي أعراضك؟",
    "en": "Hello 👋, tell me your symptoms?",
    "fr": "Bonjour 👋, dites-moi vos symptômes?"
}

# ==============================
# Prediction Functions
# ==============================
def predict_top(symptoms_text, lang=None, top_n=10):
    text_en = GoogleTranslator(source="auto", target="en").translate(symptoms_text)
    inputs = tokenizer(text_en, return_tensors="pt", truncation=True, padding=True).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1).cpu().numpy()[0]

    top_idx = probs.argsort()[-top_n:][::-1]
    diseases = le.inverse_transform(top_idx)
    confidences = probs[top_idx]

    if lang is None:
        lang = detect(symptoms_text)

    translated = [disease_translations.get(d, {}).get(lang, d) for d in diseases]
    return list(zip(diseases, translated, confidences))

def predict_disease(symptoms_text, lang=None):
    top = predict_top(symptoms_text, lang, top_n=10)
    return top[0]  # best prediction

# ==============================
# Chatbot Function
# ==============================
current_lang = "en"
chat_history = []

def chatbot(user_input):
    global current_lang

    # Language switch
    if any(word in user_input.lower() for word in ["كلمني عربي", "speak arabic"]):
        current_lang = "ar"
        return "تمام ✅ هكلمك بالعربي!"
    if any(word in user_input.lower() for word in ["كلمني انجليزي", "speak english"]):
        current_lang = "en"
        return "Okay ✅ I'll speak English now!"
    if any(word in user_input.lower() for word in ["كلمني فرنسي", "speak french"]):
        current_lang = "fr"
        return "تمام ✅ هكلمك بالفرنساوي من دلوقتي!"

    # Greetings
    for lang, words in greetings.items():
        if any(word in user_input.lower() for word in words):
            return greeting_responses.get(current_lang, greeting_responses["en"])

    # Predict Disease (best one)
    disease_en, disease_out, prob = predict_disease(user_input, current_lang)

    # Get description
    description = disease_desc.get(disease_en, "No description available.")

    # Get precautions
    precautions = disease_prec.get(disease_en, [])
    precautions = [p for p in precautions if isinstance(p, str) and p.strip() != ""]

    # Response formatting
    response = {
        "response": f"📋 Expected Disease: {disease_out} (Confidence: {prob:.2f})\n\n"
                    f"📝 Description: {description}\n\n"
                    + ("✅ Precautions:\n" + "\n".join([f"{i+1}. {p}" for i, p in enumerate(precautions)]) if precautions else ""),
        "disease": disease_out,
        "description": description,
        "precautions": precautions,
        "confidence": float(prob)
    }

    return response

# ==============================
# FastAPI App
# ==============================
app = FastAPI(title="Medical Chatbot API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# ==============================
# Request Schema
# ==============================
class ChatRequest(BaseModel):
    message: str

# ==============================
# Endpoints
# ==============================
@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    # Chatbot response
    chat_resp = chatbot(req.message)

    # Save to history
    chat_history.append({"user": req.message, "bot": chat_resp["response"]})

    # Also get top10 predictions
    top10 = predict_top(req.message, current_lang, top_n=10)
    top10_list = [{"disease_en": d[0], "disease_translated": d[1], "confidence": float(d[2])} for d in top10]

    return {
        "chat": chat_resp,
        "history": chat_history,
        "top10": top10_list
    }

@app.get("/")
async def root():
    return {"message": "Medical Chatbot API running 🚀"}

# ==============================
# Run via Uvicorn
# ==============================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
