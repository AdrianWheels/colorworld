// src/services/streakService.js
import supabase from './supabaseClient';
import Logger from '../utils/logger.js';

/**
 * Calcula si dateKey es el día siguiente a lastColoredDate.
 * Ambos son strings 'YYYY-MM-DD'.
 */
function isYesterday(lastColoredDate, dateKey) {
  const last = new Date(lastColoredDate + 'T00:00:00Z');
  const current = new Date(dateKey + 'T00:00:00Z');
  const diffMs = current - last;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

/**
 * Devuelve el registro de streak del usuario, o null si no existe.
 */
export async function getStreak(userId) {
  const { data, error } = await supabase
    .from('streaks')
    .select('current_streak, longest_streak, last_colored_date')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    Logger.error('❌ streakService.getStreak:', error);
    return null;
  }
  return data;
}

/**
 * Registra actividad de coloreo para hoy.
 * Idempotente: si ya se registró hoy, no hace nada.
 *
 * @param {string} userId
 * @param {string} dateKey  'YYYY-MM-DD'
 * @returns {{ currentStreak: number, longestStreak: number, isNewDay: boolean } | null}
 */
export async function recordActivity(userId, dateKey) {
  try {
    // Validar formato YYYY-MM-DD
    if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      Logger.error('❌ streakService.recordActivity: dateKey inválido:', dateKey);
      return null;
    }

    const existing = await getStreak(userId);

    // Ya contó hoy — no-op
    if (existing?.last_colored_date === dateKey) {
      return {
        currentStreak: existing.current_streak,
        longestStreak: existing.longest_streak,
        isNewDay: false,
      };
    }

    // Calcular nueva racha
    let newCurrent = 1;
    if (existing?.last_colored_date && isYesterday(existing.last_colored_date, dateKey)) {
      newCurrent = (existing.current_streak ?? 0) + 1;
    }
    const newLongest = Math.max(newCurrent, existing?.longest_streak ?? 0);

    const { error } = await supabase.from('streaks').upsert(
      {
        user_id: userId,
        current_streak: newCurrent,
        longest_streak: newLongest,
        last_colored_date: dateKey,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      Logger.error('❌ streakService.recordActivity:', error);
      return null;
    }

    Logger.log(`🔥 Streak actualizado: ${newCurrent} días`);
    return { currentStreak: newCurrent, longestStreak: newLongest, isNewDay: true };
  } catch (err) {
    Logger.error('❌ streakService.recordActivity (catch):', err);
    return null;
  }
}
