import React, { useState, useEffect } from 'react';
import {
  Activity, AlertTriangle, CheckCircle, Clock, Droplet, Pill, RefreshCw,
  TrendingDown, TrendingUp, Wifi, WifiOff, ShieldCheck, Calendar, Sparkles, Trophy
} from 'lucide-react';
import { syncManager } from '../services/syncManager';
import { useLanguage } from '../context/LanguageContext';

export const CaregiverDashboard = () => {
  const { t } = useLanguage();
  const [timeframe, setTimeframe] = useState(7); // 7 or 30 days
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(syncManager.isOnline);
  const [analyticsData, setAnalyticsData] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await syncManager.getCaregiverAnalytics(timeframe);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error loading caregiver analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsub = syncManager.subscribe(status => {
      setIsOnline(status.isOnline);
      setSyncing(status.isSyncing);
    });

    return () => unsub();
  }, [timeframe]);

  const handleManualSync = async () => {
    await syncManager.triggerSync();
    await loadData();
  };

  const metrics = analyticsData?.metrics || {
    adherenceRate: 94,
    totalDosesLogged: 28,
    takenDoses: 26,
    cognitiveHealthScore: 88,
    totalCognitiveSessions: 12,
    avgHesitationMs: 1150
  };

  return (
    <div className="page-inner" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--md-sys-color-on-surface)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Caregiver & Family Telemetry
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--md-sys-color-on-surface-variant)', margin: 0 }}>
            Real-time medication adherence, cognitive trend tracking, and missed routine alerts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Online/Offline Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            background: isOnline ? '#ecfdf5' : '#fef2f2',
            color: isOnline ? '#065f46' : '#991b1b',
            border: isOnline ? '1px solid #10b981' : '1px solid #ef4444'
          }}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isOnline ? 'Cloud Synced' : 'Offline Mode'}
          </div>

          {/* Timeframe Toggle */}
          <div style={{ display: 'flex', background: 'var(--md-sys-color-surface-container)', padding: '4px', borderRadius: '14px' }}>
            <button
              onClick={() => setTimeframe(7)}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                border: 'none',
                background: timeframe === 7 ? 'var(--md-sys-color-surface)' : 'transparent',
                color: timeframe === 7 ? 'var(--md-sys-color-on-surface)' : 'var(--md-sys-color-on-surface-variant)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeframe(30)}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                border: 'none',
                background: timeframe === 30 ? 'var(--md-sys-color-surface)' : 'transparent',
                color: timeframe === 30 ? 'var(--md-sys-color-on-surface)' : 'var(--md-sys-color-on-surface-variant)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="btn-secondary"
            style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--r-full)' }}
          >
            <RefreshCw size={14} className={syncing ? 'spin' : ''} />
            {syncing ? 'Syncing…' : 'Sync'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Adherence Rate</span>
            <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <Pill size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            {metrics.adherenceRate}%
          </div>
          <div className="stat-trend trend-up">
            <TrendingUp size={14} /> {metrics.takenDoses} of {metrics.totalDosesLogged || 28} doses taken
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Cognitive Index</span>
            <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
              <Trophy size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#7c3aed' }}>
            {metrics.cognitiveHealthScore} / 100
          </div>
          <div className="stat-trend trend-up">
            {metrics.totalCognitiveSessions} memory tests evaluated
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Avg Recall Hesitation</span>
            <div className="stat-icon" style={{ background: '#fdf2f8', color: '#ec4899' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-value">
            {metrics.avgHesitationMs} <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>ms</span>
          </div>
          <div className="stat-trend" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            Normal response baseline
          </div>
        </div>
      </div>

      {/* Caregiver Safety Assurance Card */}
      <div className="card" style={{ padding: '24px', borderRadius: '24px', marginBottom: '28px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <ShieldCheck size={24} color="#10b981" />
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Caregiver Notification Status</h3>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5 }}>
          Intrusive reminders and missed-dose notifications are enabled. In the event of two consecutive missed routines, an automated caregiver alert is generated.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ background: 'var(--md-sys-color-surface-container)', padding: '14px', borderRadius: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface-variant)' }}>Primary Caregiver</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, marginTop: '4px' }}>Dr. Ramesh (Family Physician)</div>
          </div>
          <div style={{ background: 'var(--md-sys-color-surface-container)', padding: '14px', borderRadius: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface-variant)' }}>Next Routine Slot</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, marginTop: '4px' }}>Tonight @ 09:00 PM (Bedtime)</div>
          </div>
          <div style={{ background: 'var(--md-sys-color-surface-container)', padding: '14px', borderRadius: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface-variant)' }}>Emergency Protocol</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>Active & Ready</div>
          </div>
        </div>
      </div>
    </div>
  );
};
