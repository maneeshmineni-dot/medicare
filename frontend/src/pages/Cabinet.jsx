import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Package, Plus, RefreshCw, FileDown, Clock } from 'lucide-react';
import {
  classifyMedication,
  groupMedicationsByDisease
} from '../utils/diseaseClassifier';
import { speakText } from '../utils/speechUtils';
import { generateCabinetSummaryPDF } from '../utils/clinicalPdfExporter';
import { CabinetShelfView } from '../components/cabinet/CabinetShelfView';
import { CabinetScheduleView } from '../components/cabinet/CabinetScheduleView';
import { playAlarmChime } from '../components/cabinet/AlarmSettingsModal';

const DEFAULT_ALARM_TIMES = {
  morning: '08:00',
  afternoon: '13:00',
  night: '21:00'
};

export const Cabinet = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('shelves'); // 'shelves' or 'schedule'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [speakingId, setSpeakingId] = useState(null);
  const [notificationStatus, setNotificationStatus] = useState('');
  const [showAlarmConfig, setShowAlarmConfig] = useState(false);

  // Persistent Schedule Overrides
  const [scheduleOverrides, setScheduleOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmavision_schedule_overrides');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [alarmTimes, setAlarmTimes] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmavision_alarm_timings');
      return saved ? JSON.parse(saved) : DEFAULT_ALARM_TIMES;
    } catch {
      return DEFAULT_ALARM_TIMES;
    }
  });

  const handleUpdateAlarmTime = (routine, newTime) => {
    const updated = { ...alarmTimes, [routine]: newTime };
    setAlarmTimes(updated);
    try {
      localStorage.setItem('pharmavision_alarm_timings', JSON.stringify(updated));
    } catch {}
  };

  const handleResetAlarmTimes = () => {
    setAlarmTimes(DEFAULT_ALARM_TIMES);
    try {
      localStorage.setItem('pharmavision_alarm_timings', JSON.stringify(DEFAULT_ALARM_TIMES));
    } catch {}
  };

  // Schedule Routine Extraction & Manipulation
  function getDefaultRoutines(item) {
    if (!item) return [];
    const text = `${item.dosageInstructions || ''} ${item.rawAnalysis || ''}`.toLowerCase();
    const routines = [];
    if (text.includes('morning') || text.includes('1-0-1') || text.includes('1-0-0') || text.includes('1-1-1') || text.includes('breakfast') || text.includes(' od') || text.includes('daily')) {
      routines.push('morning');
    }
    if (text.includes('afternoon') || text.includes('lunch') || text.includes('1-1-1') || text.includes('0-1-0') || text.includes('tds') || text.includes('qid')) {
      routines.push('afternoon');
    }
    if (text.includes('night') || text.includes('bedtime') || text.includes('dinner') || text.includes('1-0-1') || text.includes('0-0-1') || text.includes('1-1-1') || text.includes(' bd') || text.includes('hs')) {
      routines.push('night');
    }
    if (routines.length === 0) {
      routines.push('morning');
    }
    return routines;
  }

  function getMedRoutines(item) {
    if (!item) return [];
    if (scheduleOverrides[item.id]) {
      return scheduleOverrides[item.id];
    }
    return getDefaultRoutines(item);
  }

  const handleMoveMedication = (medId, targetRoutine) => {
    const med = history.find(m => m.id === medId) || { id: medId };
    const current = getMedRoutines(med);
    const updatedRoutines = Array.from(new Set([...current, targetRoutine]));
    const updated = { ...scheduleOverrides, [medId]: updatedRoutines };
    setScheduleOverrides(updated);
    try {
      localStorage.setItem('pharmavision_schedule_overrides', JSON.stringify(updated));
    } catch {}
  };

  const handleRemoveFromRoutine = (medId, routineToRemove, e) => {
    if (e) e.stopPropagation();
    const med = history.find(m => m.id === medId) || { id: medId };
    const current = getMedRoutines(med);
    const updatedRoutines = current.filter(r => r !== routineToRemove);
    const updated = { ...scheduleOverrides, [medId]: updatedRoutines };
    setScheduleOverrides(updated);
    try {
      localStorage.setItem('pharmavision_schedule_overrides', JSON.stringify(updated));
    } catch {}
  };

  const handleResetScheduleOverrides = () => {
    setScheduleOverrides({});
    try {
      localStorage.removeItem('pharmavision_schedule_overrides');
    } catch {}
  };

  const fetchCabinet = (forceRefresh = false) => {
    setLoading(true);
    api.getHistory(forceRefresh)
      .then(res => {
        const items = Array.isArray(res) ? res : (res?.history || res?.data || []);
        setHistory(items);
      })
      .catch(err => {
        console.warn('[Cabinet] Failed to fetch history:', err);
        setHistory([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCabinet(true);
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteHistoryItem(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch {}
  };

  const handleSpeak = (med, e) => {
    e.stopPropagation();
    setSpeakingId(med.id);
    const textToRead = `${med.medicationName}. ${med.primaryUse || ''}. ${med.dosageInstructions || ''}`;
    speakText(textToRead, lang, () => setSpeakingId(null));
  };

  // Group all medications automatically by disease category with active language
  const { allGroups, populatedGroups, totalMedications } = groupMedicationsByDisease(history, lang);

  // Filter based on selected category pill and search query
  const filteredHistory = history.filter(item => {
    const matchesSearch =
      item.medicationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.primaryUse?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.activeIngredients || []).some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    const cat = classifyMedication(item);
    return cat.id === selectedCategory;
  });

  // Regroup filtered items by disease for shelf view
  const { populatedGroups: displayShelves } = groupMedicationsByDisease(filteredHistory, lang);

  // Daily Schedule Extraction with Custom Overrides
  const morningMeds = history.filter(item => getMedRoutines(item).includes('morning'));
  const afternoonMeds = history.filter(item => getMedRoutines(item).includes('afternoon'));
  const nightMeds = history.filter(item => getMedRoutines(item).includes('night'));

  // Live background ticker for alarms
  useEffect(() => {
    let lastTriggeredMinute = '';
    const interval = setInterval(() => {
      const d = new Date();
      const currentHHMM = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      
      if (currentHHMM === lastTriggeredMinute) return;

      let matchedRoutine = null;
      let matchedMeds = [];

      if (currentHHMM === alarmTimes.morning && morningMeds.length > 0) {
        matchedRoutine = 'Morning Routine';
        matchedMeds = morningMeds;
      } else if (currentHHMM === alarmTimes.afternoon && afternoonMeds.length > 0) {
        matchedRoutine = 'Afternoon Routine';
        matchedMeds = afternoonMeds;
      } else if (currentHHMM === alarmTimes.night && nightMeds.length > 0) {
        matchedRoutine = 'Night Routine';
        matchedMeds = nightMeds;
      }

      if (matchedRoutine) {
        lastTriggeredMinute = currentHHMM;
        playAlarmChime();
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`⏰ Dose Reminder: ${matchedRoutine}`, {
            body: `Time to take your scheduled medications: ${matchedMeds.map(m => m.medicationName).join(', ')}`,
            icon: '/favicon.ico'
          });
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [alarmTimes, morningMeds, afternoonMeds, nightMeds]);

  const handleEnableReminders = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('Browser notifications are not supported on this device.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        playAlarmChime();
        new Notification('PharmaVision AI Pill Reminder Active', {
          body: `You have ${history.length} active medications scheduled in your daily tracker.`,
          icon: '/favicon.ico'
        });
        setNotificationStatus('🎉 Daily dosage reminders enabled! You will receive timely alerts and chimes.');
      } else {
        setNotificationStatus('Notification permission was declined in browser settings.');
      }
    } catch (err) {
      setNotificationStatus('Unable to request notification permission.');
    }
  };

  return (
    <div className="page-inner fade-in">
      {/* Header Banner */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">{t('cabinetHeader')}</h1>
          <p className="page-subtitle">{t('cabinetSubtitle')}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-secondary"
            onClick={() => generateCabinetSummaryPDF(history)}
            style={{ gap: '6px' }}
            title="Download or Print printable medication list"
          >
            <FileDown size={16} /> Export PDF
          </button>
          <button className="btn-secondary" onClick={() => fetchCabinet(true)} style={{ gap: '6px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => navigate('/scanner')} style={{ gap: '6px' }}>
            <Plus size={16} /> {t('scanNewMedicine')}
          </button>
        </div>
      </div>

      {/* Main View Mode Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setViewMode('shelves')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--r-full)',
            border: viewMode === 'shelves' ? '1px solid var(--md-sys-color-primary)' : '1px solid var(--border)',
            background: viewMode === 'shelves' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface)',
            color: viewMode === 'shelves' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Package size={18} strokeWidth={2} /> Cabinet Shelves ({totalMedications})
        </button>

        <button
          onClick={() => setViewMode('schedule')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--r-full)',
            border: viewMode === 'schedule' ? '1px solid var(--md-sys-color-primary)' : '1px solid var(--border)',
            background: viewMode === 'schedule' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface)',
            color: viewMode === 'schedule' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Clock size={18} strokeWidth={2} /> Daily Pill Schedule
        </button>
      </div>

      {viewMode === 'schedule' ? (
        <CabinetScheduleView
          history={history}
          morningMeds={morningMeds}
          afternoonMeds={afternoonMeds}
          nightMeds={nightMeds}
          alarmTimes={alarmTimes}
          showAlarmConfig={showAlarmConfig}
          setShowAlarmConfig={setShowAlarmConfig}
          onUpdateAlarmTime={handleUpdateAlarmTime}
          onResetAlarmTimes={handleResetAlarmTimes}
          notificationStatus={notificationStatus}
          onEnableReminders={handleEnableReminders}
          onResetScheduleOverrides={handleResetScheduleOverrides}
          handleMoveMedication={handleMoveMedication}
          handleRemoveFromRoutine={handleRemoveFromRoutine}
          getMedRoutines={getMedRoutines}
        />
      ) : (
        <CabinetShelfView
          totalMedications={totalMedications}
          populatedGroups={populatedGroups}
          allGroups={allGroups}
          displayShelves={displayShelves}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loading}
          speakingId={speakingId}
          onSpeak={handleSpeak}
          onDelete={handleDelete}
          onNavigateMed={(medId) => navigate(`/scan/${medId}`)}
          onNavigateScanner={() => navigate('/scanner')}
          lang={lang}
          t={t}
        />
      )}
    </div>
  );
};
