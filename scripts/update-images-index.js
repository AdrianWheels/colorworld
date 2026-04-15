#!/usr/bin/env node

/**
 * Regenera public/generated-images/images-index.json leyendo la tabla
 * `daily_images` de Supabase. Se ejecuta tras cada generación/regeneración
 * diaria para mantener el sitemap sincronizado.
 *
 * Requiere SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (service_role bypasea RLS,
 * pero la policy SELECT es pública de todos modos — aquí usamos la key admin
 * para evitar dependencias del cliente anon en scripts).
 */

import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';
import { supabaseAdmin, DAILY_IMAGES_TABLE } from './lib/supabase-admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INDEX_FILE = path.join(__dirname, '..', 'public', 'generated-images', 'images-index.json');

async function fetchAllDailyImages() {
  const { data, error } = await supabaseAdmin
    .from(DAILY_IMAGES_TABLE)
    .select('date_key, file_name, public_url, tematica, file_size, generated_at, storage_path')
    .order('date_key', { ascending: false });

  if (error) throw new Error(`No se pudieron leer daily_images: ${error.message}`);
  return data ?? [];
}

function buildIndex(rows) {
  const images = {};
  const daysByMonth = {};

  for (const row of rows) {
    const entry = {
      fileName: row.file_name,
      url: row.public_url,
      theme: row.tematica,
      dateKey: row.date_key,
      timestamp: new Date(row.generated_at).getTime(),
      extension: 'png',
      fileSize: row.file_size,
      lastModified: row.generated_at,
      storagePath: row.storage_path,
    };
    images[row.date_key] = [entry];

    const monthKey = row.date_key.slice(0, 7);
    if (!daysByMonth[monthKey]) daysByMonth[monthKey] = [];
    daysByMonth[monthKey].push(row.date_key);
  }

  for (const m of Object.keys(daysByMonth)) {
    daysByMonth[m].sort();
  }

  return {
    lastUpdated: new Date().toISOString(),
    images,
    daysByMonth,
    totalImages: rows.length,
    totalDays: rows.length,
    source: 'supabase',
  };
}

async function updateIndex() {
  console.log('🚀 Regenerando images-index.json desde Supabase...');
  const rows = await fetchAllDailyImages();
  const index = buildIndex(rows);

  await fs.mkdir(path.dirname(INDEX_FILE), { recursive: true });
  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf8');

  console.log(`✅ Índice actualizado: ${index.totalImages} imágenes, ${index.totalDays} días`);
  console.log(`   📁 ${INDEX_FILE}`);
  return index;
}

if (process.argv[1] === __filename) {
  updateIndex().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
}

export default updateIndex;
