import React from 'react';
import { Search, Package, Plus } from 'lucide-react';
import { CabinetMedCard } from './CabinetMedCard';

export const CabinetShelfView = ({
  totalMedications,
  populatedGroups,
  allGroups,
  displayShelves,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  loading,
  speakingId,
  onSpeak,
  onDelete,
  onNavigateMed,
  onNavigateScanner,
  lang,
  t
}) => {
  return (
    <>
      {/* Summary Stats Row */}
      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-label">{t('totalCabinetMeds')}</div>
          <div className="stat-value">{loading ? '…' : totalMedications}</div>
          <div className="stat-sub">{t('myCabinetDesc')}</div>
        </div>

        <div className="stat-card" style={{ background: 'var(--md-sys-color-secondary-container)' }}>
          <div className="stat-label" style={{ color: 'var(--md-sys-color-on-secondary-container)' }}>{t('activeDiseaseCats')}</div>
          <div className="stat-value" style={{ color: 'var(--md-sys-color-on-secondary-container)' }}>
            {loading ? '…' : populatedGroups.length}
          </div>
          <div className="stat-sub" style={{ color: 'var(--md-sys-color-on-secondary-container)' }}>
            {t('allDiseases')}
          </div>
        </div>

        <div className="stat-card" style={{ background: 'var(--md-sys-color-tertiary-container)' }}>
          <div className="stat-label" style={{ color: 'var(--md-sys-color-on-tertiary-container)' }}>{t('orgStatus')}</div>
          <div className="stat-value" style={{ fontSize: '1.3rem', color: 'var(--md-sys-color-on-tertiary-container)', marginTop: '4px' }}>
            {t('allSorted')}
          </div>
          <div className="stat-sub" style={{ color: 'var(--md-sys-color-on-tertiary-container)' }}>
            {t('aiTaxonomy')}
          </div>
        </div>
      </div>

      {/* Search and Disease Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--md-sys-color-on-surface-variant)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            className="search-input"
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>

        {/* Disease Filter Pills with Localized Names */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
          <button
            onClick={() => onSelectCategory('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--r-full)',
              border: selectedCategory === 'all' ? '1px solid var(--md-sys-color-primary)' : '1px solid var(--border)',
              background: selectedCategory === 'all' ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface)',
              color: selectedCategory === 'all' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            🏠 {t('allDiseases')} ({totalMedications})
          </button>

          {Object.values(allGroups).map(({ category, items }) => {
            const count = items.length;
            if (count === 0 && selectedCategory !== category.id) return null;

            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: 'var(--r-full)',
                  border: isSelected ? `2px solid ${category.color}` : '1px solid var(--border)',
                  background: isSelected ? category.bgColor : 'var(--md-sys-color-surface)',
                  color: isSelected ? category.color : 'var(--md-sys-color-on-surface)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{category.icon}</span>
                <span>{category.shortName}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8, background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 'var(--r-full)' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Disease Shelves View */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--md-sys-color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '14px' }} />
          <p>Organizing your medicines by disease shelves…</p>
        </div>
      ) : displayShelves.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '6px' }}>
            {searchQuery ? `No medications found matching "${searchQuery}"` : t('emptyCabinet')}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 20px' }}>
            {t('emptyCabinetDesc')}
          </p>
          <button className="btn-primary" onClick={onNavigateScanner}>
            <Plus size={16} /> {t('scanFirstMed')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {displayShelves.map(({ category, items }) => (
            <div key={category.id} className="fade-in">
              {/* Shelf Category Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '8px', borderBottom: `2px solid ${category.borderColor || 'var(--border)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.6rem' }}>{category.icon}</span>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                      {category.name}
                    </h2>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {category.description}
                    </span>
                  </div>
                </div>

                <span style={{ padding: '4px 12px', borderRadius: 'var(--r-full)', background: category.bgColor, color: category.color, fontSize: '0.8rem', fontWeight: 700 }}>
                  {t('medicinesCount', { count: items.length })}
                </span>
              </div>

              {/* Shelf Medicines Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {items.map(med => (
                  <CabinetMedCard
                    key={med.id}
                    med={med}
                    category={category}
                    speakingId={speakingId}
                    onSpeak={onSpeak}
                    onDelete={onDelete}
                    onClick={() => onNavigateMed(med.id)}
                    lang={lang}
                    t={t}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
