from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from models.schemas import (
    ProblemRequest, 
    AIResponse, 
    TTSRequest, 
    TTSResponse,
    VisionData
)
from services.vision_service import extract_latex_from_image
from services.nlp_service import solve_and_explain
from services.tts_service import generate_speech

# Load environment variables
load_dotenv()

app = FastAPI(title="Math Professor Backend API")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "online", "message": "Math Professor Backend API"}


@app.post("/api/process-problem", response_model=AIResponse)
async def process_problem(request: ProblemRequest):
    """
    Main orchestration endpoint that decides whether to perform OCR first
    and then passes the problem to the NLP solver.
    """
    try:
        problem_text: str
        
        if request.isImage and request.imageData:
            # Module 1: Vision (OCR)
            problem_text = await extract_latex_from_image(request.imageData)
            if not problem_text:
                raise HTTPException(status_code=400, detail="Impossible de lire l'image.")
        else:
            problem_text = request.input
        
        # Module 2: NLP (Reasoning)
        result = await solve_and_explain(problem_text, request.history)
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Error processing problem: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors du traitement du problème.")


@app.post("/api/generate-speech", response_model=TTSResponse)
async def generate_tts(request: TTSRequest):
    """
    Generate speech from text using Gemini TTS.
    Falls back gracefully if quota is exceeded.
    """
    try:
        audio_data = await generate_speech(request.text)
        
        if audio_data:
            return TTSResponse(audio=audio_data)
        else:
            return TTSResponse(
                audio=None, 
                error="Quota exceeded, use browser fallback"
            )
            
    except Exception as e:
        print(f"Error generating speech: {e}")
        return TTSResponse(
            audio=None,
            error="TTS service error"
        )


@app.post("/api/extract-latex")
async def extract_latex(image_data: VisionData):
    """
    Extract LaTeX from an image using OCR.
    """
    try:
        latex = await extract_latex_from_image(image_data)
        return {"latex": latex}
    except Exception as e:
        print(f"Error extracting LaTeX: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'extraction LaTeX.")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
