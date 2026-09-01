import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, Volume2, X, AlertTriangle, Pill } from 'lucide-react';
import { reminderScheduler } from '../../services/reminderScheduler';
import { playGentleTone, speakText } from '../../utils/speechUtils';

export const FullScreenReminderModal = () => {
  const [reminder, setReminder] = useState(null);

  useEffect(() => {
    const unsub = reminderScheduler.subscribe((activeRem) => {
      setReminder(activeRem);
      if (activeRem) {
        playGentleTone(528, 2.5);
        speakText(`Reminder: It is time for your ${activeRem.slot} medication, ${activeRem.medicineName}.`);
      }
    });

    return () => unsub();
  }, []);

  if (!reminder) return null;

  const handleAcknowledge = () => {
    reminderScheduler.dismissReminder();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.88)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        maxWidth: '540px',
        width: '100%',
        background: 'var(--md-sys-color-surface)',
        borderRadius: '32px',
        border: '2px solid #8b5cf6',
        boxShadow: '0 25px 70px rgba(139, 92, 246, 0.4)',
        padding: '36px 28px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Pulsing Pill Icon */}
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#fff',
          boxShadow: '0 10px 30px rgba(139, 92, 246, 0.5)',
          animation: 'pulseGlow 2s infinite'
        }}>
          <Pill size={42} />
        </div>

        <span style={{
          display: 'inline-block',
          background: '#ede9fe',
          color: '#6d28d9',
          fontWeight: 800,
          fontSize: '0.85rem',
          padding: '6px 16px',
          borderRadius: '999px',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {reminder.slot} Routine Check
        </span>

        <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--md-sys-color-on-surface)', margin: '0 0 10px' }}>
          {reminder.medicineName}
        </h2>

        <p style={{ fontSize: '1.1rem', color: 'var(--md-sys-color-on-surface-variant)', margin: '0 0 24px', lineHeight: 1.5 }}>
          {reminder.dosage}
        </p>

        <div style={{
          background: 'var(--md-sys-color-surface-container-high)',
          borderRadius: '20px',
          padding: '16px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          color: 'var(--md-sys-color-on-surface)'
        }}>
          <Clock size={20} color="#8b5cf6" />
          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Scheduled Time: {reminder.time}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleAcknowledge}
            className="btn-primary"
            style={{
              padding: '16px 24px',
              fontSize: '1.1rem',
              fontWeight: 800,
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
              cursor: 'pointer'
            }}
          >
            <CheckCircle2 size={24} />
            I Have Taken This Medicine
          </button>

          <button
            onClick={handleAcknowledge}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--md-sys-color-on-surface-variant)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            Remind me in 10 minutes
          </button>
        </div>
      </div>
    </div>
  );
};
