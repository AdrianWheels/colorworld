import supabase from './supabaseClient';
import Logger from '../utils/logger.js';

const MIGRATION_FLAG = 'coloreveryday_migrated_to_supabase';
const STORAGE_PREFIX = 'coloreveryday_colored_drawings_';

export async function migrateLocalStorageToSupabase(userId) {
  if (localStorage.getItem(MIGRATION_FLAG) === 'done') return;

  const drawingsToMigrate = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_PREFIX)) {
      try {
        const drawing = JSON.parse(localStorage.getItem(key));
        drawingsToMigrate.push({
          user_id: userId,
          date_key: drawing.date || new Date().toISOString().split('T')[0],
          prompt: drawing.originalPrompt || null,
          theme: drawing.theme || null,
          color_layer_url: null, // Images will be migrated in Cloud Sync task
          brush_strokes: drawing.brushStrokes || 0,
          time_spent_seconds: drawing.timeSpent || 0,
        });
      } catch {
        // Ignore malformed entries
      }
    }
  }

  if (drawingsToMigrate.length === 0) {
    localStorage.setItem(MIGRATION_FLAG, 'done');
    return;
  }

  Logger.log(`📦 Migrando ${drawingsToMigrate.length} dibujos de localStorage...`);

  const { error } = await supabase
    .from('drawings')
    .upsert(drawingsToMigrate, { onConflict: 'user_id,date_key', ignoreDuplicates: true });

  if (error) {
    Logger.error('Error en migración:', error);
    return; // Don't mark as done if it failed — will retry next time
  }

  localStorage.setItem(MIGRATION_FLAG, 'done');
  Logger.log('✅ Migración completada');
}
