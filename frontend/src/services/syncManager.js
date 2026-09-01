/**
 * Sync Manager: Bridges Local IndexedDB/LocalStorage with Backend API & Supabase
 */

import { cognitiveStorage } from './cognitiveStorage';
import { api } from './api';

class SyncManager {
  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.isSyncing = false;
    this.listeners = new Set();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notify();
        this.triggerSync();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notify();
      });
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => {
      try {
        cb({ isOnline: this.isOnline, isSyncing: this.isSyncing });
      } catch (e) {}
    });
  }

  async triggerSync() {
    if (!this.isOnline || this.isSyncing) return;
    this.isSyncing = true;
    this.notify();

    try {
      const localSessions = cognitiveStorage.getSessions().slice(0, 20);
      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/cognitive/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: localSessions })
      });
    } catch (err) {
      console.warn('[SyncManager] Background sync warning:', err.message);
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }

  async getCaregiverAnalytics(days = 30) {
    // 1. Try server fetch
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/cognitive/caregiver-analytics?days=${days}`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {}

    // 2. Fallback to local storage computation
    const localStats = cognitiveStorage.getStats(days);
    return {
      success: true,
      timeframeDays: days,
      metrics: {
        adherenceRate: 0,
        totalDosesLogged: 0,
        takenDoses: 0,
        cognitiveHealthScore: localStats.avgScore || 0,
        totalCognitiveSessions: localStats.totalSessions || 0,
        avgHesitationMs: localStats.avgHesitationMs || 0
      },
      sessions: localStats.recentSessions || []
    };
  }
}

export const syncManager = new SyncManager();
