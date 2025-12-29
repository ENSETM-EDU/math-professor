from gtts import gTTS
import os
import base64
from io import BytesIO
from typing import Optional


async def generate_speech(text: str) -> Optional[str]:
    """
    Generates speech from text using gTTS (Google Text-to-Speech).
    Returns base64 encoded audio data or None if error occurs.
    """
    try:
        # Create gTTS object with French language
        tts = gTTS(text=text, lang='fr', slow=False)
        
        # Save to BytesIO buffer
        audio_buffer = BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        
        # Encode to base64
        audio_base64 = base64.b64encode(audio_buffer.read()).decode('utf-8')
        
        return audio_base64
        
    except Exception as error:
        print(f"TTS Service Error: {error}")
        return None
