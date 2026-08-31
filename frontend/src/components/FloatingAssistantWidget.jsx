import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getUserMedicalProfile } from '../utils/allergenShield';
import { speakText, stopSpeaking } from '../utils/speechUtils';
import {
  Bot, Send, Mic, MicOff, Volume2, Square, Sparkles, X,
  Maximize2, Pill, ShieldAlert, HeartPulse, Info
} from 'lucide-react';

export const FloatingAssistantWidget = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('pharmavision_assistant_chat');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [isListening, setIsListening] = useState(false);

  // Live Patient Medical Context
  const [cabinetMeds, setCabinetMeds] = useState([]);
  const [patientProfile, setPatientProfile] = useState({ allergies: [], conditions: [] });

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Don't render floating widget if user is on the dedicated /assistant page or not logged in
  const isDedicatedAssistantPage = location.pathname === '/assistant';

  useEffect(() => {
    if (!user) return;
    const { allergies, conditions } = getUserMedicalProfile();
    setPatientProfile({ allergies, conditions, name: user?.name });

    api.getHistory()
      .then(res => {
        if (res && Array.isArray(res.history)) {
          const parsedMeds = res.history.map(item => {
            let details = null;
            try {
              details = typeof item.rawAnalysis === 'string' ? JSON.parse(item.rawAnalysis) : item.rawAnalysis;
            } catch (e) {}
            return {
              name: item.medicationName,
              primaryUse: item.primaryUse || details?.primaryUse || '',
              dosageInstructions: item.dosageInstructions || details?.dosageInstructions || '',
              activeIngredients: item.activeIngredients || details?.activeIngredients || [],
              warnings: item.warnings || details?.warnings || []
            };
          });
          setCabinetMeds(parsedMeds);
        }
      })
      .catch(() => {});
  }, [user, isOpen]);

  useEffect(() => {
    try {
      sessionStorage.setItem('pharmavision_assistant_chat', JSON.stringify(messages));
    } catch (e) {}
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

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
      
      const langMap = { en: 'en-US', hi: 'hi-IN', te: 'te-IN' };
      recognition.lang = langMap[lang] || 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(prev => prev ? `${prev} ${transcript}` : transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.chatWithAssistant({
        message: query,
        conversationHistory: messages,
        patientProfile: {
          name: user?.name,
          allergies: patientProfile.allergies,
          conditions: patientProfile.conditions
        },
        cabinetMedicines: cabinetMeds
      });

      const replyContent = response.reply || response.response || 'I analyzed your medicine query.';
      const assistantMsg = {
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([...newHistory, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: lang === 'hi'
          ? 'सॉरी, नेटवर्क समस्या के कारण उत्तर नहीं मिल सका।'
          : lang === 'te'
          ? 'క్షమించండి, సర్వర్ కనెక్ట్ కాలేదు.'
          : 'Unable to reach clinical AI server. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages([...newHistory, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text, idx) => {
    if (speakingIdx === idx) {
      stopSpeaking();
      setSpeakingIdx(null);
      return;
    }
    setSpeakingIdx(idx);
    speakText(text, lang, () => setSpeakingIdx(null));
  };

  if (isDedicatedAssistantPage || !user) return null;

  return (
    <div className="floating-assistant-wrapper">
      {/* ── Floating Action Button ──────────────────────────────────── */}
      {!isOpen && (
        <button
          className="floating-assistant-fab"
          onClick={() => setIsOpen(true)}
          title={t('openAssistant')}
          aria-label={t('openAssistant')}
        >
          <div className="fab-icon-glow">
            <Bot size={24} color="#fff" />
          </div>
          <span className="fab-pulse-ring" />
          {cabinetMeds.length > 0 && (
            <span className="fab-badge" title={`${cabinetMeds.length} cabinet medicines loaded`}>
              {cabinetMeds.length}
            </span>
          )}
        </button>
      )}

      {/* ── Floating Chat Popover Drawer ────────────────────────────── */}
      {isOpen && (
        <div className="floating-assistant-drawer animate-pop-up">
          {/* Header */}
          <div className="drawer-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="drawer-avatar">
                <Bot size={18} color="#fff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 className="drawer-title">{t('assistant')}</h3>
                  <span className="drawer-online-pill">
                    <Sparkles size={10} /> Live
                  </span>
                </div>
                <div className="drawer-meds-summary">
                  <Pill size={11} /> {cabinetMeds.length} Meds | <ShieldAlert size={11} /> {patientProfile.allergies.length} Allergens
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                className="drawer-ctrl-btn"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/assistant');
                }}
                title="Expand to Full Page"
              >
                <Maximize2 size={15} />
              </button>
              <button
                className="drawer-ctrl-btn"
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick suggestions if few or no messages */}
          {messages.length === 0 && (
            <div className="drawer-quick-prompts">
              <div className="drawer-quick-title">{t('quickPromptsTitle')}</div>
              <div className="drawer-quick-chips">
                <button
                  className="drawer-chip"
                  onClick={() => handleSendMessage(t('promptInteractions'))}
                >
                  🔍 Check Interactions
                </button>
                <button
                  className="drawer-chip"
                  onClick={() => handleSendMessage(t('promptSchedule'))}
                >
                  ⏰ My Daily Schedule
                </button>
                <button
                  className="drawer-chip"
                  onClick={() => handleSendMessage(t('promptAllergies'))}
                >
                  🛡️ Allergy Check
                </button>
              </div>
            </div>
          )}

          {/* Chat Stream */}
          <div className="drawer-chat-stream">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`drawer-msg-row ${msg.role === 'user' ? 'drawer-user-row' : 'drawer-ai-row'}`}
              >
                <div className={`drawer-bubble ${msg.role === 'user' ? 'drawer-user-bubble' : 'drawer-ai-bubble'} ${msg.isError ? 'drawer-err-bubble' : ''}`}>
                  <div className="drawer-bubble-text">
                    {msg.content.split('\n').map((line, lIdx) => {
                      if (!line.trim()) return <div key={lIdx} style={{ height: '4px' }} />;
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      const formatted = parts.map((p, pIdx) => {
                        if (p.startsWith('**') && p.endsWith('**')) return <strong key={pIdx}>{p.slice(2, -2)}</strong>;
                        return p;
                      });
                      return <p key={lIdx} style={{ margin: '2px 0' }}>{formatted}</p>;
                    })}
                  </div>
                  <div className="drawer-msg-footer">
                    <span>{msg.timestamp}</span>
                    {msg.role === 'assistant' && !msg.isError && (
                      <button
                        className="drawer-audio-btn"
                        onClick={() => handleSpeak(msg.content, idx)}
                        title={speakingIdx === idx ? t('stopAudio') : t('readAloud')}
                      >
                        {speakingIdx === idx ? <Square size={11} /> : <Volume2 size={11} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="drawer-msg-row drawer-ai-row">
                <div className="drawer-bubble drawer-ai-bubble drawer-typing">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Cross-referencing medications...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form
            className="drawer-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <button
              type="button"
              className={`drawer-mic-btn ${isListening ? 'listening-pulse' : ''}`}
              onClick={toggleSpeechRecognition}
              title={isListening ? t('listening') : t('voiceInput')}
            >
              {isListening ? <MicOff size={15} color="#fff" /> : <Mic size={15} />}
            </button>

            <input
              type="text"
              className="drawer-input"
              placeholder={isListening ? t('listening') : t('askAssistantPlaceholder')}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              className="drawer-send-btn"
              disabled={!inputMessage.trim() || loading}
            >
              <Send size={15} color="#fff" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FloatingAssistantWidget;
