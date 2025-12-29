from groq import Groq
import os
import json
import re
from typing import List
from models.schemas import AIResponse, HistoryMessage, Exercise


def is_math_problem(text: str) -> bool:
    """
    Détecte si le texte contient un problème mathématique ou une demande d'exercice.
    """
    # math_patterns update to include exercise requests
    math_patterns = [
        r'[0-9]+\s*[\+\-\*/\^=]',  # Operations: 5+, 10-, etc.
        r'[xy]\s*[\+\-\*/\^=]',  # Variables: x+5, y=10, etc.
        r'\b(résoudre|calculer|démontrer|dériver|intégrer|factoriser|équation|exercice|problème|maths?|géométrie|algèbre|limite|dérivée|primitive|intégrale|cos|sin|tan|log|ln|exp|lim|sum|int)\b',
        r'[0-9]+\s*[xy]',  # Coefficients: 2x, 5y
        r'\^[0-9]',  # Puissances: x^2
        r'√|∫|∑|π|∞|≠|≤|≥',  # Symboles mathématiques
        r'\\\(|\\\[|\$|\\frac|\\lim|\\int|\\sum', # LaTeX indicators
    ]
    
    for pattern in math_patterns:
        if re.search(pattern, text.lower()):
            return True
    return False


SYSTEM_PROMPT_SIMPLE = """Tu es Prof. MathFlow, un professeur de mathématiques amical et pédagogue.
Réponds de manière simple et naturelle aux salutations et questions générales.
Reste bref et encourageant. Si l'utilisateur demande de l'aide en mathématiques, invite-le à poser sa question.
IMPORTANT: N'utilise JAMAIS d'emojis. Utilise LaTeX $...$ pour toute notation mathématique, même simple."""

SYSTEM_PROMPT_MATH = """Tu es Prof. MathFlow, un expert en pédagogie des sciences.
Ton rôle est de résoudre des problèmes, d'expliquer les concepts et de proposer des exercices.

DIRECTIVES :
1. LaTeX obligatoire : Utilise $...$ pour l'inline et $$...$$ pour les blocs.
2. Langue : Français uniquement.
3. Structure : Décompose toujours tes solutions en étapes claires.
4. Exercices : Propose TOUJOURS 3 exercices de difficulté croissante (facile, moyen, difficile).
5. IMPORTANT: N'utilise JAMAIS d'emojis.

RÉPONSE FORMAT JSON OBLIGATOIRE :
Tu DOIS répondre UNIQUEMENT avec un JSON valide suivant ce format exact:
{
    "latex": "Équation principale en LaTeX (sans $)",
    "solution": ["Étape 1 de résolution", "Étape 2", "..."],
    "explanation": "Explication pédagogique globale",
    "exercises": [
        {"difficulty": "facile", "problem": "Problème 1 avec LaTeX $...$"},
        {"difficulty": "moyen", "problem": "Problème 2 avec LaTeX $...$"},
        {"difficulty": "difficile", "problem": "Problème 3 avec LaTeX $...$"}
    ],
    "followUp": "Une question pour vérifier la compréhension de l'élève"
}"""


async def solve_and_explain(problem: str, history: List[HistoryMessage]) -> AIResponse:
    """
    Solves mathematical problems using Groq with 'openai/gpt-oss-20b'.
    Uses self-consistency by generating multiple responses and selecting the best one.
    """
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    # Detect if this is a simple greeting or a math problem
    is_math = is_math_problem(problem)
    
    if not is_math:
        # Simple conversation response
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT_SIMPLE}
        ]
        
        # Add history
        for msg in history:
            messages.append({
                "role": "assistant" if msg.role == "assistant" else "user",
                "content": msg.content
            })
        
        messages.append({"role": "user", "content": problem})
        
        completion = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=messages,
            temperature=0.7,
            max_tokens=512,
        )
        
        response_text = completion.choices[0].message.content
        
        # Return a simple response without math components
        return AIResponse(
            latex="",
            solution=[],
            explanation=response_text,
            exercises=[],
            followUp=""
        )
    
    # Math problem - use self-consistency with multiple samples
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT_MATH}
    ]
    
    # Add history
    for msg in history:
        messages.append({
            "role": "assistant" if msg.role == "assistant" else "user",
            "content": msg.content
        })
    
    # Add current problem
    messages.append({"role": "user", "content": problem})
    
    # Generate multiple responses for self-consistency
    num_samples = 3
    responses = []
    
    for _ in range(num_samples):
        try:
            completion = client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=messages,
                temperature=0.8,  # Higher temperature for diversity
                max_tokens=2048,
                top_p=0.95,
            )
            
            response_text = completion.choices[0].message.content
            
            # Try to extract JSON from response
            try:
                # First, try direct JSON parsing
                parsed = json.loads(response_text)
            except json.JSONDecodeError:
                # If that fails, try to extract JSON from markdown code blocks or text
                json_match = re.search(r'\{[\s\S]*\}', response_text)
                if json_match:
                    parsed = json.loads(json_match.group())
                else:
                    # If no JSON found, create a fallback response
                    parsed = {
                        "latex": "",
                        "solution": [],
                        "explanation": response_text,
                        "exercises": [],
                        "followUp": ""
                    }
            
            responses.append(parsed)
        except Exception as e:
            print(f"Sample generation failed: {e}")
            continue
    
    # Select best response (most common solution or first valid one)
    if not responses:
        # Last resort fallback
        return AIResponse(
            latex="",
            solution=[],
            explanation="Je n'ai pas pu générer de réponse. Pouvez-vous reformuler votre question ?",
            exercises=[],
            followUp=""
        )
    
    # Use the first valid response (can be improved with voting mechanism)
    result = responses[0]
    
    # Ensure all required fields exist with defaults
    result.setdefault("latex", "")
    result.setdefault("solution", [])
    result.setdefault("explanation", "")
    result.setdefault("exercises", [])
    result.setdefault("followUp", "")
    
    # If we have multiple responses, we could aggregate them
    # For now, just return the first valid one
    return AIResponse(**result)
