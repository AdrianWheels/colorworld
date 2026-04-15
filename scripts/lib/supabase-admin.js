import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Cargar .env y .env.local (prioriza .env.local si existe) — para ejecución local.
// En GitHub Actions los secretos llegan vía env: del workflow.
config();
config({ path: '.env.local', override: true });

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son obligatorios');
  console.error('   Configurar en GitHub Secrets o en .env.local para ejecución local');
  process.exit(1);
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const DAILY_IMAGES_BUCKET = 'daily-images';
export const DAILY_IMAGES_TABLE = 'daily_images';

export async function uploadDailyImage({ buffer, storagePath, contentType = 'image/png' }) {
  const { error } = await supabaseAdmin
    .storage
    .from(DAILY_IMAGES_BUCKET)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true,
      cacheControl: '31536000',
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(DAILY_IMAGES_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function upsertDailyImageRow(row) {
  const { error } = await supabaseAdmin
    .from(DAILY_IMAGES_TABLE)
    .upsert(row, { onConflict: 'date_key' });

  if (error) throw new Error(`Upsert failed: ${error.message}`);
}
