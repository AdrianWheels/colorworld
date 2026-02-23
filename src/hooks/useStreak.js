// src/hooks/useStreak.js
import { useState, useEffect, useCallback } from 'react';
import { getStreak, recordActivity } from '../services/streakService';

export function useStreak(userId) {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  // Cargar streak al montar o cuando cambia el usuario
  useEffect(() => {
    if (!userId) {
      setCurrentStreak(0);
      setLongestStreak(0);
      return;
    }
    getStreak(userId).then((data) => {
      if (data) {
        setCurrentStreak(data.current_streak ?? 0);
        setLongestStreak(data.longest_streak ?? 0);
      }
    });
  }, [userId]);

  /**
   * Llama esto tras guardar en la nube con éxito.
   * @param {string} dateKey  'YYYY-MM-DD'
   * @returns {{ isNewDay: boolean } | null}
   */
  const recordToday = useCallback(
    async (dateKey) => {
      if (!userId) return null;
      const result = await recordActivity(userId, dateKey);
      if (result) {
        setCurrentStreak(result.currentStreak);
        setLongestStreak(result.longestStreak);
      }
      return result;
    },
    [userId]
  );

  return { currentStreak, longestStreak, recordToday };
}
