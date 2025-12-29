const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Process a math problem (text or image) and get AI response
 * @param {Object} params
 * @param {string} params.input - Text input or base64 image data
 * @param {boolean} params.isImage - Whether input is an image
 * @param {Array} params.history - Chat history
 * @param {Object} params.imageData - Image data object {data: string, mimeType: string}
 * @returns {Promise<Object>} AI response with solution and exercises
 */
export async function processProblem({ input, isImage, history = [], imageData = null }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/process-problem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input,
        isImage,
        history,
        imageData
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to process problem');
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing problem:', error);
    throw error;
  }
}

/**
 * Extract LaTeX from an image
 * @param {Object} imageData - {data: string, mimeType: string}
 * @returns {Promise<Object>} {latex: string}
 */
export async function extractLatex(imageData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/extract-latex`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imageData),
    });

    if (!response.ok) {
      throw new Error('Failed to extract LaTeX');
    }

    return await response.json();
  } catch (error) {
    console.error('Error extracting LaTeX:', error);
    throw error;
  }
}

/**
 * Generate speech from text using TTS
 * @param {string} text - Text to convert to speech
 * @returns {Promise<Object>} {audio: string|null, error: string|null}
 */
export async function generateSpeech(text) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating speech:', error);
    return { audio: null, error: error.message };
  }
}

/**
 * Convert File to base64 data URL
 * @param {File} file - Image file
 * @returns {Promise<Object>} {data: string, mimeType: string}
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
      resolve({
        data: base64,
        mimeType: file.type
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
