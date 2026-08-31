import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getUserMedicalProfile } from '../utils/allergenShield';
import { speakText, stopSpeaking } from '../utils/speechUtils';
import {
  Bot, Send, Mic, MicOff, Volume2, Square, Sparkles, ShieldAlert,
  Pill, HeartPulse, RefreshCw, Download, Copy, Check, Info, AlertTriangle, Trash2
} from 'lucide-react';

export const Assistant = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();

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
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [isListening, setIsListening] = useState(false);

  // Live Patient Medical Context
  const [cabinetMeds, setCabinetMeds] = useState([]);
  const [patientProfile, setPatientProfile] = useState({ allergies: [], conditions: [] });
  const [loadingContext, setLoadingContext] = useState(true);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  // 1. Load patient's cabinet medications and medical profile
  useEffect(() => {
    let isMounted = true;
    const { allergies, conditions } = getUserMedicalProfile();
    setPatientProfile({ allergies, conditions, name: user?.name });

    api.getHistory()
      .then(res => {
        if (isMounted && res && Array.isArray(res.history)) {
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
              warnings: item.warnings || details?.warnings || [],
              timing: details?.timing || ''
            };
          });
          setCabinetMeds(parsedMeds);
        }
      })
      .catch(err => console.warn('Failed to load cabinet for assistant context', err))
      .finally(() => {
        if (isMounted) setLoadingContext(false);
      });

    return () => {
      isMounted = false;
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [user]);

  // Persist messages in session storage
  useEffect(() => {
    try {
      sessionStorage.setItem('pharmavision_assistant_chat', JSON.stringify(messages));
    } catch (e) {}
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(prev => prev ? `${prev} ${transcript}` : transcript);
        }
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
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

  // Handle Send Message
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

      const replyContent = response.reply || response.response || 'I have analyzed your medical query.';
      const assistantMsg = {
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        contextMeta: response.patientContext
      };

      setMessages([...newHistory, assistantMsg]);
    } catch (err) {
      console.error('Assistant chat error:', err);
      const errorMsg = {
        role: 'assistant',
        content: lang === 'hi' 
          ? 'सॉरी, नेटवर्क समस्या के कारण उत्तर नहीं मिल पाया। कृपया पुनः प्रयास करें।'
          : lang === 'te'
          ? 'క్షమించండి, నెట్‌వర్క్ సమస్య కారణంగా సమాధానం ఇవ్వలేకపోయాను. దయచేసి మళ్లీ ప్రయత్నించండి.'
          : 'I encountered an issue connecting to the pharmacology intelligence server. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages([...newHistory, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle Audio Speech Readout
  const handleSpeak = (text, idx) => {
    if (speakingIdx === idx) {
      stopSpeaking();
      setSpeakingIdx(null);
      return;
    }
    setSpeakingIdx(idx);
    speakText(text, lang, () => setSpeakingIdx(null));
  };

  // Handle Copy Message
  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Clear Chat History
  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear this conversation history?')) {
      stopSpeaking();
      setMessages([]);
      sessionStorage.removeItem('pharmavision_assistant_chat');
    }
  };

  // Export Consultation Transcript for Doctor
  const handleExport = () => {
    if (messages.length === 0) return;

    let transcript = `# PharmaVision AI — Patient Clinical Consultation Transcript\n`;
    transcript += `Patient: ${user?.name || 'User'} (${user?.email || 'N/A'})\n`;
    transcript += `Date: ${new Date().toLocaleString()}\n`;
    transcript += `Allergen Profile: ${patientProfile.allergies.join(', ') || 'None recorded'}\n`;
    transcript += `Tracked Chronic Conditions: ${patientProfile.conditions.join(', ') || 'None recorded'}\n`;
    transcript += `Active Cabinet Medications: ${cabinetMeds.map(m => m.name).join(', ') || 'None'}\n\n`;
    transcript += `---\n\n`;

    messages.forEach((msg, i) => {
      const sender = msg.role === 'user' ? '👤 Patient' : '🤖 PharmaVision AI Assistant';
      transcript += `### [${msg.timestamp}] ${sender}\n${msg.content}\n\n`;
    });

    transcript += `\n---\n*Disclaimer: PharmaVision AI is an assistive visual & clinical pharmacology intelligence tool. Always consult your prescribing physician or pharmacist.*`;

    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PharmaVision_Consultation_${user?.name?.replace(/\s+/g, '_') || 'Patient'}_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const quickPrompts = [
    { text: t('promptInteractions'), icon: '🔍' },
    { text: t('promptSchedule'), icon: '⏰' },
    { text: t('promptAllergies'), icon: '🛡️' },
    { text: t('promptFoods'), icon: '🍏' },
    { text: t('promptMissedDose'), icon: '❓' }
  ];

  return (
    <div className="assistant-page-container">
      {/* ── Top Header & Context Banner ─────────────────────────────────── */}
      <div className="assistant-header-card">
        <div className="assistant-header-main">
          <div className="assistant-avatar-badge">
            <Bot size={28} color="#fff" />
            <span className="online-indicator-dot" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="assistant-title">{t('assistant')}</h1>
              <span className="assistant-pill-badge">
                <Sparkles size={12} /> 24/7 AI Companion
              </span>
            </div>
            <p className="assistant-subtitle">{t('assistantSubtitle')}</p>
          </div>
        </div>

        {/* Live Patient Medical Context Chips */}
        <div className="assistant-context-ribbon">
          <div className="context-chip">
            <Pill size={14} color="var(--md-sys-color-primary)" />
            <span>{t('activeMedsCount', { count: cabinetMeds.length })}</span>
          </div>

          <div className="context-chip">
            <ShieldAlert size={14} color="#e53935" />
            <span>{t('allergensCount', { count: patientProfile.allergies.length })}</span>
          </div>

          <div className="context-chip">
            <HeartPulse size={14} color="#f59e0b" />
            <span>{t('conditionsCount', { count: patientProfile.conditions.length })}</span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            {messages.length > 0 && (
              <>
                <button
                  className="assistant-action-btn"
                  onClick={handleExport}
                  title={t('exportTranscript')}
                >
                  <Download size={15} />
                  <span>{t('exportTranscript')}</span>
                </button>
                <button
                  className="assistant-action-btn danger"
                  onClick={handleClearChat}
                  title={t('clearChat')}
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Chat Messages Stream Area ───────────────────────────────────── */}
      <div className="assistant-chat-stream">
        {messages.length === 0 ? (
          <div className="assistant-empty-hero">
            <div className="hero-icon-circle">
              <Sparkles size={38} color="var(--md-sys-color-primary)" />
            </div>
            <h2>
              {lang === 'hi'
                ? `नमस्ते ${user?.name || 'साथी'}! मैं आपकी दवाओं का स्वास्थ्य सहायक हूँ`
                : lang === 'te'
                ? `నమస్కారం ${user?.name || 'మిత్రమా'}! నేను మీ మందుల ఆరోగ్య సహాయకుడిని`
                : `Hello ${user?.name || 'there'}! I'm your Personal Medication Assistant`}
            </h2>
            <p>
              {lang === 'hi'
                ? `मैं आपके कैबिनेट की सभी दवाओं (${cabinetMeds.length} दर्ज), एलर्जी और स्वास्थ्य स्थितियों को ध्यान में रखकर उत्तर देता हूँ।`
                : lang === 'te'
                ? `మీ క్యాబినెట్ మందులు (${cabinetMeds.length} నమోదు), అలెర్జీలు మరియు ఆరోగ్య పరిస్థితుల ఆధారంగా నేను సమాధానాలు ఇస్తాను.`
                : `I have real-time clinical context over your ${cabinetMeds.length} cabinet medicines, active allergens, and chronic conditions.`}
            </p>

            <div className="quick-prompts-container">
              <div className="quick-prompts-title">{t('quickPromptsTitle')}</div>
              <div className="quick-prompts-grid">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    className="quick-prompt-pill"
                    onClick={() => handleSendMessage(prompt.text)}
                  >
                    <span className="prompt-emoji">{prompt.icon}</span>
                    <span>{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-row ${msg.role === 'user' ? 'user-row' : 'assistant-row'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="message-avatar assistant-avatar">
                    <Bot size={18} />
                  </div>
                )}

                <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'} ${msg.isError ? 'error-bubble' : ''}`}>
                  <div className="message-content">
                    {msg.content.split('\n').map((line, lIdx) => {
                      if (!line.trim()) return <div key={lIdx} style={{ height: '6px' }} />;
                      
                      // Highlight bold **text**
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      const formattedLine = parts.map((part, pIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      });

                      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
                        return (
                          <div key={lIdx} className="bullet-point">
                            <span className="bullet-dot">•</span>
                            <span>{formattedLine}</span>
                          </div>
                        );
                      }

                      return <p key={lIdx} style={{ margin: '3px 0' }}>{formattedLine}</p>;
                    })}
                  </div>

                  <div className="message-meta-bar">
                    <span className="message-time">{msg.timestamp}</span>
                    {msg.role === 'assistant' && !msg.isError && (
                      <div className="message-actions">
                        <button
                          className={`msg-action-btn ${speakingIdx === index ? 'active-speaking' : ''}`}
                          onClick={() => handleSpeak(msg.content, index)}
                          title={speakingIdx === index ? t('stopAudio') : t('readAloud')}
                        >
                          {speakingIdx === index ? <Square size={13} /> : <Volume2 size={13} />}
                        </button>
                        <button
                          className="msg-action-btn"
                          onClick={() => handleCopy(msg.content, index)}
                          title="Copy text"
                        >
                          {copiedIdx === index ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="message-avatar user-avatar-bubble">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="message-row assistant-row">
                <div className="message-avatar assistant-avatar">
                  <Bot size={18} />
                </div>
                <div className="message-bubble assistant-bubble typing-bubble">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="typing-label">
                    {lang === 'hi' ? 'दवा डेटाबेस और इंटरैक्शन का विश्लेषण किया जा रहा है...' : lang === 'te' ? 'మందుల డేటాబేస్ మరియు పరస్పర చర్యలను విశ్లేషిస్తోంది...' : 'Cross-referencing cabinet medications & clinical pharmacology...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input Bar & Voice Controls ──────────────────────────────────── */}
      <div className="assistant-input-tray">
        <form
          className="assistant-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <button
            type="button"
            className={`voice-mic-btn ${isListening ? 'listening-pulse' : ''}`}
            onClick={toggleSpeechRecognition}
            title={isListening ? t('listening') : t('voiceInput')}
          >
            {isListening ? <MicOff size={18} color="#fff" /> : <Mic size={18} />}
          </button>

          <input
            ref={inputRef}
            type="text"
            className="assistant-text-input"
            placeholder={isListening ? t('listening') : t('askAssistantPlaceholder')}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            className="send-msg-btn"
            disabled={!inputMessage.trim() || loading}
          >
            <Send size={18} color="#fff" />
          </button>
        </form>

        <div className="assistant-disclaimer-note">
          <Info size={12} />
          <span>{t('disclaimer')}</span>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
