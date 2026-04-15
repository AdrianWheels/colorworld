#!/usr/bin/env node
// One-shot: sube el histórico de public/generated-images/ a Supabase Storage + daily_images.
// Idempotente: si date_key ya existe, salta.
// Uso local: `node scripts/migrate-images-to-supabase.js`
// Requiere SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (lee .env y .env.local).

import { readFileSync } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  supabaseAdmin,
  uploadDailyImage,
  upsertDailyImageRow,
  DAILY_IMAGES_TABLE,
} from './lib/supabase-admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../public/generated-images');

async function existingDateKeys() {
  const { data, error } = await supabaseAdmin
    .from(DAILY_IMAGES_TABLE)
    .select('date_key');
  if (error) throw new Error(`No se pudo leer daily_images existentes: ${error.message}`);
  return new Set(data.map(r => r.date_key));
}

async function listMonths() {
  const all = await readdir(ROOT, { withFileTypes: true });
  return all
    .filter(d => d.isDirectory() && /^\d{4}-\d{2}$/.test(d.name))
    .map(d => d.name)
    .sort();
}

async function migrateMonth(monthDir, alreadyMigrated, stats) {
  const fullDir = join(ROOT, monthDir);
  const files = await readdir(fullDir);
  const pngs = files.filter(f => f.endsWith('.png')).sort();

  console.log(`\n📂 ${monthDir} (${pngs.length} PNGs)`);

  for (const pngName of pngs) {
    const dateKey = pngName.slice(0, 10); // 'YYYY-MM-DD'
    const jsonName = pngName.replace(/\.png$/, '.json');
    const pngPath = join(fullDir, pngName);
    const jsonPath = join(fullDir, jsonName);
    const storagePath = `${monthDir}/${pngName}`;

    if (alreadyMigrated.has(dateKey)) {
      console.log(`  ⏭️  ${dateKey} ya migrado`);
      stats.skipped++;
      continue;
    }

    let meta;
    try {
      meta = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    } catch {
      console.warn(`  ⚠️  ${dateKey}: JSON metadata no encontrado, usando valores derivados del nombre`);
      meta = {};
    }

    const pngBuffer = readFileSync(pngPath);
    let fileStat;
    try {
      fileStat = await stat(pngPath);
    } catch {
      fileStat = null;
    }

    try {
      const publicUrl = await uploadDailyImage({ buffer: pngBuffer, storagePath });

      await upsertDailyImageRow({
        date_key: dateKey,
        file_name: pngName,
        storage_path: storagePath,
        public_url: publicUrl,
        tematica: meta.tematica ?? null,
        difficulty: meta.difficulty ?? null,
        prompt: meta.prompt ?? null,
        day_of_year: meta.dayOfYear ?? null,
        file_size: meta.fileSize ?? pngBuffer.length,
        source: meta.source ?? 'migration',
        generated_at: meta.savedAt ?? fileStat?.mtime?.toISOString() ?? new Date().toISOString(),
        metadata: {},
      });

      console.log(`  ✅ ${dateKey} (${Math.round(pngBuffer.length / 1024)} KB)`);
      stats.migrated++;
      alreadyMigrated.add(dateKey);
    } catch (err) {
      console.error(`  ❌ ${dateKey}: ${err.message}`);
      stats.failed++;
    }
  }
}

async function main() {
  console.log(`🚀 Migración histórica → Supabase Storage + ${DAILY_IMAGES_TABLE}`);
  console.log(`   Origen: ${ROOT}`);

  const alreadyMigrated = await existingDateKeys();
  console.log(`   Ya migrados previamente: ${alreadyMigrated.size}`);

  const months = await listMonths();
  const stats = { migrated: 0, skipped: 0, failed: 0 };

  for (const m of months) {
    await migrateMonth(m, alreadyMigrated, stats);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Migrados en esta ejecución: ${stats.migrated}`);
  console.log(`⏭️  Saltados (ya existían):    ${stats.skipped}`);
  console.log(`❌ Fallidos:                    ${stats.failed}`);

  if (stats.failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('💥 Error fatal:', err);
  process.exit(1);
});
