/**
 * Continuous / Push-to-Talk Speech Recognition & Voice Control Service
 */

class VoiceControlService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onResultCallback = null;
    this.onErrorCallback = null;

    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (this.onResultCallback) this.onResultCallback(transcript);
        };

        this.recognition.onerror = (event) => {
          console.warn('[VoiceControlService] Recognition error:', event.error);
          this.isListening = false;
          if (this.onErrorCallback) this.onErrorCallback(event.error);
        };

        this.recognition.onend = () => {
          this.isListening = false;
        };
      }
    }
  }

  isSupported() {
    return Boolean(this.recognition);
  }

  startListening(onResult, onError, lang = 'en-US') {
    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser.');
      return;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.recognition.lang = lang;

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (e) {
      this.isListening = false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }

  async dispatchVoiceCommand(transcript, navigate) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/voice/process-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: transcript })
      });
      const data = await res.json();
      if (data?.targetRoute && navigate) {
        navigate(data.targetRoute);
      }
      return data;
    } catch (e) {
      // Local fallback navigation
      const lower = transcript.toLowerCase();
      if (lower.includes('scan') && navigate) navigate('/scanner');
      else if (lower.includes('cabinet') && navigate) navigate('/cabinet');
      else if (lower.includes('memory') && navigate) navigate('/memory-assistance');
      else if (lower.includes('therapy') && navigate) navigate('/voice-therapy');
      else if (lower.includes('caregiver') && navigate) navigate('/caregiver');
      return { spokenFeedback: `Navigating based on "${transcript}"` };
    }
  }
}

export const voiceControlService = new VoiceControlService();
