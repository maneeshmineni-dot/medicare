import React from 'react';
import { Volume2, RotateCcw, Check, Sunrise, Sun, Moon } from 'lucide-react';

export function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
}

export function playAlarmChime() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;

    // Pleasant two-tone hospital/medical chime (880Hz -> 1046.5Hz)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.setValueAtTime(1046.5, now + 0.15);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.5, now + 0.3);
    gain2.gain.setValueAtTime(0.15, now + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.3);
    osc2.stop(now + 0.9);
  } catch (e) {
    console.warn('AudioContext not allowed or supported', e);
  }
}

export const AlarmSettingsModal = ({
  alarmTimes,
  onUpdateAlarmTime,
  onResetAlarmTimes,
  onClose
}) => {
  return (
    <div className="card fade-in" style={{ padding: '24px', border: '2px solid var(--md-sys-color-primary)', background: 'var(--md-sys-color-surface-container-low)', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
            Customize Alarm Timings
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Adjust when PharmaVision alerts you for each daily medication routine.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={playAlarmChime}
            style={{ gap: '6px', fontSize: '0.82rem' }}
            title="Play medical reminder sound preview"
          >
            <Volume2 size={16} strokeWidth={2} /> Test Chime
          </button>
          <button
            className="btn-secondary"
            onClick={onResetAlarmTimes}
            style={{ gap: '6px', fontSize: '0.82rem' }}
            title="Reset to default timings (8 AM, 1 PM, 9 PM)"
          >
            <RotateCcw size={16} strokeWidth={2} /> Reset Defaults
          </button>
          <button
            className="btn-primary"
            onClick={onClose}
            style={{ gap: '6px', fontSize: '0.82rem' }}
          >
            <Check size={16} strokeWidth={2} /> Done
          </button>
        </div>
      </div>

      {/* 3 Alarm Time Pickers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
        {/* Morning Time Picker */}
        <div style={{ padding: '16px', borderRadius: 'var(--r-md)', background: 'var(--md-sys-color-surface)', border: '1px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Sunrise size={20} color="#f59e0b" />
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--md-sys-color-on-surface)' }}>Morning Alarm</span>
          </div>
          <input
            type="time"
            value={alarmTimes.morning}
            onChange={e => onUpdateAlarmTime('morning', e.target.value)}
            style={{ width: '100%', padding: '10px 12px', fontSize: '1.05rem', fontWeight: 700, borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--md-sys-color-surface-container-low)', color: 'var(--md-sys-color-on-surface)', marginBottom: '8px' }}
          />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Active: <strong>{formatTime12h(alarmTimes.morning)}</strong> (Breakfast)
          </div>
        </div>

        {/* Afternoon Time Picker */}
        <div style={{ padding: '16px', borderRadius: 'var(--r-md)', background: 'var(--md-sys-color-surface)', border: '1px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Sun size={20} color="#3b82f6" />
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--md-sys-color-on-surface)' }}>Afternoon Alarm</span>
          </div>
          <input
            type="time"
            value={alarmTimes.afternoon}
            onChange={e => onUpdateAlarmTime('afternoon', e.target.value)}
            style={{ width: '100%', padding: '10px 12px', fontSize: '1.05rem', fontWeight: 700, borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--md-sys-color-surface-container-low)', color: 'var(--md-sys-color-on-surface)', marginBottom: '8px' }}
          />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Active: <strong>{formatTime12h(alarmTimes.afternoon)}</strong> (Lunch)
          </div>
        </div>

        {/* Night Time Picker */}
        <div style={{ padding: '16px', borderRadius: 'var(--r-md)', background: 'var(--md-sys-color-surface)', border: '1px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Moon size={20} color="#8b5cf6" />
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--md-sys-color-on-surface)' }}>Night Alarm</span>
          </div>
          <input
            type="time"
            value={alarmTimes.night}
            onChange={e => onUpdateAlarmTime('night', e.target.value)}
            style={{ width: '100%', padding: '10px 12px', fontSize: '1.05rem', fontWeight: 700, borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--md-sys-color-surface-container-low)', color: 'var(--md-sys-color-on-surface)', marginBottom: '8px' }}
          />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Active: <strong>{formatTime12h(alarmTimes.night)}</strong> (Dinner / Bedtime)
          </div>
        </div>
      </div>
    </div>
  );
};
