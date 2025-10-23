# =========================================
# Streamlit Chatbot UI - Medical Assistant
# =========================================

import streamlit as st
import torch
import pandas as pd
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from langdetect import detect
from deep_translator import GoogleTranslator
import joblib

# ==============================
# Load Model & Tokenizer
# ==============================
model_path = "my_chatbot_model"  # keep your trained model here
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# ==============================
# Load Label Encoder
# ==============================
le = joblib.load("label_encoder.pkl")

# ==============================
# Load CSV Data
# ==============================
desc_df = pd.read_csv("symptom_Description.csv")
prec_df = pd.read_csv("symptom_precaution.csv")
sev_df = pd.read_csv("Symptom-severity.csv")

# Dictionary for fast lookup
disease_desc = dict(zip(desc_df["Disease"], desc_df["Description"]))
disease_prec = prec_df.set_index("Disease").T.to_dict("list")

# ==============================
# Disease Translations Dictionary
# ==============================
disease_translations = {
    "Common Cold": {"ar": "نزلة برد", "fr": "Rhume commun"},
    "Diabetes": {"ar": "داء السكري", "fr": "Diabète"},
    "Migraine": {"ar": "صداع نصفي", "fr": "Migraine"},
    "Malaria": {"ar": "الملاريا", "fr": "Paludisme"},
    "Tuberculosis": {"ar": "السل", "fr": "Tuberculose"},
}

# ==============================
# Greetings
# ==============================
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
    # Translate to English for the model
    text_en = GoogleTranslator(source='auto', target='en').translate(symptoms_text)
    inputs = tokenizer(text_en, return_tensors="pt", truncation=True, padding=True).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1).cpu().numpy()[0]

    # Top N indices
    top_idx = probs.argsort()[-top_n:][::-1]
    diseases = le.inverse_transform(top_idx)
    confidences = probs[top_idx]

    if lang is None:
        lang = detect(symptoms_text)

    translated = [disease_translations.get(d, {}).get(lang, d) for d in diseases]

    return list(zip(diseases, translated, confidences))  # (English name, translated, prob)


def predict_disease(symptoms_text, lang=None):
    top = predict_top(symptoms_text, lang, top_n=10)
    return top[0]  # best prediction


# ==============================
# Chatbot Function
# ==============================
current_lang = "en"

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
    response = f"📋 Expected Disease: **{disease_out}** (Confidence: {prob:.2f})\n\n"
    response += f"📝 Description: {description}\n\n"
    if precautions:
        response += "✅ Precautions:\n"
        for i, p in enumerate(precautions, 1):
            response += f"   {i}. {p}\n"
    
    return response


# ==============================
# Streamlit UI
# ==============================
st.set_page_config(page_title="Medical Chatbot", page_icon="🩺")

st.title("🩺 Multilingual Medical Chatbot")
st.write("Chat with me about your symptoms in **Arabic, English, or French**.")

# Keep chat history
if "history" not in st.session_state:
    st.session_state.history = []

# Input box
user_input = st.text_input("👤 You:", "")

# Always show top 10 chart when user sends something
if st.button("Send") and user_input:
    # Save chatbot response
    response = chatbot(user_input)
    st.session_state.history.append(("You", user_input))
    st.session_state.history.append(("Bot", response))

# 🔹 Display Top 10 Predictions (if last input exists)
if len(st.session_state.history) > 0:
    last_user_inputs = [msg for sender, msg in st.session_state.history if sender == "You"]
    if last_user_inputs:
        last_input = last_user_inputs[-1]
        top10 = predict_top(last_input, current_lang, top_n=10)

        df = pd.DataFrame(top10, columns=["Disease_En", "Disease", "Confidence"])
        st.subheader("📊 Top 10 Predictions (latest input)")
        st.bar_chart(df.set_index("Disease")["Confidence"])

# 🔹 Display chat history
st.subheader("💬 Chat History")
for sender, msg in st.session_state.history:
    if sender == "You":
        st.markdown(f"**👤 You:** {msg}")
    else:
        st.markdown(f"**🤖 Bot:** {msg}")
