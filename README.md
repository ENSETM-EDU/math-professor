# 🎓 Professeur de Mathématiques - Avatar 3D Interactif

Ce projet est une application React immersive utilisant **Three.js** et **React Three Fiber (R3F)** pour créer un professeur de mathématiques virtuel. Il combine des animations 3D réalistes, un système de chat et un tableau blanc interactif pour l'enseignement.

## 🚀 Vue d'ensemble de l'implémentation

L'architecture repose sur une séparation claire entre la scène 3D (R3F), la logique applicative (React hooks/state) et l'interface utilisateur (HTML/CSS).

### 1. Composants Clés

*   **`App.jsx`** : Le chef d'orchestre. Il gère l'état global (messages, contenu du tableau, état de l'avatar) et coordonne les interactions entre le chat et la scène 3D.
*   **`Avatar.jsx`** : Intègre le modèle 3D (Ready Player Me). Il gère :
    *   Le chargement des fichiers GLB (modèle + animations).
    *   Les transitions fluides entre les états (`idle`, `talk`, `celebrate`).
    *   Le **clignement d'yeux automatique** et le **suivi du regard** (l'avatar regarde la caméra).
*   **`Experience.jsx`** : Définit l'environnement 3D. Il contient les lumières, le décor et surtout le **Whiteboard** (tableau blanc) qui affiche les équations et les QCM.
*   **`Interface.jsx`** : L'interface de chat (UI) permettant à l'élève de poser des questions et de recevoir des explications.
*   **`WelcomeUI.jsx` & `useWelcomeManager.js`** : Gèrent la séquence d'accueil. Si c'est la première visite, l'avatar se présente vocalement avec une animation synchronisée.

### 2. Fonctionnalités Avancées

*   **Animations Contextuelles** : L'avatar change d'animation selon la situation (il danse quand vous répondez juste à un QCM !).
*   **Tableau Dynamique** : Le contenu du tableau se met à jour en temps réel selon les explications données dans le chat.
*   **Système de QCM** : Une logique intégrée permet d'afficher des questions interactives directement sur le tableau blanc avec validation des réponses.

## 🛠️ Installation et Lancement

Pour installer et lancer le projet localement :

```bash
# Installation des dépendances
yarn

# Lancement en mode développement
yarn dev 
```

L'application sera accessible sur `http://localhost:5173`.

## 💡 Guide pour compléter le projet

Mes camarades, voici quelques pistes pour améliorer cette version :
1.  **Intégration LLM** : Remplacer les réponses simulées dans `App.jsx` par un appel à une API (comme Gemini ou OpenAI).
2.  **Synthèse Vocale (TTS)** : Utiliser l'API Web Speech ou ElevenLabs pour que l'avatar parle réellement à chaque message.
3.  **Analyse d'Images** : Ajouter la possibilité d'uploader une photo d'exercice pour que le prof puisse l'analyser.
4.  **Plus d'animations** : Ajouter des animations spécifiques pour l'explication (pointe du doigt vers le tableau).

---
*Projet développé dans le cadre du module [Nom du Module/Cours].*
