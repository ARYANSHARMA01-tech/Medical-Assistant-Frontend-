# ================================================================
# 🚀 Unified FastAPI Medical Assistant + AI Skin Disease Detector
# ================================================================

import os
import torch
import pandas as pd
from PIL import Image
from doctors_api import get_doctors
from io import BytesIO
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    AutoModelForImageClassification,
    AutoImageProcessor,
)
from groq import Groq
from langdetect import detect
from deep_translator import GoogleTranslator
import joblib
from dotenv import load_dotenv

# ================================================================
# ⚙️ LOAD .env VARIABLES
# ================================================================
load_dotenv()  # Load environment variables from .env
GROQ_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_KEY:
    raise ValueError("GROQ_API_KEY not found. Please set it in your .env file.")

client = Groq(api_key=GROQ_KEY)

# ================================================================
# ⚙️ CONFIGURATION
# ================================================================
app = FastAPI(
    title="AI Medical Assistant + Skin Disease Detector",
    version="2.0",
    description="Unified API for symptom-based chatbot and image-based skin disease detection.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# ================================================================
# 💬 CHATBOT MODEL SETUP
# ================================================================
model_path = "my_chatbot_model"
tokenizer = AutoTokenizer.from_pretrained(model_path)
chat_model = AutoModelForSequenceClassification.from_pretrained(model_path).to(DEVICE)

le = joblib.load("label_encoder.pkl")
desc_df = pd.read_csv("symptom_Description.csv")
prec_df = pd.read_csv("symptom_precaution.csv")

disease_desc = dict(zip(desc_df["Disease"], desc_df["Description"]))
disease_prec = prec_df.set_index("Disease").T.to_dict("list")

# ================================================================
# 🩺 IMAGE MODEL SETUP
# ================================================================
IMAGE_MODEL_NAME = "Jayanth2002/dinov2-base-finetuned-SkinDisease"
image_model = AutoModelForImageClassification.from_pretrained(IMAGE_MODEL_NAME).to(DEVICE)
image_processor = AutoImageProcessor.from_pretrained(IMAGE_MODEL_NAME)

# ================================================================
# 🌐 TRANSLATIONS, GREETINGS
# ================================================================
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

# ================================================================
# 🔮 CHATBOT FUNCTIONS
# ================================================================
current_lang = "en"
chat_history = []

def predict_top(symptoms_text, lang=None, top_n=10):
    text_en = GoogleTranslator(source="auto", target="en").translate(symptoms_text)
    inputs = tokenizer(text_en, return_tensors="pt", truncation=True, padding=True).to(DEVICE)
    with torch.no_grad():
        outputs = chat_model(**inputs)
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
    return top[0]

def chatbot(user_input):
    global current_lang

    # Language switching
    if any(word in user_input.lower() for word in ["كلمني عربي", "speak arabic"]):
        current_lang = "ar"; return "تمام ✅ هكلمك بالعربي!"
    if any(word in user_input.lower() for word in ["speak english", "كلمني انجليزي"]):
        current_lang = "en"; return "Okay ✅ I'll speak English now!"
    if any(word in user_input.lower() for word in ["speak french", "كلمني فرنسي"]):
        current_lang = "fr"; return "تمام ✅ هكلمك بالفرنساوي من دلوقتي!"

    # Greetings
    for lang, words in greetings.items():
        if any(word in user_input.lower() for word in words):
            return greeting_responses.get(current_lang, greeting_responses["en"])

    # Predict Disease
    disease_en, disease_out, prob = predict_disease(user_input, current_lang)
    description = disease_desc.get(disease_en, "No description available.")
    precautions = [p for p in disease_prec.get(disease_en, []) if isinstance(p, str) and p.strip() != ""]

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

from doctors_api import get_doctors

@app.get("/find_doctors")
async def find_doctors(disease: str = None, symptom: str = None):
    """
    🔎 Find doctors by disease or symptom.
    Example: /find_doctors?disease=Diabetes
    """
    result = get_doctors(disease=disease, symptom=symptom)
    return result


# ================================================================
# 🧠 IMAGE DETECTION FUNCTIONS
# ================================================================
def predict_skin_disease(image: Image.Image):
    image = image.convert("RGB")
    inputs = image_processor(images=image, return_tensors="pt").to(DEVICE)
    with torch.no_grad():
        outputs = image_model(**inputs)
    logits = outputs.logits
    predicted_class_idx = logits.argmax(-1).item()
    predicted_label = image_model.config.id2label[predicted_class_idx]
    return predicted_label

def get_disease_info_groq(disease_name: str):
    prompt = f"Provide a detailed explanation about the skin disease '{disease_name}', including description, causes, precautions, risks, and treatment options."
    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
    )
    return chat_completion.choices[0].message.content

# ================================================================
# 📦 FASTAPI SCHEMAS
# ================================================================
class ChatRequest(BaseModel):
    message: str

# ================================================================
# 🌐 ENDPOINTS
# ================================================================
@app.get("/")
async def root():
    return {"message": "AI Medical Assistant + Skin Disease Detector running 🚀"}

# 🗣️ Chatbot endpoint
@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    chat_resp = chatbot(req.message)
    chat_history.append({"user": req.message, "bot": chat_resp["response"]})
    top10 = predict_top(req.message, current_lang, top_n=10)
    top10_list = [{"disease_en": d[0], "disease_translated": d[1], "confidence": float(d[2])} for d in top10]
    return {"chat": chat_resp, "history": chat_history, "top10": top10_list}

# 🖼️ Skin Disease Detection endpoint
@app.post("/image")
async def detect_disease(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(BytesIO(contents))
    disease_name = predict_skin_disease(image)
    disease_info = get_disease_info_groq(disease_name)
    return {
        "detected_disease": disease_name,
        "details": disease_info
    }

# ================================================================
# ▶️ MAIN
# ================================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
