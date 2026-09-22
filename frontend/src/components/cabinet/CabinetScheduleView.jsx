import React, { useState } from 'react';
import {
  BellRing, Settings, Bell, Move, RotateCcw, Sunrise, Edit3, GripVertical, X, Sun, Moon, Package
} from 'lucide-react';
import { AlarmSettingsModal, formatTime12h } from './AlarmSettingsModal';

export const CabinetScheduleView = ({
  history,
  morningMeds,
  afternoonMeds,
  nightMeds,
  alarmTimes,
  showAlarmConfig,
  setShowAlarmConfig,
  onUpdateAlarmTime,
  onResetAlarmTimes,
  notificationStatus,
  onEnableReminders,
  onResetScheduleOverrides,
  handleMoveMedication,
  handleRemoveFromRoutine,
  getMedRoutines
}) => {
  const [draggedMedId, setDraggedMedId] = useState(null);
  const [dragOverRoutine, setDragOverRoutine] = useState(null);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Notification Banner */}
      <div className="card" style={{ padding: '20px 24px', background: 'var(--md-sys-color-primary-container)', border: '1px solid var(--md-sys-color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '10px', borderRadius: '50%', background: 'var(--md-sys-color-surface)', color: 'var(--md-sys-color-primary)' }}>
            <BellRing size={24} strokeWidth={2} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--md-sys-color-on-primary-container)', margin: 0 }}>
              Daily Pill Schedule & Dose Reminders
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-primary-container)', margin: '4px 0 0 0', opacity: 0.9 }}>
              Automatic time-based routine mapping. Alarms chime at your configured routine times.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn-secondary"
            onClick={() => setShowAlarmConfig(!showAlarmConfig)}
            style={{ background: 'var(--md-sys-color-surface)', color: 'var(--md-sys-color-on-surface)', gap: '6px', fontSize: '0.85rem' }}
          >
            <Settings size={16} strokeWidth={2} /> {showAlarmConfig ? 'Hide Settings' : 'Customize Timings'}
          </button>
          <button
            className="btn-primary"
            onClick={onEnableReminders}
            style={{ background: 'var(--md-sys-color-primary)', color: 'var(--md-sys-color-on-primary)', gap: '8px', fontSize: '0.85rem' }}
          >
            <Bell size={16} strokeWidth={2} /> Enable Dose Alarms
          </button>
        </div>
      </div>

      {/* Alarm Timings Customization Panel */}
      {showAlarmConfig && (
        <AlarmSettingsModal
          alarmTimes={alarmTimes}
          onUpdateAlarmTime={onUpdateAlarmTime}
          onResetAlarmTimes={onResetAlarmTimes}
          onClose={() => setShowAlarmConfig(false)}
        />
      )}

      {notificationStatus && (
        <div style={{ padding: '12px 18px', borderRadius: 'var(--r-md)', background: 'var(--md-sys-color-surface-container-low)', border: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--md-sys-color-on-surface)' }}>
          {notificationStatus}
        </div>
      )}

      {/* Drag & Drop Guidance Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', padding: '12px 18px', background: 'var(--md-sys-color-surface-container-low)', borderRadius: 'var(--r-md)', border: '1px dashed var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--md-sys-color-on-surface)' }}>
          <Move size={16} color="var(--md-sys-color-primary)" />
          <span>
            <strong>Drag & Drop Enabled:</strong> Drag any medicine card between <strong>Morning</strong>, <strong>Afternoon</strong>, and <strong>Night</strong> slots to customize your daily schedule.
          </span>
        </div>

        <button
          className="btn-secondary"
          onClick={onResetScheduleOverrides}
          style={{ fontSize: '0.78rem', padding: '4px 12px', gap: '4px' }}
          title="Re-align with original doctor dosage label instructions"
        >
          <RotateCcw size={13} /> Reset to Prescription Defaults
        </button>
      </div>

      {/* Schedule 3-Column Routine Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Morning Dose Slot */}
        <div
          className="card"
          onDragOver={e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (dragOverRoutine !== 'morning') setDragOverRoutine('morning');
          }}
          onDragLeave={() => {
            if (dragOverRoutine === 'morning') setDragOverRoutine(null);
          }}
          onDrop={e => {
            e.preventDefault();
            setDragOverRoutine(null);
            const medId = e.dataTransfer.getData('text/plain') || draggedMedId;
            if (medId) handleMoveMedication(medId, 'morning');
          }}
          style={{
            padding: '20px',
            borderTop: '4px solid #f59e0b',
            border: dragOverRoutine === 'morning' ? '2px dashed #f59e0b' : undefined,
            background: dragOverRoutine === 'morning' ? 'rgba(245, 158, 11, 0.08)' : undefined,
            transition: 'all 0.2s ease',
            minHeight: '260px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sunrise size={22} color="#f59e0b" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                Morning Routine
              </h3>
            </div>
            <button
              onClick={() => setShowAlarmConfig(true)}
              className="badge badge-amber"
              style={{ cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Click to edit morning timing"
            >
              {formatTime12h(alarmTimes.morning)} (Breakfast) <Edit3 size={11} />
            </button>
          </div>

          {morningMeds.length === 0 ? (
            <div style={{ padding: '30px 16px', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>Drop medications here for Morning routine</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {morningMeds.map(med => (
                <div
                  key={med.id}
                  draggable={true}
                  onDragStart={e => {
                    e.dataTransfer.setData('text/plain', med.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setDraggedMedId(med.id);
                  }}
                  onDragEnd={() => {
                    setDraggedMedId(null);
                    setDragOverRoutine(null);
                  }}
                  style={{
                    padding: '12px 14px',
                    background: draggedMedId === med.id ? 'rgba(0,0,0,0.03)' : 'var(--md-sys-color-surface-container-low)',
                    opacity: draggedMedId === med.id ? 0.4 : 1,
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border)',
                    cursor: 'grab',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GripVertical size={16} color="var(--text-muted)" style={{ opacity: 0.6 }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--md-sys-color-on-surface)' }}>{med.medicationName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{med.dosageInstructions || 'Take 1 dose after breakfast'}</div>
                      </div>
                    </div>

                    <button
                      onClick={e => handleRemoveFromRoutine(med.id, 'morning', e)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                      title="Remove from Morning routine"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Quick Move Shortcut Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border)', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Move:</span>
                    <button
                      onClick={e => { e.stopPropagation(); handleMoveMedication(med.id, 'afternoon'); }}
                      style={{ padding: '2px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)', background: 'var(--md-sys-color-surface)', color: '#3b82f6', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                    >
                      ☀️ Afternoon
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleMoveMedication(med.id, 'night'); }}
                      style={{ padding: '2px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)', background: 'var(--md-sys-color-surface)', color: '#8b5cf6', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                    >
                      🌙 Night
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Afternoon Dose Slot */}
        <div
          className="card"
          onDragOver={e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (dragOverRoutine !== 'afternoon') setDragOverRoutine('afternoon');
          }}
          onDragLeave={() => {
            if (dragOverRoutine === 'afternoon') setDragOverRoutine(null);
          }}
          onDrop={e => {
            e.preventDefault();
            setDragOverRoutine(null);
            const medId = e.dataTransfer.getData('text/plain') || draggedMedId;
            if (medId) handleMoveMedication(medId, 'afternoon');
          }}
          style={{
            padding: '20px',
            borderTop: '4px solid #3b82f6',
            border: dragOverRoutine === 'afternoon' ? '2px dashed #3b82f6' : undefined,
            background: dragOverRoutine === 'afternoon' ? 'rgba(59, 130, 246, 0.08)' : undefined,
            transition: 'all 0.2s ease',
            minHeight: '260px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sun size={22} color="#3b82f6" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                Afternoon Routine
              </h3>
            </div>
            <button
              onClick={() => setShowAlarmConfig(true)}
              className="badge badge-cyan"
              style={{ cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Click to edit afternoon timing"
            >
              {formatTime12h(alarmTimes.afternoon)} (Lunch) <Edit3 size={11} />
            </button>
          </div>

          {afternoonMeds.length === 0 ? (
            <div style={{ padding: '30px 16px', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>Drop medications here for Afternoon routine</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {afternoonMeds.map(med => (
                <div
                  key={med.id}
                  draggable={true}
                  onDragStart={e => {
                    e.dataTransfer.setData('text/plain', med.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setDraggedMedId(med.id);
                  }}
                  onDragEnd={() => {
                    setDraggedMedId(null);
                    setDragOverRoutine(null);
                  }}
                  style={{
                    padding: '12px 14px',
                    background: draggedMedId === med.id ? 'rgba(0,0,0,0.03)' : 'var(--md-sys-color-surface-container-low)',
                    opacity: draggedMedId === med.id ? 0.4 : 1,
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border)',
                    cursor: 'grab',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GripVertical size={16} color="var(--text-muted)" style={{ opacity: 0.6 }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--md-sys-color-on-surface)' }}>{med.medicationName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{med.dosageInstructions || 'Take 1 dose after lunch'}</div>
                      </div>
                    </div>

                    <button
                      onClick={e => handleRemoveFromRoutine(med.id, 'afternoon', e)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                      title="Remove from Afternoon routine"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Quick Move Shortcut Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border)', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Move:</span>
                    <button
                      onClick={e => { e.stopPropagation(); handleMoveMedication(med.id, 'morning'); }}
                      style={{ padding: '2px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)', background: 'var(--md-sys-color-surface)', color: '#f59e0b', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                    >
                      🌅 Morning
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleMoveMedication(med.id, 'night'); }}
                      style={{ padding: '2px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)', background: 'var(--md-sys-color-surface)', color: '#8b5cf6', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                    >
                      🌙 Night
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Night Dose Slot */}
        <div
          className="card"
          onDragOver={e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (dragOverRoutine !== 'night') setDragOverRoutine('night');
          }}
          onDragLeave={() => {
            if (dragOverRoutine === 'night') setDragOverRoutine(null);
          }}
          onDrop={e => {
            e.preventDefault();
            setDragOverRoutine(null);
            const medId = e.dataTransfer.getData('text/plain') || draggedMedId;
            if (medId) handleMoveMedication(medId, 'night');
          }}
          style={{
            padding: '20px',
            borderTop: '4px solid #8b5cf6',
            border: dragOverRoutine === 'night' ? '2px dashed #8b5cf6' : undefined,
            background: dragOverRoutine === 'night' ? 'rgba(139, 92, 246, 0.08)' : undefined,
            transition: 'all 0.2s ease',
            minHeight: '260px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Moon size={22} color="#8b5cf6" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                Night Routine
              </h3>
            </div>
            <button
              onClick={() => setShowAlarmConfig(true)}
              className="badge badge-purple"
              style={{ cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Click to edit night timing"
            >
              {formatTime12h(alarmTimes.night)} (Dinner / Bedtime) <Edit3 size={11} />
            </button>
          </div>

          {nightMeds.length === 0 ? (
            <div style={{ padding: '30px 16px', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: 'var(--r-md)', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>Drop medications here for Night routine</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {nightMeds.map(med => (
                <div
                  key={med.id}
                  draggable={true}
                  onDragStart={e => {
                    e.dataTransfer.setData('text/plain', med.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setDraggedMedId(med.id);
                  }}
                  onDragEnd={() => {
                    setDraggedMedId(null);
                    setDragOverRoutine(null);
                  }}
                  style={{
                    padding: '12px 14px',
                    background: draggedMedId === med.id ? 'rgba(0,0,0,0.03)' : 'var(--md-sys-color-surface-container-low)',
                    opacity: draggedMedId === med.id ? 0.4 : 1,
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border)',
                    cursor: 'grab',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <GripVertical size={16} color="var(--text-muted)" style={{ opacity: 0.6 }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--md-sys-color-on-surface)' }}>{med.medicationName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{med.dosageInstructions || 'Take 1 dose after dinner'}</div>
                      </div>
                    </div>

                    <button
                      onClick={e => handleRemoveFromRoutine(med.id, 'night', e)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                      title="Remove from Night routine"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Quick Move Shortcut Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed var(--border)', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Move:</span>
                    <button
                      onClick={e => { e.stopPropagation(); handleMoveMedication(med.id, 'morning'); }}
                      style={{ padding: '2px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)', background: 'var(--md-sys-color-surface)', color: '#f59e0b', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                    >
                      🌅 Morning
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleMoveMedication(med.id, 'afternoon'); }}
                      style={{ padding: '2px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--border)', background: 'var(--md-sys-color-surface)', color: '#3b82f6', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}
                    >
                      ☀️ Afternoon
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Cabinet Medications Quick Drag Tray */}
      {history.length > 0 && (
        <div className="card" style={{ padding: '20px', background: 'var(--md-sys-color-surface-container-low)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} color="var(--md-sys-color-primary)" />
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--md-sys-color-on-surface)', margin: 0 }}>
                Cabinet Medications Tray (Drag into Any Routine Above)
              </h4>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {history.length} medicines available in cabinet
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {history.map(med => {
              const assigned = getMedRoutines(med);
              return (
                <div
                  key={med.id}
                  draggable={true}
                  onDragStart={e => {
                    e.dataTransfer.setData('text/plain', med.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setDraggedMedId(med.id);
                  }}
                  onDragEnd={() => {
                    setDraggedMedId(null);
                    setDragOverRoutine(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: 'var(--r-full)',
                    background: 'var(--md-sys-color-surface)',
                    border: '1px solid var(--border)',
                    cursor: 'grab',
                    fontSize: '0.84rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  <GripVertical size={14} color="var(--text-muted)" style={{ opacity: 0.5 }} />
                  <span style={{ fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>{med.medicationName}</span>

                  {/* Quick assignment pills */}
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
                    <button
                      onClick={() => handleMoveMedication(med.id, 'morning')}
                      style={{ border: 'none', background: assigned.includes('morning') ? '#f59e0b' : 'rgba(0,0,0,0.05)', color: assigned.includes('morning') ? '#fff' : 'var(--text-muted)', borderRadius: 'var(--r-full)', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 700 }}
                      title="Add to Morning Routine"
                    >
                      🌅 {assigned.includes('morning') ? '✓' : '+'}
                    </button>
                    <button
                      onClick={() => handleMoveMedication(med.id, 'afternoon')}
                      style={{ border: 'none', background: assigned.includes('afternoon') ? '#3b82f6' : 'rgba(0,0,0,0.05)', color: assigned.includes('afternoon') ? '#fff' : 'var(--text-muted)', borderRadius: 'var(--r-full)', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 700 }}
                      title="Add to Afternoon Routine"
                    >
                      ☀️ {assigned.includes('afternoon') ? '✓' : '+'}
                    </button>
                    <button
                      onClick={() => handleMoveMedication(med.id, 'night')}
                      style={{ border: 'none', background: assigned.includes('night') ? '#8b5cf6' : 'rgba(0,0,0,0.05)', color: assigned.includes('night') ? '#fff' : 'var(--text-muted)', borderRadius: 'var(--r-full)', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 700 }}
                      title="Add to Night Routine"
                    >
                      🌙 {assigned.includes('night') ? '✓' : '+'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
