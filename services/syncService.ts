import { supabase } from './supabaseClient';
import { StudySession, QuestionsLog } from '../types';

export const syncService = {
  /**
   * Merges local data with remote data from Supabase.
   * Remote data takes precedence for "existence", but we union arrays and dedup by ID.
   */
  async syncData(
    localSessions: StudySession[],
    localLogs: QuestionsLog[],
    userId: string
  ): Promise<{ sessions: StudySession[]; logs: QuestionsLog[]; error: string | null }> {
    try {
      // 1. Fetch Remote Data
      const { data: remoteSessions, error: sessionsError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId);

      if (sessionsError) throw sessionsError;

      const { data: remoteLogs, error: logsError } = await supabase
        .from('questions_logs')
        .select('*')
        .eq('user_id', userId);

      if (logsError) throw logsError;

      // 2. Merge Strategies
      // Map existing IDs to avoid duplicates
      const sessionMap = new Map<number, StudySession>();
      // Prefer remote version if exists (source of truth), then local
      localSessions.forEach(s => sessionMap.set(s.id, s));
      remoteSessions?.forEach((s: any) => sessionMap.set(Number(s.id), { ...s, id: Number(s.id) }));

      const logsMap = new Map<number, QuestionsLog>();
      localLogs.forEach(l => logsMap.set(l.id, l));
      remoteLogs?.forEach((l: any) => logsMap.set(Number(l.id), { ...l, id: Number(l.id) }));

      const mergedSessions = Array.from(sessionMap.values()).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const mergedLogs = Array.from(logsMap.values()).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // 3. Upsert Local items that might be missing in Remote
      // Ideally, we only push what's new/changed to save bandwidth, 
      // but for simplicity in this migration, we can upsert the merged list or just local ones.
      // Let's upsert everything to ensure consistency (Supabase handles ID conflict via update).
      
      const sessionsToUpsert = mergedSessions.map(s => ({
        id: s.id,
        user_id: userId,
        subject: s.subject,
        duration: s.duration,
        type: s.type,
        date: s.date
      }));

      const logsToUpsert = mergedLogs.map(l => ({
        id: l.id,
        user_id: userId,
        subject: l.subject,
        total: l.total,
        correct: l.correct,
        wrong: l.wrong,
        date: l.date
      }));

      if (sessionsToUpsert.length > 0) {
        const { error: upsertSessionError } = await supabase.from('study_sessions').upsert(sessionsToUpsert);
        if (upsertSessionError) console.error('Upsert Session Error:', upsertSessionError);
      }

      if (logsToUpsert.length > 0) {
        const { error: upsertLogError } = await supabase.from('questions_logs').upsert(logsToUpsert);
        if (upsertLogError) console.error('Upsert Log Error:', upsertLogError);
      }

      return { sessions: mergedSessions, logs: mergedLogs, error: null };

    } catch (err: any) {
      console.error('Sync Error:', err);
      return { sessions: localSessions, logs: localLogs, error: err.message };
    }
  }
};