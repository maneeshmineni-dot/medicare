import React, { useState, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Languages, ArrowRight } from 'lucide-react';
import { liveTranslationService } from '../../services/liveTranslationService';
import { speakText, stopSpeaking } from '../../utils/speechUtils';

export const LiveVoiceAgentModal = ({ isOpen, onClose }) => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('te');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);

  if (!isOpen) return null;

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await liveTranslationService.translate(inputText, 'auto', targetLang);
      setTranslatedText(res);
      setIsSpeaking(true);
      speakText(res, targetLang, () => setIsSpeaking(false));
    } catch (e) {
      setTranslatedText(inputText);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e) => {
        const spoken = e.results[0][0].transcript;
        if (spoken) setInputText(spoken);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handlePlayAudio = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (translatedText) {
      setIsSpeaking(true);
      speakText(translatedText, targetLang, () => setIsSpeaking(false));
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '16px',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div className="card" style={{
        maxWidth: '540px',
        width: '100%',
        padding: '28px',
        borderRadius: '28px',
        background: 'var(--md-sys-color-surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Languages size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
                Live Speech Translator
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                Real-time doctor-patient prescription and dosage translator
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--md-sys-color-surface-container-high)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--md-sys-color-on-surface)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Input Area */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>
              Clinical Instructions / Spoken Message:
            </label>
            <button
              type="button"
              onClick={toggleMic}
              style={{
                background: isListening ? '#ef4444' : 'var(--md-sys-color-surface-container-high)',
                color: isListening ? '#fff' : 'var(--md-sys-color-primary)',
                border: 'none',
                borderRadius: '999px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              {isListening ? 'Listening…' : 'Speak'}
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            className="search-input"
            style={{
              width: '100%',
              borderRadius: '16px',
              resize: 'none',
              padding: '12px 14px',
              fontSize: '0.92rem',
              lineHeight: 1.4
            }}
            placeholder="e.g. Take 1 tablet twice daily after meals with warm water. Avoid dairy products for 2 hours."
          />
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>Translate to:</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                background: 'var(--md-sys-color-surface-container-high)',
                color: 'var(--md-sys-color-on-surface)',
                fontWeight: 600,
                fontSize: '0.88rem'
              }}
            >
              <option value="te">తెలుగు (Telugu)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="es">Español (Spanish)</option>
              <option value="en">English (English)</option>
            </select>
          </div>

          <button
            onClick={handleTranslate}
            disabled={loading || !inputText.trim()}
            className="btn-primary"
            style={{
              marginLeft: 'auto',
              padding: '8px 18px',
              borderRadius: 'var(--r-full)',
              opacity: (!inputText.trim() || loading) ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {loading ? 'Translating…' : (
              <>
                Translate & Speak <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>

        {/* Translation Output */}
        {translatedText && (
          <div style={{
            background: 'var(--md-sys-color-surface-container)',
            padding: '18px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Localized Clinical Speech:
              </span>
              <button
                type="button"
                onClick={handlePlayAudio}
                style={{
                  background: isSpeaking ? '#ef4444' : 'var(--md-sys-color-primary-container)',
                  color: isSpeaking ? '#fff' : 'var(--md-sys-color-on-primary-container)',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={14} />
                {isSpeaking ? 'Stop Audio' : 'Play Audio'}
              </button>
            </div>
            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--md-sys-color-on-surface)', lineHeight: 1.5 }}>
              {translatedText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
