import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAssistant } from '../context/AssistantContext';
import {
  Bot, Send, Mic, MicOff, Volume2, Square, Sparkles, ShieldAlert,
  Pill, HeartPulse, Download, Copy, Check, Info, AlertTriangle, Trash2
} from 'lucide-react';

export const Assistant = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const {
    messages,
    loading,
    cabinetMeds,
    patientProfile,
    speakingIdx,
    sendMessage,
    clearChat,
    speakMessage,
    markAsRead
  } = useAssistant();

  const [inputMessage, setInputMessage] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  // Clear unread badge when viewing the assistant page
  useEffect(() => {
    markAsRead();
  }, []);

  // Auto scroll to bottom when new messages arrive or loading state changes
  useEffect(() => {
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

    setInputMessage('');
    await sendMessage(query);
    inputRef.current?.focus();
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
      clearChat();
    }
  };

  // Export Consultation Transcript for Doctor
  const handleExport = () => {
    if (messages.length === 0) return;

    let transcript = `# PharmaVision AI — Patient Clinical Consultation Transcript\n`;
    transcript += `Patient: ${user?.name || 'User'} (${user?.email || 'N/A'})\n`;
    transcript += `Date: ${new Date().toLocaleString()}\n`;
    transcript += `Allergen Profile: ${patientProfile.allergies?.join(', ') || 'None recorded'}\n`;
    transcript += `Tracked Chronic Conditions: ${patientProfile.conditions?.join(', ') || 'None recorded'}\n`;
    transcript += `Active Cabinet Medications: ${cabinetMeds.map(m => m.name).join(', ') || 'None'}\n\n`;
    transcript += `---\n\n`;

    messages.forEach((msg) => {
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
            <span className={`online-indicator-dot ${loading ? 'pulsing' : ''}`} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="assistant-title">{t('assistant')}</h1>
              <span className="assistant-pill-badge">
                <Sparkles size={12} /> {loading ? 'Analyzing Clinical Pharmacology…' : '24/7 AI Companion'}
              </span>
            </div>
            <p className="assistant-subtitle">{t('assistantSubtitle')}</p>
          </div>
        </div>

        {/* Live Patient Medical Context Chips */}
        <div className="assistant-context-ribbon">
          <div className="context-chip">
            <Pill size={14} color="var(--md-sys-color-primary)" />
            <span>{t('connectedCabinet', { count: cabinetMeds.length })}</span>
          </div>

          <div className="context-chip">
            <ShieldAlert size={14} color="#e53935" />
            <span>{t('allergenShieldActive', { count: patientProfile.allergies?.length || 0 })}</span>
          </div>

          <div className="context-chip">
            <HeartPulse size={14} color="#f59e0b" />
            <span>{t('conditionsCount', { count: patientProfile.conditions?.length || 0 })}</span>
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
                    <span className="prompt-icon">{prompt.icon}</span>
                    <span className="prompt-text">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="assistant-messages-list">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isSpeaking = speakingIdx === idx;
              const isCopied = copiedIdx === idx;

              return (
                <div key={idx} className={`chat-message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
                  {!isUser && (
                    <div className="message-avatar bot-avatar">
                      <Bot size={18} />
                    </div>
                  )}

                  <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'} ${msg.isError ? 'error-bubble' : ''}`}>
                    {/* Header info */}
                    <div className="message-meta-header">
                      <span className="sender-tag">{isUser ? (user?.name || 'You') : 'PharmaVision AI'}</span>
                      <span className="timestamp-tag">{msg.timestamp}</span>
                    </div>

                    {/* Content text */}
                    <div className="message-content-text">
                      {msg.content}
                    </div>

                    {/* Patient Context Indicators */}
                    {msg.contextMeta && (
                      <div className="assistant-context-footer">
                        {msg.contextMeta.cabinetMedicinesEvaluated > 0 && (
                          <span className="evaluated-tag">
                            <Check size={12} /> {msg.contextMeta.cabinetMedicinesEvaluated} Medicines Checked
                          </span>
                        )}
                        {msg.contextMeta.activeAllergensChecked > 0 && (
                          <span className="evaluated-tag warning">
                            <AlertTriangle size={12} /> {msg.contextMeta.activeAllergensChecked} Allergens Screened
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Bar (Audio Read, Copy) */}
                    {!isUser && (
                      <div className="message-actions-bar">
                        <button
                          className={`message-action-btn ${isSpeaking ? 'active-speaking' : ''}`}
                          onClick={() => speakMessage(msg.content, idx)}
                          title={isSpeaking ? t('stopAudio') : t('readAloud')}
                        >
                          {isSpeaking ? <Square size={13} fill="currentColor" /> : <Volume2 size={13} />}
                          <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                        </button>

                        <button
                          className="message-action-btn"
                          onClick={() => handleCopy(msg.content, idx)}
                          title="Copy response"
                        >
                          {isCopied ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* In-Flight Thinking Indicator */}
            {loading && (
              <div className="chat-message-row assistant-row">
                <div className="message-avatar bot-avatar pulsing">
                  <Bot size={18} />
                </div>
                <div className="message-bubble assistant-bubble typing-bubble">
                  <div className="typing-indicator">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                  <span className="typing-label">Analyzing pharmacology database & interactions…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input Box & Voice Controls ──────────────────────────────────── */}
      <div className="assistant-input-card">
        <form
          className="assistant-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <button
            type="button"
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={toggleSpeechRecognition}
            title={isListening ? t('listening') : t('voiceInput')}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input
            ref={inputRef}
            type="text"
            className="assistant-text-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isListening ? t('listening') : t('askAssistantPlaceholder')}
            disabled={loading}
          />

          <button
            type="submit"
            className="send-button"
            disabled={!inputMessage.trim() || loading}
            title="Send Query"
          >
            <Send size={18} />
          </button>
        </form>

        <div className="assistant-disclaimer-text">
          <Info size={13} />
          <span>
            {t('disclaimer')}
          </span>
        </div>
      </div>
    </div>
  );
};
