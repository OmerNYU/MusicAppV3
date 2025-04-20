# ========== Imports ==========
import os
import cv2
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deepface import DeepFace
import google.generativeai as genai

# ========== Load Environment Variables ==========
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# ========== Configure Gemini ==========
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# ========== FastAPI Setup ==========
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== Models ==========
class MoodInput(BaseModel):
    mood_description: str

# ========== Helper Functions ==========
def analyze_emotion(img) -> dict:
    result = DeepFace.analyze(
        img,
        actions=['emotion'],
        detector_backend='retinaface',
        enforce_detection=False
    )
    data = result[0]
    dominant_emotion = data["dominant_emotion"].strip().lower()
    raw_emotions = data["emotion"]
    emotions = {k: float(v) for k, v in raw_emotions.items()}
    return {"dominant_emotion": dominant_emotion, "emotions": emotions}

# ========== Routes ==========
@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        img_bytes = await file.read()
        img_array = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        emotion_data = analyze_emotion(img)
        return {
            "dominant_emotion": emotion_data["dominant_emotion"],
            "emotions": emotion_data["emotions"]
        }

    except Exception as e:
        print("Analyze error:", e)
        return {"error": str(e)}

@app.post("/ai-recommend")
async def ai_recommend(data: MoodInput):
    """
    Accepts mood_description and asks Gemini for song recommendations.
    """
    try:
        mood = data.mood_description.strip()

        # Create prompt for Gemini
        prompt = (
            f"Based on the following mood: '{mood}', "
            f"suggest 3 songs that would emotionally fit this mood. "
            f"Return only the song titles and artists in the format 'Title - Artist', one per line."
        )

        # Generate content using Gemini
        response = model.generate_content(prompt)
        
        if not response.text:
            return {"error": "No response from Gemini API"}

        return {"suggested_songs": response.text.strip()}

    except Exception as e:
        return {"error": str(e)}
