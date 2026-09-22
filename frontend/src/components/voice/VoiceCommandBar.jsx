import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, Languages, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { voiceControlService } from '../../services/voiceControlService';
import { speakText, playGentleTone } from '../../utils/speechUtils';

export const VoiceCommandBar = ({ onClose, onOpenTranslator }) => {
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

          if (/translat|భాషాంతర|अनुवाद|மொழிபெயர்ப்பு|ಅನುವಾದ|অনুবাদ|भाषांतर|tradu/i.test(spokenText)) {
            setFeedback('Opening Live Speech Translator.');
            speakText('Opening Live Speech Translator.');
            if (onOpenTranslator) {
              setTimeout(() => onOpenTranslator(), 600);
            }
            return;
          }

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
      gap: '12px',
      boxShadow: 'var(--shadow-elevation-2)',
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

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.86rem',
          fontWeight: 700,
          color: 'var(--md-sys-color-on-surface)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {transcript ? `"${transcript}"` : (feedback || 'Hands-Free Voice Command')}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
          "Open Scanner", "My Cabinet", or "Translate"
        </div>
      </div>

      {onOpenTranslator && (
        <button
          onClick={onOpenTranslator}
          style={{
            background: 'var(--md-sys-color-surface-container)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '6px 10px',
            color: 'var(--md-sys-color-on-surface)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            fontWeight: 700,
            flexShrink: 0
          }}
          title="Open Live Translator"
        >
          <Languages size={13} />
          <span>Translate</span>
        </button>
      )}

      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-on-surface-variant)', flexShrink: 0 }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};
