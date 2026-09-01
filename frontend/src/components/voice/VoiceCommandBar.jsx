import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, Navigation, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { voiceControlService } from '../../services/voiceControlService';
import { speakText, playGentleTone } from '../../utils/speechUtils';

export const VoiceCommandBar = ({ onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const toggleListen = () => {
    if (isListening) {
      voiceControlService.stopListening();
      setIsListening(false);
    } else {
      setTranscript('');
      setFeedback('Listening… (Speak now)');
      playGentleTone(520, 0.4);

      voiceControlService.startListening(
        async (spokenText) => {
          setTranscript(spokenText);
          setIsListening(false);
          setFeedback('Processing…');

          const res = await voiceControlService.dispatchVoiceCommand(spokenText, navigate);
          if (res?.spokenFeedback) {
            setFeedback(res.spokenFeedback);
            speakText(res.spokenFeedback);
          }
        },
        (err) => {
          setIsListening(false);
          setFeedback('Could not hear. Please tap mic and try again.');
        }
      );
      setIsListening(true);
    }
  };

  return (
    <div style={{
      background: 'var(--md-sys-color-surface-container-highest)',
      borderRadius: '20px',
      padding: '12px 18px',
      border: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      boxShadow: 'var(--shadow-elevation-1)',
      marginBottom: '16px'
    }}>
      <button
        onClick={toggleListen}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          border: 'none',
          background: isListening ? '#ef4444' : 'var(--md-sys-color-primary)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          animation: isListening ? 'pulseGlow 1.5s infinite' : 'none'
        }}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>
          {transcript ? `"${transcript}"` : (feedback || 'Hands-Free Voice Command')}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
          Try: "Open Scanner", "My Cabinet", "Play Memory Game", or "Caregiver"
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-on-surface-variant)' }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};
