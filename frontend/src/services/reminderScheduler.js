/**
 * Full-Screen Intrusive Reminder Scheduler for High-Risk Dosage & Caregiver Alerts
 * Includes an active clock watcher that checks daily routine alarms (Morning, Afternoon, Night)
 * and dispatches notifications when medication times arrive.
 */

const DEFAULT_ALARM_TIMES = {
  morning: '08:00',
  afternoon: '13:00',
  night: '20:00'
};

class ReminderScheduler {
  constructor() {
    this.activeReminder = null;
    this.subscribers = new Set();
    this.checkInterval = null;
    this.isChecking = false;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach(cb => {
      try {
        cb(this.activeReminder);
      } catch (e) {}
    });
  }

  triggerReminder(reminderData) {
    this.activeReminder = {
      id: 'rem_' + Date.now(),
      title: reminderData.title || 'Medication Routine Time',
      medicineName: reminderData.medicineName || 'Scheduled Medicine',
      dosage: reminderData.dosage || '1 Tablet with water',
      slot: reminderData.slot || 'Morning',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...reminderData
    };
    this.notify();
  }

  dismissReminder() {
    this.activeReminder = null;
    this.notify();
  }

  getAlarmTimings() {
    try {
      const saved = localStorage.getItem('pharmavision_alarm_timings');
      return saved ? JSON.parse(saved) : DEFAULT_ALARM_TIMES;
    } catch {
      return DEFAULT_ALARM_TIMES;
    }
  }

  getScheduledMedicinesForSlot(slotName) {
    const slot = slotName.toLowerCase();
    try {
      let items = [];
      const sessionCache = sessionStorage.getItem('pv_history_cache');
      if (sessionCache) {
        const parsed = JSON.parse(sessionCache);
        if (parsed && Array.isArray(parsed.history)) items = parsed.history;
      }
      if (items.length === 0) {
        const localCabinet = localStorage.getItem('pharmavision_cabinet');
        if (localCabinet) items = JSON.parse(localCabinet);
      }

      if (!Array.isArray(items) || items.length === 0) return null;

      let overrides = {};
      try {
        const savedOverrides = localStorage.getItem('pharmavision_schedule_overrides');
        if (savedOverrides) overrides = JSON.parse(savedOverrides);
      } catch {}

      const matchingMeds = items.filter(med => {
        if (overrides[med.id]) {
          return overrides[med.id].includes(slot);
        }
        const text = `${med.dosageInstructions || ''} ${med.rawAnalysis || ''}`.toLowerCase();
        if (slot === 'morning') {
          return text.includes('morning') || text.includes('1-0-1') || text.includes('1-0-0') || text.includes('1-1-1') || text.includes('breakfast') || text.includes(' od') || text.includes('daily');
        } else if (slot === 'afternoon') {
          return text.includes('afternoon') || text.includes('lunch') || text.includes('1-1-1') || text.includes('0-1-0') || text.includes('tds') || text.includes('qid');
        } else if (slot === 'night') {
          return text.includes('night') || text.includes('bedtime') || text.includes('dinner') || text.includes('1-0-1') || text.includes('0-0-1') || text.includes('1-1-1') || text.includes(' bd') || text.includes('hs');
        }
        return false;
      });

      return matchingMeds;
    } catch (e) {
      return null;
    }
  }

  checkAlarms() {
    try {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;
      const todayDateStr = now.toISOString().split('T')[0];

      const alarms = this.getAlarmTimings();

      for (const [slot, timeVal] of Object.entries(alarms)) {
        if (!timeVal) continue;
        const normalizedAlarmTime = timeVal.trim();

        if (normalizedAlarmTime === currentTimeStr) {
          const key = `pharmavision_alarm_last_${slot}`;
          const lastTriggered = localStorage.getItem(key);

          // Only trigger once per day per slot
          if (lastTriggered !== todayDateStr) {
            localStorage.setItem(key, todayDateStr);

            const slotTitle = slot.charAt(0).toUpperCase() + slot.slice(1);
            const meds = this.getScheduledMedicinesForSlot(slot);

            if (meds && meds.length > 0) {
              const medNames = meds.map(m => m.medicationName || 'Prescribed Medicine').join(', ');
              this.triggerReminder({
                slot: slotTitle,
                title: `${slotTitle} Medication Routine`,
                medicineName: medNames,
                dosage: meds.length === 1 ? (meds[0].dosageInstructions || 'Take 1 tablet with water after meal') : `Take scheduled ${slotTitle} doses (${meds.length} medications)`
              });
            } else {
              this.triggerReminder({
                slot: slotTitle,
                title: `${slotTitle} Health Check`,
                medicineName: `${slotTitle} Scheduled Dosage`,
                dosage: 'Check your medicine cabinet and take your prescribed pills.'
              });
            }
            break;
          }
        }
      }
    } catch (err) {
      console.warn('[ReminderScheduler] Error checking alarms:', err);
    }
  }

  startAutoCheck() {
    if (this.isChecking) return;
    this.isChecking = true;
    // Initial check
    this.checkAlarms();
    // Watch every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkAlarms();
    }, 30 * 1000);
  }

  stopAutoCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isChecking = false;
  }

  // Diagnostic Test Trigger
  testTrigger(slot = 'Morning') {
    const meds = this.getScheduledMedicinesForSlot(slot);
    const medName = meds && meds.length > 0
      ? meds.map(m => m.medicationName).join(', ')
      : 'Augmentin 625mg & Rosuvastatin 10mg';

    this.triggerReminder({
      slot,
      title: `${slot} Medication Time (Live Test)`,
      medicineName: medName,
      dosage: 'Take 1 tablet with a full glass of water after meals.'
    });
  }
}

export const reminderScheduler = new ReminderScheduler();
