from pydantic import BaseModel
from typing import List, Optional


class VisionData(BaseModel):
    data: str
    mimeType: str


class HistoryMessage(BaseModel):
    role: str
    content: str


class Exercise(BaseModel):
    difficulty: str
    problem: str
    options: List[str] = []
    correctAnswer: str = ""


class AIResponse(BaseModel):
    latex: str
    solution: List[str]
    explanation: str
    exercises: List[Exercise]
    followUp: str


class ProblemRequest(BaseModel):
    input: str
    isImage: bool
    history: List[HistoryMessage] = []
    imageData: Optional[VisionData] = None


class TTSRequest(BaseModel):
    text: str


class TTSResponse(BaseModel):
    audio: Optional[str] = None
    error: Optional[str] = None
