import { generateSpeech } from './api';

let audioContext = null;
let currentSource = null;
let isSpeaking = false;

/**
 * Clean text before TTS (remove LaTeX, markdown, etc.)
 * @param {string} text - Original text
 * @returns {string} - Cleaned text
 */
function cleanTextForSpeech(text) {
  if (!text) return '';

  let cleaned = text;

  // Convert common LaTeX patterns to spoken form
  cleaned = cleaned.replace(/\$\$([^\$]+)\$\$/g, (match, equation) => {
    return convertLatexToSpeech(equation);
  });
  cleaned = cleaned.replace(/\$([^\$]+)\$/g, (match, equation) => {
    return convertLatexToSpeech(equation);
  });

  // Remove markdown bold/italic
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');

  // Remove image references
  cleaned = cleaned.replace(/📷\s*[Ii]mage\s+envoyée?/g, '');
  cleaned = cleaned.replace(/\[image\]/gi, '');

  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Convert LaTeX equation to spoken form
 * @param {string} latex - LaTeX equation
 * @returns {string} - Spoken form
 */
function convertLatexToSpeech(latex) {
  let spoken = latex;

  // Remove all $ symbols
  spoken = spoken.replace(/\$/g, '');

  // Convert operators
  spoken = spoken.replace(/\+/g, ' plus ');
  spoken = spoken.replace(/-/g, ' moins ');
  spoken = spoken.replace(/\*/g, ' fois ');
  spoken = spoken.replace(/\//g, ' divisé par ');
  spoken = spoken.replace(/=/g, ' égal ');

  // Convert powers
  spoken = spoken.replace(/\^(\d+)/g, ' puissance $1 ');
  spoken = spoken.replace(/\^{(\d+)}/g, ' puissance $1 ');

  // Convert fractions
  spoken = spoken.replace(/\\frac{([^}]+)}{([^}]+)}/g, '$1 sur $2');

  // Convert square root
  spoken = spoken.replace(/\\sqrt{([^}]+)}/g, 'racine de $1');
  spoken = spoken.replace(/√/g, 'racine de');

  // Clean up extra spaces
  spoken = spoken.replace(/\s+/g, ' ').trim();

  return spoken;
}

/**
 * Initialize audio context
 */
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Stop currently playing audio
 */
export function stopSpeech() {
  if (currentSource) {
    try {
      currentSource.stop();
      currentSource.disconnect();
    } catch (e) {
      // Already stopped
    }
    currentSource = null;
  }
  isSpeaking = false;
}

/**
 * Play text as speech using backend TTS
 * @param {string} text - Text to speak
 * @param {Object} callbacks - onStart, onEnd callbacks
 * @returns {Promise<boolean>} - true if successful
 */
export async function speakText(text, { onStart, onEnd } = {}) {
  // Prevent double calling
  if (isSpeaking) {
    console.log("Speech already in progress, skipping...");
    return false;
  }

  try {
    isSpeaking = true;
    if (onStart) onStart();
    stopSpeech();

    // Clean text before speaking
    const cleanedText = cleanTextForSpeech(text);

    if (!cleanedText || cleanedText.length < 2) {
      isSpeaking = false;
      return false; // Don't speak empty or very short text
    }

    // Get audio from backend
    const response = await generateSpeech(cleanedText);

    if (!response.audio) {
      // Fallback to browser TTS
      return browserSpeakText(text, { onEnd });
    }

    // Decode base64 audio
    const audioData = atob(response.audio);
    const arrayBuffer = new ArrayBuffer(audioData.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < audioData.length; i++) {
      view[i] = audioData.charCodeAt(i);
    }

    // Play audio
    const ctx = getAudioContext();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    currentSource = ctx.createBufferSource();
    currentSource.buffer = audioBuffer;
    currentSource.connect(ctx.destination);

    // Reset flag when audio ends
    currentSource.onended = () => {
      isSpeaking = false;
      if (onEnd) onEnd();
    };

    currentSource.start(0);

    return true;
  } catch (error) {
    console.error('TTS Error:', error);
    // Fallback to browser TTS
    return browserSpeakText(text, { onEnd });
  }
}

/**
 * Fallback: Use browser's native speech synthesis
 * @param {string} text - Text to speak
 * @param {Object} callbacks - onEnd callback
 * @returns {boolean}
 */
function browserSpeakText(text, { onEnd } = {}) {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      // Reset flag when speech ends
      utterance.onend = () => {
        isSpeaking = false;
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
      return true;
    }
    isSpeaking = false;
    if (onEnd) onEnd();
    return false;
  } catch (error) {
    console.error('Browser TTS Error:', error);
    isSpeaking = false;
    if (onEnd) onEnd();
    return false;
  }
}
