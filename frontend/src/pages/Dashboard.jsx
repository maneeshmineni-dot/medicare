import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { reminderScheduler } from '../services/reminderScheduler';
import {
  Camera, Clock, Pill, ChevronRight, Scan, Package, FileText,
  ShieldCheck, Sparkles, Activity, Layers, Stethoscope, ArrowRight, Bot,
  Brain, Flower2, Users, Bell, AlertTriangle, CheckCircle2, HeartPulse
} from 'lucide-react';
import { getUserMedicalProfile } from '../utils/allergenShield';

export const Dashboard = () => {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextRoutineInfo, setNextRoutineInfo] = useState(null);

  useEffect(() => {
    api.getHistory()
      .then(res => setHistory(res.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Calculate next routine
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const timings = reminderScheduler.getAlarmTimings();
      let slot = 'morning';
      if (currentHour >= 12 && currentHour < 17) slot = 'afternoon';
      else if (currentHour >= 17) slot = 'night';

      const scheduledMeds = reminderScheduler.getScheduledMedicinesForSlot(slot);
      const timeStr = timings[slot] || (slot === 'morning' ? '08:00' : slot === 'afternoon' ? '13:00' : '20:00');
      setNextRoutineInfo({
        slot: slot.charAt(0).toUpperCase() + slot.slice(1),
        time: timeStr,
        count: scheduledMeds ? scheduledMeds.length : 0
      });
    } catch (e) {}
  }, []);

  const totalScans = history.length;
  const recent = history.slice(0, 4);
  const { allergies, conditions } = getUserMedicalProfile();

  const greeting = new Date().getHours() < 12
    ? t('goodMorning')
    : new Date().getHours() < 17
    ? t('goodAfternoon')
    : t('goodEvening');

  const lastScanDate = history[0]
    ? new Date(history[0].createdAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div className="page-inner fade-in" style={{ maxWidth: '1100px' }}>

      {/* ─── Page Header ─────────────────────────────────────────── */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {greeting}, {user?.name?.split(' ')[0] || 'Friend'}
            </h1>
            <p className="page-subtitle" style={{ margin: '4px 0 0' }}>
              {t('dashboardSubtitle', "Here is your medication schedule, safety alerts, and daily routine overview.")}
            </p>
          </div>

          {/* Quick AI Pharmacist Pill */}
          <button
            onClick={() => navigate('/assistant')}
            className="btn-primary"
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--r-full)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.2)'
            }}
          >
            <Bot size={16} strokeWidth={2} />
            <span>{t('openAssistant', 'Ask AI Pharmacist')}</span>
          </button>
        </div>
      </div>

      {/* ─── Unified Health & Routine Stat Cards ──────────────────── */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        {/* Stat 1: Active Medication Cabinet */}
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/cabinet')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div className="stat-label">{t('totalScans')}</div>
            <Package size={20} strokeWidth={2} color="var(--md-sys-color-primary)" />
          </div>
          <div className="stat-value">{loading ? '…' : totalScans}</div>
          <div className="stat-sub">{totalScans > 0 ? `${totalScans} verified in Cabinet` : '0 Scanned medicines'}</div>
        </div>

        {/* Stat 2: Next Routine Medication Alarm */}
        <div className="stat-card" style={{ background: 'var(--md-sys-color-secondary-container)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div className="stat-label" style={{ color: 'var(--md-sys-color-on-secondary-container)' }}>Next Routine Alarm</div>
            <Bell size={20} strokeWidth={2} color="var(--md-sys-color-on-secondary-container)" />
          </div>
          <div className="stat-value" style={{ fontSize: '1.35rem', color: 'var(--md-sys-color-on-secondary-container)' }}>
            {nextRoutineInfo ? `${nextRoutineInfo.slot} (${nextRoutineInfo.time})` : '08:00 AM'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-secondary-container)' }}>
              {nextRoutineInfo?.count ? `${nextRoutineInfo.count} meds scheduled` : 'Scheduled daily routine'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reminderScheduler.testTrigger(nextRoutineInfo?.slot || 'Morning');
              }}
              style={{
                background: 'rgba(0, 0, 0, 0.08)',
                border: 'none',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: 'var(--md-sys-color-on-secondary-container)'
              }}
              title="Test full-screen reminder audio & visual buzzer"
            >
              Test Alarm
            </button>
          </div>
        </div>

        {/* Stat 3: Allergen & Safety Radar */}
        <div className="stat-card" style={{ background: 'var(--md-sys-color-tertiary-container)', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div className="stat-label" style={{ color: 'var(--md-sys-color-on-tertiary-container)' }}>Allergen & Safety Shield</div>
            <ShieldCheck size={20} strokeWidth={2} color="var(--md-sys-color-on-tertiary-container)" />
          </div>
          <div className="stat-value" style={{ fontSize: '1.35rem', color: 'var(--md-sys-color-on-tertiary-container)' }}>
            {allergies.length > 0 ? `${allergies.length} Active Filters` : 'Protected'}
          </div>
          <div className="stat-sub" style={{ color: 'var(--md-sys-color-on-tertiary-container)' }}>
            {conditions.length > 0 ? `${conditions.length} conditions tracked` : 'Auto-conflict radar active'}
          </div>
        </div>
      </div>

      {/* ─── Two Clean Sections: Prescriptions/Scans vs. Daily Care ───────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* PILLAR 1: Prescriptions & Medicine Scanner */}
        <div className="card" style={{ padding: '24px', background: 'var(--md-sys-color-surface-container)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'var(--md-sys-color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--md-sys-color-primary)' }}>
              <Pill size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
                {t('sectionClinical', 'Prescriptions & Scans')}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                Scan medicines, read prescriptions, and check lab reports
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Action 1: Point & Scan */}
            <div
              onClick={() => navigate('/scanner')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '16px',
                background: 'var(--md-sys-color-surface-container-high)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--md-sys-color-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Scan size={20} color="var(--md-sys-color-primary)" />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>{t('scanNewMedicine', 'Scan a Medicine')}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--md-sys-color-on-surface-variant)' }}>Check dosage, ingredients, and safety warnings</div>
                </div>
              </div>
              <ChevronRight size={16} color="var(--md-sys-color-on-surface-variant)" />
            </div>

            {/* Action 2: Reports & Rx */}
            <div
              onClick={() => navigate('/report-analyzer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '16px',
                background: 'var(--md-sys-color-surface-container-high)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--md-sys-color-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={20} color="#0284c7" />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>{t('reportsRx', 'Reports & Prescriptions')}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--md-sys-color-on-surface-variant)' }}>Read doctor prescriptions and check blood test reports</div>
                </div>
              </div>
              <ChevronRight size={16} color="var(--md-sys-color-on-surface-variant)" />
            </div>

            {/* Action 3: Medicine Cabinet */}
            <div
              onClick={() => navigate('/cabinet')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '16px',
                background: 'var(--md-sys-color-surface-container-high)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--md-sys-color-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Package size={20} color="#10b981" />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>{t('cabinet', 'My Medicine Cabinet')}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--md-sys-color-on-surface-variant)' }}>Organized by condition, daily schedule, and alarms</div>
                </div>
              </div>
              <ChevronRight size={16} color="var(--md-sys-color-on-surface-variant)" />
            </div>
          </div>
        </div>

        {/* PILLAR 2: Daily Care & Mental Check-ins */}
        <div className="card" style={{ padding: '24px', background: 'var(--md-sys-color-surface-container)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Brain size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)' }}>
                {t('sectionCognitive', 'Daily Care & Routines')}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                Daily check-ins, routine reminders, and family updates
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Action 1: Memory Stimulation Quiz */}
            <div
              onClick={() => navigate('/cognitive-games?mode=quiz')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '16px',
                background: 'var(--md-sys-color-surface-container-high)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#0284c7'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Brain size={20} color="#0284c7" />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>{t('dailyOrientationQuiz', 'Daily 2-Minute Check-in')}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--md-sys-color-on-surface-variant)' }}>Quick daily mental sharpness and memory exercises</div>
                </div>
              </div>
              <ChevronRight size={16} color="var(--md-sys-color-on-surface-variant)" />
            </div>

            {/* Action 2: Voice Room */}
            <div
              onClick={() => navigate('/voice-therapy')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '16px',
                background: 'var(--md-sys-color-surface-container-high)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#0d9488'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Flower2 size={20} color="#0d9488" />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>{t('voiceTherapy', 'Voice Check-in Room')}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--md-sys-color-on-surface-variant)' }}>Calming voice check-in and routine verification</div>
                </div>
              </div>
              <ChevronRight size={16} color="var(--md-sys-color-on-surface-variant)" />
            </div>

            {/* Action 3: Caregiver Portal */}
            <div
              onClick={() => navigate('/caregiver')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '16px',
                background: 'var(--md-sys-color-surface-container-high)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#f59e0b'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={20} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>{t('caregiver', 'Family & Caregiver Portal')}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--md-sys-color-on-surface-variant)' }}>View medication adherence and wellness summaries</div>
                </div>
              </div>
              <ChevronRight size={16} color="var(--md-sys-color-on-surface-variant)" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Recent Scans & Activity List ─────────────────────────── */}
      <div className="card" style={{ padding: '24px 28px', background: 'var(--md-sys-color-surface-container)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="var(--md-sys-color-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
              {t('recentScans')}
            </h3>
          </div>

          <button
            onClick={() => navigate('/history')}
            style={{ background: 'transparent', border: 'none', color: 'var(--md-sys-color-primary)', fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
          >
            {t('viewAllHistory')} <ChevronRight size={15} />
          </button>
        </div>

        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
            <Pill size={36} style={{ opacity: 0.4, marginBottom: '10px' }} />
            <p style={{ fontSize: '0.9rem', margin: 0 }}>{t('noRecentScans')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recent.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/scan/${item.id}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--md-sys-color-surface-container-low)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--md-sys-color-primary)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--md-sys-color-primary)', flexShrink: 0 }}>
                    <Pill size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h5 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.medicationName || 'Identified Medicine'}
                    </h5>
                    <span style={{ fontSize: '0.78rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'} • {item.drugClass || 'Active Medication'}
                    </span>
                  </div>
                </div>

                <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
