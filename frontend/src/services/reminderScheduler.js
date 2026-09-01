/**
 * Full-Screen Intrusive Reminder Scheduler for High-Risk Dosage & Caregiver Alerts
 */

class ReminderScheduler {
  constructor() {
    this.activeReminder = null;
    this.subscribers = new Set();
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
      title: reminderData.title || 'Medication Time',
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
}

export const reminderScheduler = new ReminderScheduler();
