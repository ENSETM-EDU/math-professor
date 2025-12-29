# Math Professor - Documentation Technique

## Vue d'ensemble

Math Professor est une application interactive d'enseignement des mathématiques avec un professeur virtuel en 3D. L'application utilise l'intelligence artificielle pour résoudre des problèmes mathématiques, expliquer les solutions, et générer des exercices personnalisés.

## Architecture

### Frontend (React + Three.js)
- **Framework**: React 19.2.3 avec Vite 7.3.0
- **3D Engine**: Three.js avec @react-three/fiber et @react-three/drei
- **Rendu LaTeX**: KaTeX avec react-katex
- **Port**: 5174

### Backend (FastAPI)
- **Framework**: FastAPI 0.115.6
- **Serveur**: Uvicorn 0.34.0
- **Port**: 8000

## Modèles IA (Groq Cloud API)

### 1. **Raisonnement Mathématique** - `openai/gpt-oss-20b`
- **Usage**: Résolution de problèmes et génération d'explications
- **Technique**: Self-consistency avec 3 échantillons (température 0.8)
- **Capacités**: 
  - Résolution d'équations
  - Explications pédagogiques
  - Génération d'exercices d'entraînement
  - Support du format LaTeX

### 2. **Vision/OCR** - `meta-llama/llama-4-scout-17b-16e-instruct`
- **Usage**: Extraction de problèmes mathématiques depuis des images
- **Capacités**:
  - OCR de formules mathématiques
  - Conversion en LaTeX
  - Reconnaissance d'équations manuscrites

### 3. **TTS** - gTTS (Google Text-to-Speech)
- **Usage**: Synthèse vocale des explications
- **Langue**: Français
- **Fallback**: API Web Speech (navigateur)

## Workflow de l'Application

### 1. **Initialisation**
```
App Mount → Affichage Avatar 3D → TTS Message de bienvenue
```

### 2. **Question Textuelle**
```
User Input → Backend API → NLP Service (GPT-OSS-20B)
  ↓
Detection: Math Problem?
  ├─ OUI → JSON structuré (LaTeX, solution, exercices)
  └─ NON → Réponse conversationnelle simple
  ↓
Frontend → Affichage + Rendu LaTeX + TTS
```

### 3. **Upload d'Image**
```
User Upload → Base64 Encoding → Backend API
  ↓
Vision Service (Llama-4-Scout) → Extraction LaTeX
  ↓
NLP Service → Résolution + Explication
  ↓
Frontend → Affichage Board + Messages + TTS
```

### 4. **Exercices Interactifs**
```
User Request → Backend Génération JSON
  ↓
{
  "question": "$2x + 5 = 11$",
  "options": ["x = 3", "x = 6", ...],
  "correctAnswer": "x = 3"
}
  ↓
Board Display → User Selection → Evaluation + Feedback + TTS
```

## Composants Principaux

### Frontend

#### `App.jsx`
- **Rôle**: Orchestration principale
- **State Management**: 
  - Messages chat
  - Historique conversation
  - État des exercices
  - Contenu du tableau
- **Logique**: 
  - Gestion des types de messages (texte, image, QCM)
  - Intégration API backend
  - Déclenchement TTS

#### `Experience.jsx`
- **Rôle**: Scène 3D avec Three.js
- **Contenu**:
  - Avatar animé (idle, talk, celebrate)
  - Tableau blanc avec LaTeX
  - Affichage QCM interactif
  - Environnement 3D

#### `Interface.jsx`
- **Rôle**: Interface utilisateur chat
- **Features**:
  - Input texte et image
  - Affichage messages avec LaTeX
  - Boutons d'action (exercices, réponses)
  - Aperçu images uploadées

#### `Avatar.jsx`
- **Rôle**: Contrôle animations 3D
- **Animations**:
  - `idle`: État repos avec variations
  - `talk`: Parle pendant TTS
  - `celebrate`: Félicitations (bonne réponse)

### Backend

#### `main.py`
- **Endpoints**:
  - `POST /api/process-problem`: Traitement problèmes
  - `POST /api/generate-speech`: Génération audio TTS
  - `POST /api/extract-latex`: Extraction LaTeX images
- **CORS**: Activé pour ports 5173, 5174, 3000

#### `services/nlp_service.py`
- **Fonction**: `solve_and_explain()`
- **Détection**: `is_math_problem()` (regex patterns)
- **Prompts**:
  - `SYSTEM_PROMPT_SIMPLE`: Conversations générales
  - `SYSTEM_PROMPT_MATH`: Problèmes mathématiques
- **Self-Consistency**: 3 générations, sélection meilleure réponse

#### `services/vision_service.py`
- **Fonction**: `extract_latex_from_image()`
- **Input**: Base64 image
- **Output**: LaTeX string
- **Model**: Llama-4-Scout avec prompt OCR spécialisé

#### `services/tts_service.py`
- **Fonction**: `generate_speech()`
- **Library**: gTTS
- **Output**: Base64 MP3 audio

### Services Frontend

#### `tts.js`
- **Features**:
  - Nettoyage texte (suppression LaTeX, markdown)
  - Conversion LaTeX en langage parlé
  - Flag `isSpeaking` (prévention doublons)
  - Fallback browser TTS

#### `api.js`
- **Client HTTP**: Fetch API
- **Base URL**: `http://localhost:8000`
- **Functions**:
  - `processProblem()`: Envoi problèmes
  - `extractLatex()`: OCR images
  - `generateSpeech()`: Demande audio
  - `fileToBase64()`: Conversion images

## Fonctionnalités Clés

### 1. **Rendu LaTeX Intelligent**
- Inline: `$...$` → InlineMath
- Block: `$$...$$` → BlockMath
- Nettoyage symboles $ pour affichage Board

### 2. **TTS Contextuel**
- Conversion LaTeX en français parlé
  - `$2x + 5 = 11$` → "2 x plus 5 égal 11"
  - `$x^2$` → "x puissance 2"
  - `$\frac{3}{4}$` → "3 sur 4"
- Suppression emojis et markdown

### 3. **Mémoire Conversationnelle**
- Historique maintenu dans `chatHistory`
- Contexte envoyé à chaque requête API
- Évaluation exercices avec historique

### 4. **Self-Consistency**
- 3 générations par problème
- Température 0.8 (diversité)
- Sélection première réponse valide
- Fallback en cas d'échec parsing JSON

### 5. **Gestion États Avatar**
- `idle`: Au repos (avec variations aléatoires)
- `talk`: Pendant TTS/explication
- `celebrate`: Bonne réponse élève

## Configuration

### Variables d'Environnement (Backend)
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=8000
```

### Installation

#### Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
npm install
npm run dev
```

## Flux de Données

```
┌─────────────┐
│   User UI   │
└──────┬──────┘
       │ Input (Texte/Image/Clic)
       ▼
┌─────────────┐
│   App.jsx   │──────┐
└──────┬──────┘      │
       │             │ TTS Request
       │ API Call    ▼
       ▼        ┌──────────┐
┌─────────────┐ │  tts.js  │
│  Backend    │ └──────────┘
│  FastAPI    │
└──────┬──────┘
       │
       ├─ NLP (Groq GPT-OSS-20B)
       ├─ Vision (Llama-4-Scout)
       └─ TTS (gTTS)
       │
       ▼
┌─────────────┐
│  Response   │
│  JSON/Audio │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Experience  │ Affichage 3D + Board
│ Interface   │ Chat + Messages
└─────────────┘
```

## Points Techniques Importants

### 1. **Prévention Double TTS**
- `useRef` pour `hasPlayedWelcome`
- Flag `isSpeaking` dans tts.js
- Callbacks `onended`/`onend` pour reset

### 2. **Parsing JSON Robuste**
- Try direct JSON.parse()
- Fallback regex extraction
- Default values si échec
- Pas d'erreur 500, toujours réponse valide

### 3. **Détection Math Problem**
- Skip si mots "génère", "json", "format"
- Patterns regex pour opérations mathématiques
- Variables algébriques (x, y)
- Symboles mathématiques (√, ∫, π, etc.)

### 4. **Gestion Erreurs**
- Try-catch tous les appels API
- Messages d'erreur utilisateur friendly
- Logging console détaillé (debug)
- Fallback responses toujours disponibles

## Performance

- **Temps réponse moyen**: 2-4 secondes
- **Self-consistency**: ~6-8 secondes (3 générations)
- **OCR images**: 3-5 secondes
- **TTS**: Quasi-instantané (cache possible)

## Limitations Connues

1. **OCR**: Qualité dépend de l'écriture (manuscrite difficile)
2. **JSON Parsing**: IA peut générer JSON invalide parfois
3. **TTS French**: Accents et prononciation non parfaits
4. **Self-consistency**: Seulement première réponse utilisée (pas de vote)

## Améliorations Futures

- [ ] Système de vote pour self-consistency
- [ ] Support multi-langues
- [ ] Sauvegarde historique conversations
- [ ] Exercices adaptatifs (difficulté progressive)
- [ ] Statistiques progression élève
- [ ] Export PDF solutions
