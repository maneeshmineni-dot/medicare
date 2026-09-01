import React, { useState } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles } from 'lucide-react';
import { liveTranslationService } from '../../services/liveTranslationService';
import { speakText } from '../../utils/speechUtils';

export const LiveVoiceAgentModal = ({ isOpen, onClose }) => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('te');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await liveTranslationService.translate(inputText, 'en', targetLang);
      setTranslatedText(res);
      speakText(res, targetLang);
    } catch (e) {
      setTranslatedText(inputText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '16px'
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '24px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Live Speech Translator</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Doctor / Patient English Text:</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            className="search-input"
            style={{ width: '100%', marginTop: '6px', borderRadius: '12px', resize: 'none' }}
            placeholder="e.g. Take two tablets after dinner and drink plenty of warm water."
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '18px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>Translate to:</label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--md-sys-color-surface)',
              color: 'var(--md-sys-color-on-surface)'
            }}
          >
            <option value="te">తెలుగు (Telugu)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="es">Español (Spanish)</option>
          </select>

          <button
            onClick={handleTranslate}
            disabled={loading}
            className="btn-primary"
            style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: 'var(--r-full)' }}
          >
            {loading ? 'Translating…' : 'Translate & Speak'}
          </button>
        </div>

        {translatedText && (
          <div style={{
            background: 'var(--md-sys-color-surface-container)',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid var(--border)'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '4px' }}>
              Translation:
            </div>
            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>{translatedText}</p>
          </div>
        )}
      </div>
    </div>
  );
};
