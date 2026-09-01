import React, { useState, useEffect } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, Sparkles, Heart, Flower2, Moon, Sun, Shield, RotateCcw
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { speakText, stopSpeaking, playGentleTone } from '../../utils/speechUtils';

const THERAPY_LANGUAGES = [
  { code: 'en', label: 'English (EN)', flag: '🇬🇧' },
  { code: 'te', label: 'తెలుగు (TE)', flag: '🇮🇳' },
  { code: 'hi', label: 'हिंदी (HI)', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ் (TA)', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ (KN)', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা (BN)', flag: '🇮🇳' },
  { code: 'as', label: 'অসমীয়া (AS)', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी (MR)', flag: '🇮🇳' }
];

const THERAPY_FOCUS_MODES = [
  {
    id: 'calm',
    icon: '🌸',
    label: 'Calming & Anxiety Relief',
    desc: 'Deep rhythmic breathing & gentle anxiety relief'
  },
  {
    id: 'morning',
    icon: '☀️',
    label: 'Morning Motivation',
    desc: 'Uplifting sunrise affirmations & daily focus'
  },
  {
    id: 'night',
    icon: '🌙',
    label: 'Night Peace / Sleep Aid',
    desc: 'Soft tranquil meditation for restful sleep'
  },
  {
    id: 'reminiscence',
    icon: '🌿',
    label: 'Reminiscence Therapy',
    desc: 'Fond memories, family nostalgia & comfort'
  }
];

export const VoiceTherapistRoom = () => {
  const { t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState('en');
  const [activeMode, setActiveMode] = useState('calm');
  const [therapistSpeech, setTherapistSpeech] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fetchTherapyGuidance = async (mode = activeMode, lang = selectedLang) => {
    setLoading(true);
    stopSpeaking();
    playGentleTone(432, 1.2);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/therapy/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          language: lang,
          patientName: 'Friend'
        })
      });
      const data = await res.json();
      const speech = data.response || 'Take a deep gentle breath. You are safe and surrounded by love.';
      setTherapistSpeech(speech);
      handleSpeak(speech, lang);
    } catch (e) {
      const fallback = 'Take a deep gentle breath. You are safe, relaxed, and peaceful.';
      setTherapistSpeech(fallback);
      handleSpeak(fallback, lang);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text, lang) => {
    setIsSpeaking(true);
    speakText(text, lang, () => setIsSpeaking(false));
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  useEffect(() => {
    fetchTherapyGuidance(activeMode, selectedLang);
    return () => stopSpeaking();
  }, [activeMode, selectedLang]);

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Room Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          margin: '0 auto 14px',
          boxShadow: '0 8px 30px rgba(236, 72, 153, 0.35)'
        }}>
          <Flower2 size={32} />
        </div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Voice Therapy Room
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--md-sys-color-on-surface-variant)', margin: 0 }}>
          Gentle, multilingual audio companions for elderly emotional comfort & calm
        </p>
      </div>

      {/* Language Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
        {THERAPY_LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => setSelectedLang(lang.code)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--r-full)',
              border: selectedLang === lang.code ? '2px solid #8b5cf6' : '1px solid var(--border)',
              background: selectedLang === lang.code ? '#ede9fe' : 'var(--md-sys-color-surface)',
              color: selectedLang === lang.code ? '#6d28d9' : 'var(--md-sys-color-on-surface)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {lang.flag} {lang.label}
          </button>
        ))}
      </div>

      {/* Mode Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
        {THERAPY_FOCUS_MODES.map(mode => (
          <div
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            style={{
              padding: '18px',
              borderRadius: '20px',
              border: activeMode === mode.id ? '2px solid #ec4899' : '1px solid var(--border)',
              background: activeMode === mode.id ? 'rgba(236, 72, 153, 0.08)' : 'var(--md-sys-color-surface-container)',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{mode.icon}</div>
            <h4 style={{ margin: '0 0 4px', fontSize: '0.98rem', fontWeight: 800 }}>{mode.label}</h4>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.4 }}>
              {mode.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Spoken Guidance Card */}
      <div className="card" style={{ padding: '32px', borderRadius: '28px', border: '1px solid var(--border)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="#ec4899" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#ec4899' }}>
              Companion Voice
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {isSpeaking ? (
              <button
                onClick={handleStopSpeaking}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--r-full)',
                  border: 'none',
                  background: '#fef2f2',
                  color: '#ef4444',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <VolumeX size={16} /> Mute
              </button>
            ) : (
              <button
                onClick={() => handleSpeak(therapistSpeech, selectedLang)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--r-full)',
                  border: 'none',
                  background: '#ecfdf5',
                  color: '#10b981',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={16} /> Listen Again
              </button>
            )}

            <button
              onClick={() => fetchTherapyGuidance(activeMode, selectedLang)}
              disabled={loading}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-full)',
                border: '1px solid var(--border)',
                background: 'var(--md-sys-color-surface)',
                color: 'var(--md-sys-color-on-surface)',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} /> Refresh
            </button>
          </div>
        </div>

        <p style={{
          fontSize: '1.25rem',
          lineHeight: 1.7,
          color: 'var(--md-sys-color-on-surface)',
          margin: '0 0 20px',
          fontWeight: 500,
          fontStyle: 'italic'
        }}>
          "{therapistSpeech}"
        </p>

        <div style={{
          padding: '12px 18px',
          borderRadius: '16px',
          background: 'var(--md-sys-color-surface-container-high)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.85rem',
          color: 'var(--md-sys-color-on-surface-variant)'
        }}>
          <Shield size={18} color="#8b5cf6" />
          <span>Gentle 432Hz ambient frequency tuning active for relaxation.</span>
        </div>
      </div>
    </div>
  );
};
