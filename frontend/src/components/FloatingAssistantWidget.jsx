import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAssistant } from '../context/AssistantContext';
import {
  Bot, Send, Mic, MicOff, Volume2, Square, Sparkles, X,
  Maximize2, Pill, ShieldAlert, HeartPulse
} from 'lucide-react';

export const FloatingAssistantWidget = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    messages,
    loading,
    unreadCount,
    cabinetMeds,
    patientProfile,
    speakingIdx,
    sendMessage,
    speakMessage,
    markAsRead
  } = useAssistant();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Don't render floating widget if user is on the dedicated /assistant page or not logged in
  const isDedicatedAssistantPage = location.pathname === '/assistant';

  useEffect(() => {
    if (isOpen) {
      markAsRead();
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, loading]);

  // Handle Speech-to-Text Voice Mic
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const langMap = { en: 'en-US', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', bn: 'bn-IN', mr: 'mr-IN', es: 'es-ES' };
      recognition.lang = langMap[lang] || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(prev => prev ? `${prev} ${transcript}` : transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Failed to start speech recognition', e);
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    setInputMessage('');
    await sendMessage(query);
  };

  if (!user || isDedicatedAssistantPage) {
    return null;
  }

  return (
    <div className="floating-assistant-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          className={`floating-assistant-fab ${loading ? 'pulsing-glow' : ''}`}
          onClick={() => {
            setIsOpen(true);
            markAsRead();
          }}
          title={t('assistant')}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--r-full)',
            background: 'linear-gradient(135deg, var(--md-sys-color-primary), #9333ea)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 8px 24px rgba(103, 80, 164, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
          }}
        >
          <Bot size={26} />
          {loading ? (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid var(--md-sys-color-surface)',
                animation: 'pulseGlow 1.5s infinite'
              }}
            />
          ) : unreadCount > 0 ? (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--md-sys-color-surface)'
              }}
            >
              {unreadCount}
            </span>
          ) : null}
        </button>
      )}

      {/* Floating Drawer / Modal */}
      {isOpen && (
        <div
          className="floating-assistant-drawer fade-in"
          style={{
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '540px',
            maxHeight: 'calc(100vh - 100px)',
            borderRadius: '24px',
            background: 'var(--md-sys-color-surface-container-highest)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid var(--border)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(103, 80, 164, 0.12), rgba(147, 51, 234, 0.08))'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--r-full)',
                  background: 'linear-gradient(135deg, var(--md-sys-color-primary), #9333ea)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>{t('assistant')}</h4>
                <div style={{ fontSize: '0.72rem', color: 'var(--md-sys-color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: loading ? '#f59e0b' : '#10b981' }} />
                  {loading ? 'AI Answering…' : 'Online'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/assistant');
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--md-sys-color-on-surface-variant)', cursor: 'pointer', padding: '4px' }}
                title="Expand to Full Page"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--md-sys-color-on-surface-variant)', cursor: 'pointer', padding: '4px' }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Context Ribbon */}
          <div
            style={{
              padding: '6px 14px',
              background: 'var(--md-sys-color-surface-container-low)',
              display: 'flex',
              gap: '8px',
              fontSize: '0.72rem',
              color: 'var(--md-sys-color-on-surface-variant)',
              overflowX: 'auto',
              borderBottom: '1px solid var(--border)'
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Pill size={12} color="var(--md-sys-color-primary)" /> {cabinetMeds.length} meds
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ShieldAlert size={12} color="#e53935" /> {patientProfile.allergies?.length || 0} allergies
            </span>
          </div>

          {/* Chat stream */}
          <div className="drawer-chat-stream" style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                <Sparkles size={28} color="var(--md-sys-color-primary)" style={{ marginBottom: '10px' }} />
                <h5 style={{ margin: '0 0 6px', fontSize: '0.92rem', color: 'var(--md-sys-color-on-surface)' }}>
                  How can I help with your medication?
                </h5>
                <p style={{ fontSize: '0.78rem', margin: 0 }}>
                  Ask about drug interactions, missed doses, or side effects.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isUser ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container)',
                        color: isUser ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
                        fontSize: '0.84rem',
                        lineHeight: 1.45,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                      }}
                    >
                      <div>{msg.content}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.68rem', opacity: 0.75 }}>
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <button
                            onClick={() => speakMessage(msg.content, idx)}
                            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
                          >
                            {speakingIdx === idx ? <Square size={11} fill="currentColor" /> : <Volume2 size={11} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'var(--md-sys-color-surface-container)',
                    fontSize: '0.78rem',
                    color: 'var(--md-sys-color-on-surface-variant)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span className="dot spin" />
                  <span>Thinking…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '10px 14px',
              borderTop: '1px solid var(--border)',
              background: 'var(--md-sys-color-surface-container-high)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--r-full)',
                border: 'none',
                background: isListening ? '#ef4444' : 'var(--md-sys-color-surface-container)',
                color: isListening ? '#fff' : 'var(--md-sys-color-on-surface)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isListening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isListening ? t('listening') : t('askAssistantPlaceholder')}
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--r-full)',
                border: '1px solid var(--border)',
                background: 'var(--md-sys-color-surface)',
                color: 'var(--md-sys-color-on-surface)',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--r-full)',
                border: 'none',
                background: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
                cursor: inputMessage.trim() && !loading ? 'pointer' : 'default',
                opacity: inputMessage.trim() && !loading ? 1 : 0.4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FloatingAssistantWidget;
