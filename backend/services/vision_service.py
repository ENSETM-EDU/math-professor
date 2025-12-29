from groq import Groq
import os
from models.schemas import VisionData


async def extract_latex_from_image(image: VisionData) -> str:
    """
    Extracts LaTeX from an image using Groq Vision capabilities.
    Using 'meta-llama/llama-4-scout-17b-16e-instruct' for OCR.
    """
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    # Create the prompt
    prompt = "Agis comme un expert OCR mathématique. Extrais l'équation ou le problème de cette image et convertis-le en LaTeX pur. Ne renvoie QUE le code LaTeX sans texte autour."
    
    # Generate content with image
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{image.mimeType};base64,{image.data}",
                        },
                    },
                ],
            }
        ],
        model="meta-llama/llama-4-scout-17b-16e-instruct",
    )
    
    return chat_completion.choices[0].message.content.strip() if chat_completion.choices[0].message.content else ""
