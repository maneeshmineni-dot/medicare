import React, { useState } from 'react';
import { Mic, Sparkles, Bot, X } from 'lucide-react';
import { VoiceCommandBar } from './VoiceCommandBar';

export const FloatingVoiceAgentButton = () => {
  const [showBar, setShowBar] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: '96px',
      right: '24px',
      zIndex: 9990,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '10px'
    }}>
      {showBar && (
        <div style={{ width: '320px', animation: 'fadeIn 0.2s ease' }}>
          <VoiceCommandBar onClose={() => setShowBar(false)} />
        </div>
      )}

      <button
        onClick={() => setShowBar(prev => !prev)}
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(236, 72, 153, 0.4)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        title="Voice Commands & Navigation"
      >
        {showBar ? <X size={22} /> : <Mic size={22} />}
      </button>
    </div>
  );
};
