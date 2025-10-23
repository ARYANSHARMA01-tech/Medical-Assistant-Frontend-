# ================================================================
# 🩺 Doctors API Integration Module (Simplified)
# ================================================================

import os
import requests
from dotenv import load_dotenv

# ================================================================
# ⚙️ Load Environment Variables
# ================================================================
load_dotenv()

DOCTORS_API_KEY = os.getenv("DOCTORS_API_KEY")
if not DOCTORS_API_KEY:
    raise ValueError("❌ DOCTORS_API_KEY not found. Please add it to your .env file.")

# ================================================================
# 🌐 Base API URL
# ================================================================
BASE_URL = "https://doctorsapi.com/api/doctors"

# ================================================================
# 🔍 Function to search for doctors
# ================================================================
def get_doctors(disease: str = None, symptom: str = None):
    """
    Fetch doctors based only on disease or symptom.
    Example:
        get_doctors(disease="Diabetes")
        get_doctors(symptom="Fever")
    """

    params = {}
    if disease:
        params["disease"] = disease
    if symptom:
        params["symptom"] = symptom

    headers = {"api-key": DOCTORS_API_KEY}

    try:
        response = requests.get(BASE_URL, headers=headers, params=params, timeout=10)
        response.raise_for_status()

        # Ensure we can parse JSON safely
        try:
            data = response.json()
        except ValueError:
            return {"error": "Invalid response format from Doctors API."}

        # Check if data is list-like
        if isinstance(data, dict) and "doctors" in data:
            data = data["doctors"]
        elif not isinstance(data, list):
            return {"message": "Unexpected API response structure.", "raw": data}

        if not data:
            return {"message": "No doctors found for the given disease or symptom."}

        # Build structured doctor list
        doctors_list = []
        for doc in data:
            if isinstance(doc, dict):
                doctors_list.append({
                    "name": doc.get("name"),
                    "specialization": doc.get("specialization"),
                    "hospital": doc.get("hospital"),
                    "address": doc.get("address"),
                    "contact": doc.get("phone"),
                    "rating": doc.get("rating"),
                })
            else:
                doctors_list.append({"raw_entry": doc})

        return {"count": len(doctors_list), "doctors": doctors_list}

    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to fetch doctors: {str(e)}"}
