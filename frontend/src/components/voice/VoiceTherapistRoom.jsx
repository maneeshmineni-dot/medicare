import React, { useState, useEffect } from 'react';
import {
  Mic, MicOff, Volume2, VolumeX, Sparkles, Heart, Flower2, Moon, Sun, Shield, RotateCcw, Pill
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { reminderScheduler } from '../../services/reminderScheduler';
import { speakText, stopSpeaking, playGentleTone } from '../../utils/speechUtils';

const THERAPY_LANGUAGES = [
  { code: 'en', label: 'English (EN)', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी (HI)', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు (TE)', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ் (TA)', flag: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ (KN)', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা (BN)', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी (MR)', flag: '🇮🇳' },
  { code: 'es', label: 'Español (ES)', flag: '🇪🇸' }
];

const THERAPY_FOCUS_MODES = [
  {
    id: 'calm',
    icon: '🌸',
    label: 'Calming & Peace',
    desc: 'Deep rhythmic breathing & gentle anxiety relief'
  },
  {
    id: 'routine',
    icon: '💊',
    label: 'Medication Peace Check',
    desc: 'Gentle reassurance about your daily medicines and safety'
  },
  {
    id: 'morning',
    icon: '☀️',
    label: 'Morning Affirmation',
    desc: 'Uplifting sunrise affirmations & daily focus'
  },
  {
    id: 'night',
    icon: '🌙',
    label: 'Sleep & Night Peace',
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
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(() => lang || 'en');
  const [activeMode, setActiveMode] = useState('calm');
  const [therapistSpeech, setTherapistSpeech] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const patientName = user?.name ? user.name.split(' ')[0] : 'Friend';

  const fetchTherapyGuidance = async (mode = activeMode, targetLang = selectedLang) => {
    setLoading(true);
    stopSpeaking();
    playGentleTone(432, 1.2);

    // Contextual medication info
    let medContextMsg = '';
    if (mode === 'routine') {
      try {
        const timings = reminderScheduler.getAlarmTimings();
        const morningMeds = reminderScheduler.getScheduledMedicinesForSlot('morning');
        const medNames = morningMeds && morningMeds.length > 0
          ? morningMeds.map(m => m.medicationName).join(', ')
          : 'prescribed medications';
        medContextMsg = `Patient has ${medNames} scheduled in their routine. Provide deep emotional reassurance that their medicines are safely organized and taken care of.`;
      } catch (e) {}
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/therapy/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          message: medContextMsg,
          language: targetLang,
          patientName
        })
      });
      const data = await res.json();
      const speech = data.response || `Hello ${patientName}, take a deep gentle breath. You are safe and well cared for.`;
      setTherapistSpeech(speech);
      handleSpeak(speech, targetLang);
    } catch (e) {
      const fallback = `Hello ${patientName}, take a deep gentle breath. You are safe, relaxed, and peaceful.`;
      setTherapistSpeech(fallback);
      handleSpeak(fallback, targetLang);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text, targetLang) => {
    setIsSpeaking(true);
    speakText(text, targetLang, () => setIsSpeaking(false));
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
    <div className="page-inner fade-in" style={{ maxWidth: '880px', margin: '0 auto' }}>
      {/* Room Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          margin: '0 auto 14px',
          boxShadow: '0 8px 24px rgba(236, 72, 153, 0.35)'
        }}>
          <Flower2 size={28} />
        </div>
        <h1 className="page-title" style={{ fontSize: '1.85rem', marginBottom: '6px' }}>
          PharmaVision Voice Therapy Room
        </h1>
        <p className="page-subtitle" style={{ maxWidth: '580px', margin: '0 auto' }}>
          Calming therapeutic voice check-ins, medication peace of mind, and gentle guided reminiscence for patients and loved ones.
        </p>
      </div>

      {/* Language Pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '24px'
      }}>
        {THERAPY_LANGUAGES.map(l => (
          <button
            key={l.code}
            onClick={() => setSelectedLang(l.code)}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              border: selectedLang === l.code ? '2px solid var(--md-sys-color-primary)' : '1px solid var(--border)',
              background: selectedLang === l.code ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container)',
              color: selectedLang === l.code ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{l.flag}</span>
            <span>{l.label}</span>
          </button>
        ))}
      </div>

      {/* Focus Modes Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
        marginBottom: '28px'
      }}>
        {THERAPY_FOCUS_MODES.map(mode => (
          <div
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            style={{
              padding: '16px',
              borderRadius: '20px',
              border: activeMode === mode.id ? '2px solid var(--md-sys-color-primary)' : '1px solid var(--border)',
              background: activeMode === mode.id ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-container)',
              color: activeMode === mode.id ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{mode.icon}</div>
              <h4 style={{ margin: '0 0 4px', fontSize: '0.92rem', fontWeight: 800 }}>{mode.label}</h4>
              <p style={{ margin: 0, fontSize: '0.74rem', opacity: 0.85, lineHeight: 1.35 }}>
                {mode.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Spoken Guidance Card */}
      <div className="card" style={{ padding: '32px', borderRadius: '28px', border: '1px solid var(--border)', background: 'var(--md-sys-color-surface-container)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="var(--md-sys-color-primary)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--md-sys-color-primary)', letterSpacing: '0.05em' }}>
              Companion Voice Script
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {isSpeaking ? (
              <button
                onClick={handleStopSpeaking}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--r-full)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.15)',
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
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  background: 'rgba(16, 185, 129, 0.15)',
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
          "{loading ? 'Generating soothing companion guidance…' : therapistSpeech}"
        </p>

        <div style={{
          padding: '12px 18px',
          borderRadius: '16px',
          background: 'var(--md-sys-color-surface-container-high)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.82rem',
          color: 'var(--md-sys-color-on-surface-variant)'
        }}>
          <Shield size={18} color="#8b5cf6" />
          <span>Gentle 432Hz ambient frequency tuning active for cognitive calm and peace of mind.</span>
        </div>
      </div>
    </div>
  );
};
