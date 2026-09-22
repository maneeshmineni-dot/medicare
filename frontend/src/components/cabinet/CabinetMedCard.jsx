import React from 'react';
import { Pill, Volume2, Trash2, ChevronRight } from 'lucide-react';

export const CabinetMedCard = ({
  med,
  category,
  speakingId,
  onSpeak,
  onDelete,
  onClick,
  lang,
  t
}) => {
  return (
    <div
      onClick={onClick}
      className="card"
      style={{
        padding: '20px',
        borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-elevation-1)'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-elevation-2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-elevation-1)';
      }}
    >
      <div>
        {/* Top Row: Icon + Name + Audio + Delete */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--r-full)', background: category.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Pill size={20} color={category.color} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0, lineHeight: 1.3 }}>
                {med.medicationName}
              </h3>
              <span style={{ fontSize: '0.72rem', color: category.color, fontWeight: 700, textTransform: 'uppercase' }}>
                {category.shortName}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {/* Audio Voice Button */}
            <button
              className="btn-ghost"
              title={t('listenAudio')}
              onClick={(e) => onSpeak(med, e)}
              style={{
                width: '36px',
                height: '36px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--r-full)',
                background: speakingId === med.id ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container)',
                color: speakingId === med.id ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
                border: '1px solid var(--border)'
              }}
            >
              <Volume2 size={16} />
            </button>
            {/* Delete Button */}
            <button
              className="btn-danger"
              title="Remove"
              onClick={(e) => onDelete(med.id, e)}
              style={{
                width: '36px',
                height: '36px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--r-full)'
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Primary Use */}
        {med.primaryUse && (
          <p style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
            {med.primaryUse.substring(0, 110)}{med.primaryUse.length > 110 ? '…' : ''}
          </p>
        )}

        {/* Dosage Routine */}
        {med.dosageInstructions && (
          <div style={{ fontSize: '0.8rem', padding: '6px 10px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-sm)', color: 'var(--md-sys-color-on-surface)', marginBottom: '10px' }}>
            <strong>{t('dosageInstructions')}:</strong> {med.dosageInstructions}
          </div>
        )}

        {/* Active Ingredients Tags */}
        {med.activeIngredients && med.activeIngredients.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
            {med.activeIngredients.slice(0, 2).map((ing, iIdx) => (
              <span key={iIdx} className="badge badge-cyan" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                ⚗ {ing}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Link Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>
          {t('addedOn', {
            date: new Date(med.createdAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-US', { month: 'short', day: 'numeric' })
          })}
        </span>
        <span style={{ color: 'var(--md-sys-color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
          {t('viewDetails')} <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
};
