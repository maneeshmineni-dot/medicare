/**
 * Local & Offline-First Storage for Cognitive Session History
 */

const STORAGE_KEY = 'pv_cognitive_sessions_v1';

export const cognitiveStorage = {
  getSessions: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('[CognitiveStorage] Read error:', e);
      return [];
    }
  },

  saveSession: (session) => {
    try {
      const sessions = cognitiveStorage.getSessions();
      const newSession = {
        id: session.id || 'cs_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: Date.now(),
        ...session
      };
      sessions.unshift(newSession);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 100))); // Keep last 100
      return newSession;
    } catch (e) {
      console.warn('[CognitiveStorage] Write error:', e);
      return session;
    }
  },

  getStats: (days = 30) => {
    const sessions = cognitiveStorage.getSessions();
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const filtered = sessions.filter(s => s.timestamp >= cutoff);

    const totalSessions = filtered.length;
    const avgScore = totalSessions > 0
      ? Math.round(filtered.reduce((acc, s) => acc + (s.score || 0), 0) / totalSessions)
      : 0;
    const avgHesitationMs = totalSessions > 0
      ? Math.round(filtered.reduce((acc, s) => acc + (s.hesitationScore || 0), 0) / totalSessions)
      : 0;

    return {
      totalSessions,
      avgScore,
      avgHesitationMs,
      recentSessions: filtered.slice(0, 10)
    };
  }
};
