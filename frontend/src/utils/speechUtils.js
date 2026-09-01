/**
 * Multilingual Speech Synthesis & Web Audio Therapy Tone Utility
 * Supports English, Telugu, Hindi, Tamil, Kannada, Bengali, Assamese, and Marathi.
 */

const LANG_CODE_MAP = {
  en: 'en-US',
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  bn: 'bn-IN',
  as: 'as-IN',
  mr: 'mr-IN',
  es: 'es-ES',
  fr: 'fr-FR'
};

export function speakText(text, lang = 'en', onEndCallback = null) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    if (onEndCallback) onEndCallback();
    return;
  }

  // Cancel ongoing speech
  window.speechSynthesis.cancel();

  if (!text || typeof text !== 'string') return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG_CODE_MAP[lang] || 'en-US';
  utterance.rate = 0.90; // Calming pace
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const targetPrefix = (LANG_CODE_MAP[lang] || 'en').substring(0, 2);
  const matchingVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(targetPrefix.toLowerCase()));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  if (onEndCallback) {
    utterance.onend = onEndCallback;
    utterance.onerror = onEndCallback;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Synthesizes a soothing meditative chime/bell using Web Audio API
 */
export function playGentleTone(frequency = 432, durationSeconds = 1.5) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Smooth envelope attack and decay
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSeconds);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationSeconds);
  } catch (e) {
    console.warn('[AudioChime] Synthesis notice:', e.message);
  }
}

