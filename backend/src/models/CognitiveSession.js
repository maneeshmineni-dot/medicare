const { getSupabaseClient } = require('../config/supabase');

// Local in-memory fallback store
const localCognitiveSessions = new Map();

class CognitiveSession {
  static async create(sessionData) {
    const supabase = getSupabaseClient();
    const id = sessionData.id || sessionData.sessionId || 'cs_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const record = {
      id,
      session_id: sessionData.sessionId || id,
      user_id: sessionData.userId || 'anonymous_patient',
      game_type: sessionData.gameType || 'reminiscence_match',
      difficulty_level: sessionData.difficultyLevel || 1,
      grid_size: sessionData.gridSize || '2x2',
      completion_time_ms: sessionData.completionTimeMs || 0,
      reaction_time_ms: sessionData.reactionTimeMs || 0,
      hesitation_score: sessionData.hesitationScore || 0,
      error_rate: sessionData.errorRate || 0,
      score: sessionData.score || 0,
      created_at: sessionData.timestamp ? new Date(sessionData.timestamp).toISOString() : new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('cognitive_sessions')
          .insert([record])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[CognitiveSession] Supabase insert failed, storing locally:', err.message);
      }
    }

    localCognitiveSessions.set(record.session_id, record);
    return record;
  }

  static async batchUpsert(sessions, userId) {
    let insertedCount = 0;
    let duplicatesSkipped = 0;

    for (const session of sessions) {
      const sessionId = session.sessionId || session.id;
      if (localCognitiveSessions.has(sessionId)) {
        duplicatesSkipped++;
      } else {
        await this.create({ ...session, userId });
        insertedCount++;
      }
    }

    return { insertedCount, duplicatesSkipped };
  }

  static async findByUserId(userId, days = 30) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('cognitive_sessions')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', cutoff)
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) return data;
      } catch (err) {
        console.warn('[CognitiveSession] Supabase fetch fallback:', err.message);
      }
    }

    // Fallback in-memory
    return Array.from(localCognitiveSessions.values())
      .filter(s => (s.user_id === userId || userId === 'anonymous_patient') && s.created_at >= cutoff)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}

module.exports = CognitiveSession;
