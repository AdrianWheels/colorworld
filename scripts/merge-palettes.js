/**
 * Script para combinar todos los archivos de paletas mensuales
 * con el archivo original de prompts y generar el archivo final
 * 
 * Uso: node scripts/merge-palettes.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DAILY_PROMPTS } from '../src/data/daily-prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎨 COMBINANDO PALETAS DE COLORES\n');

// Leer todos los archivos de paletas
const palettesDir = path.join(__dirname, '..', 'data', 'palettes');
const allPalettes = new Map(); // day -> colorPalette

// Verificar que existe el directorio
if (!fs.existsSync(palettesDir)) {
  console.error('❌ Error: No existe el directorio data/palettes');
  console.log('   Asegúrate de haber generado las paletas primero');
  process.exit(1);
}

// Leer archivos de paletas (1-12)
let filesFound = 0;
let totalPalettes = 0;

for (let month = 1; month <= 12; month++) {
  const monthStr = month.toString().padStart(2, '0');
  const filePath = path.join(palettesDir, `palettes-month-${monthStr}.json`);
  
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      console.log(`✓ Mes ${monthStr}: ${data.palettes.length} paletas`);
      
      // Agregar paletas al mapa
      data.palettes.forEach(palette => {
        allPalettes.set(palette.day, palette.colorPalette);
        totalPalettes++;
      });
      
      filesFound++;
    } catch (error) {
      console.error(`❌ Error leyendo mes ${monthStr}: ${error.message}`);
    }
  } else {
    console.warn(`⚠️  Mes ${monthStr}: archivo no encontrado`);
  }
}

console.log(`\n📊 Resumen:`);
console.log(`   Archivos encontrados: ${filesFound}/12`);
console.log(`   Paletas cargadas: ${totalPalettes}`);
console.log(`   Prompts totales: ${DAILY_PROMPTS.length}`);

if (totalPalettes !== DAILY_PROMPTS.length) {
  console.warn(`\n⚠️  ADVERTENCIA: La cantidad de paletas (${totalPalettes}) no coincide con los prompts (${DAILY_PROMPTS.length})`);
}

// Combinar prompts con paletas
const promptsWithPalettes = DAILY_PROMPTS.map(prompt => {
  const palette = allPalettes.get(prompt.day);
  
  if (palette) {
    return {
      ...prompt,
      colorPalette: palette
    };
  } else {
    console.warn(`⚠️  Día ${prompt.day}: Sin paleta de colores`);
    return prompt;
  }
});

// Generar archivo JavaScript
const outputFile = path.join(__dirname, '..', 'src', 'data', 'daily-prompts-with-palettes.js');

const fileContent = `// 365 prompts con paletas de colores sugeridas
// Generado automáticamente por scripts/merge-palettes.js
// Fecha de generación: ${new Date().toISOString()}

export const DAILY_PROMPTS = ${JSON.stringify(promptsWithPalettes, null, 2)};

// Función helper para obtener el prompt de un día específico
export function getPromptByDay(dayOfYear) {
  return DAILY_PROMPTS.find(prompt => prompt.day === dayOfYear);
}

// Función helper para obtener el prompt de una fecha específica
export function getPromptByDate(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return getPromptByDay(dayOfYear);
}
`;

fs.writeFileSync(outputFile, fileContent, 'utf8');

console.log(`\n✅ Archivo generado exitosamente:`);
console.log(`   ${outputFile}`);
console.log(`   Total de prompts con paletas: ${promptsWithPalettes.filter(p => p.colorPalette).length}/${DAILY_PROMPTS.length}`);

// Generar también un archivo JSON de respaldo
const jsonBackupFile = path.join(__dirname, '..', 'data', 'daily-prompts-with-palettes.json');
fs.writeFileSync(jsonBackupFile, JSON.stringify(promptsWithPalettes, null, 2), 'utf8');
console.log(`   Respaldo JSON: ${jsonBackupFile}`);

console.log('\n🎉 ¡Proceso completado!\n');
