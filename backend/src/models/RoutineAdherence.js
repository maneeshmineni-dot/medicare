const { getSupabaseClient } = require('../config/supabase');

const localAdherenceLogs = new Map();

class RoutineAdherence {
  static async create(logData) {
    const supabase = getSupabaseClient();
    const id = logData.id || logData.logId || 'adh_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const record = {
      id,
      user_id: logData.userId || 'anonymous_patient',
      routine_slot: logData.routineSlot || 'morning',
      medication_name: logData.medicationName || 'Medication',
      status: logData.status || 'taken',
      taken_at: logData.takenAt ? new Date(logData.takenAt).toISOString() : new Date().toISOString(),
      caregiver_notified: Boolean(logData.caregiverNotified),
      notes: logData.notes || ''
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('routine_adherence')
          .insert([record])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[RoutineAdherence] Supabase insert failed, storing locally:', err.message);
      }
    }

    localAdherenceLogs.set(record.id, record);
    return record;
  }

  static async batchUpsert(logs, userId) {
    let insertedCount = 0;
    let duplicatesSkipped = 0;

    for (const log of logs) {
      const logId = log.logId || log.id;
      if (logId && localAdherenceLogs.has(logId)) {
        duplicatesSkipped++;
      } else {
        await this.create({ ...log, userId });
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
          .from('routine_adherence')
          .select('*')
          .eq('user_id', userId)
          .gte('taken_at', cutoff)
          .order('taken_at', { ascending: false });
        if (!error && Array.isArray(data)) return data;
      } catch (err) {
        console.warn('[RoutineAdherence] Supabase fetch fallback:', err.message);
      }
    }

    return Array.from(localAdherenceLogs.values())
      .filter(a => (a.user_id === userId || userId === 'anonymous_patient') && a.taken_at >= cutoff)
      .sort((a, b) => new Date(b.taken_at) - new Date(a.taken_at));
  }
}

module.exports = RoutineAdherence;
