// src/hooks/useStreak.js
import { useState, useEffect, useCallback } from 'react';
import { getStreak, recordActivity } from '../services/streakService';

export function useStreak(userId) {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    if (!userId) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const data = await getStreak(userId);
        if (!cancelled && data) {
          setCurrentStreak(data.current_streak ?? 0);
          setLongestStreak(data.longest_streak ?? 0);
        }
      } catch {
        // streak no crítico — fallo silencioso
      }
    };

    load();
    return () => { cancelled = true; };
  }, [userId]);

  /**
   * Llama esto tras guardar en la nube con éxito.
   * @param {string} dateKey  'YYYY-MM-DD'
   * @returns {{ isNewDay: boolean } | null}
   */
  const recordToday = useCallback(
    async (dateKey) => {
      if (!userId) return null;
      try {
        const result = await recordActivity(userId, dateKey);
        if (result) {
          setCurrentStreak(result.currentStreak);
          setLongestStreak(result.longestStreak);
        }
        return result;
      } catch {
        return null;
      }
    },
    [userId]
  );

  // Solo en desarrollo: fuerza el streak a un valor específico (sin Supabase)
  const devSetStreak = useCallback((value) => {
    const n = Math.max(0, value);
    setCurrentStreak(n);
    setLongestStreak(prev => Math.max(prev, n));
  }, []);

  return { currentStreak, longestStreak, recordToday, devSetStreak };
}
