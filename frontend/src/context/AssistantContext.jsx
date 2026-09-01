import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { getUserMedicalProfile } from '../utils/allergenShield';
import { speakText, stopSpeaking as stopAudioSpeaking } from '../utils/speechUtils';

const AssistantContext = createContext();

const STORAGE_KEY = 'pharmavision_assistant_chat_v2';

export const AssistantProvider = ({ children }) => {
  const { user } = useAuth();
  const { lang } = useLanguage();

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem('pharmavision_assistant_chat');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [cabinetMeds, setCabinetMeds] = useState([]);
  const [patientProfile, setPatientProfile] = useState({ allergies: [], conditions: [] });
  const [loadingContext, setLoadingContext] = useState(true);

  const recognitionRef = useRef(null);

  // Sync messages to persistent storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      sessionStorage.setItem('pharmavision_assistant_chat', JSON.stringify(messages));
    } catch (e) {
      console.warn('[AssistantContext] Storage save error:', e);
    }
  }, [messages]);

  // Load cabinet medications and patient profile context
  const refreshContext = async () => {
    if (!user) {
      setLoadingContext(false);
      return;
    }
    const { allergies, conditions } = getUserMedicalProfile();
    setPatientProfile({ allergies, conditions, name: user?.name });

    try {
      const res = await api.getHistory();
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
            warnings: item.warnings || details?.warnings || [],
            timing: details?.timing || ''
          };
        });
        setCabinetMeds(parsedMeds);
      }
    } catch (err) {
      console.warn('[AssistantContext] Failed to load cabinet medications:', err);
    } finally {
      setLoadingContext(false);
    }
  };

  useEffect(() => {
    refreshContext();
  }, [user]);

  // Send Message — executes continuously in background even if page changes!
  const sendMessage = async (textToSend) => {
    const query = (textToSend || '').trim();
    if (!query || loading) return;

    const userMsg = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
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

      setMessages(prev => {
        const final = [...prev, assistantMsg];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(final));
          sessionStorage.setItem('pharmavision_assistant_chat', JSON.stringify(final));
        } catch (e) {}
        return final;
      });

      setUnreadCount(prev => prev + 1);
    } catch (err) {
      console.error('[AssistantContext] Chat error:', err);
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

      setMessages(prev => {
        const final = [...prev, errorMsg];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(final));
        } catch (e) {}
        return final;
      });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    stopAudioSpeaking();
    setMessages([]);
    setUnreadCount(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem('pharmavision_assistant_chat');
    } catch (e) {}
  };

  const speakMessage = (text, idx) => {
    if (speakingIdx === idx) {
      stopAudioSpeaking();
      setSpeakingIdx(null);
      return;
    }
    setSpeakingIdx(idx);
    speakText(text, lang, () => setSpeakingIdx(null));
  };

  const stopSpeaking = () => {
    stopAudioSpeaking();
    setSpeakingIdx(null);
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  return (
    <AssistantContext.Provider
      value={{
        messages,
        loading,
        unreadCount,
        cabinetMeds,
        patientProfile,
        loadingContext,
        speakingIdx,
        isListening,
        setIsListening,
        sendMessage,
        clearChat,
        speakMessage,
        stopSpeaking,
        markAsRead,
        refreshContext
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = () => useContext(AssistantContext);
