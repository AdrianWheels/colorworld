/**
 * Script para preparar los datos de un mes específico
 * Extrae los prompts de daily-prompts.js y los guarda en formato JSON
 * 
 * Uso: node scripts/prepare-month-data.js --month 1
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DAILY_PROMPTS } from '../src/data/daily-prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de días por mes (año no bisiesto como base)
const DAYS_IN_MONTH = {
  1: { name: 'Enero', days: 31 },
  2: { name: 'Febrero', days: 28 },
  3: { name: 'Marzo', days: 31 },
  4: { name: 'Abril', days: 30 },
  5: { name: 'Mayo', days: 31 },
  6: { name: 'Junio', days: 30 },
  7: { name: 'Julio', days: 31 },
  8: { name: 'Agosto', days: 31 },
  9: { name: 'Septiembre', days: 30 },
  10: { name: 'Octubre', days: 31 },
  11: { name: 'Noviembre', days: 30 },
  12: { name: 'Diciembre', days: 31 }
};

// Calcular el día inicial del mes
function getStartDay(month) {
  let startDay = 1;
  for (let m = 1; m < month; m++) {
    startDay += DAYS_IN_MONTH[m].days;
  }
  return startDay;
}

// Obtener argumentos de línea de comandos
const args = process.argv.slice(2);
const monthArg = args.find(arg => arg.startsWith('--month='));
const month = monthArg ? parseInt(monthArg.split('=')[1]) : null;

if (!month || month < 1 || month > 12) {
  console.error('❌ Error: Debes especificar un mes válido (1-12)');
  console.log('Uso: node scripts/prepare-month-data.js --month=1');
  process.exit(1);
}

const monthInfo = DAYS_IN_MONTH[month];
const startDay = getStartDay(month);
const endDay = startDay + monthInfo.days - 1;

console.log(`\n📅 Preparando datos para ${monthInfo.name} (mes ${month})`);
console.log(`   Días: ${startDay} al ${endDay} (${monthInfo.days} días)`);

// Filtrar prompts del mes
const monthPrompts = DAILY_PROMPTS.filter(
  prompt => prompt.day >= startDay && prompt.day <= endDay
);

if (monthPrompts.length === 0) {
  console.error(`❌ Error: No se encontraron prompts para el mes ${month}`);
  process.exit(1);
}

console.log(`   ✓ Encontrados ${monthPrompts.length} prompts`);

// Crear estructura de datos para el agente de IA
const outputData = {
  month: month,
  monthName: monthInfo.name,
  totalDays: monthInfo.days,
  startDay: startDay,
  endDay: endDay,
  prompts: monthPrompts
};

// Crear directorio de salida si no existe
const outputDir = path.join(__dirname, '..', 'data', 'temp');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`   ✓ Directorio creado: ${outputDir}`);
}

// Guardar archivo JSON
const monthStr = month.toString().padStart(2, '0');
const outputFile = path.join(outputDir, `month-${monthStr}-prompts.json`);
fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2), 'utf8');

console.log(`   ✓ Archivo generado: ${outputFile}`);
console.log(`\n✅ ¡Listo! Copia el contenido del archivo y pásalo al agente de IA\n`);

// Mostrar resumen
console.log('📋 RESUMEN:');
console.log(`   Mes: ${monthInfo.name}`);
console.log(`   Días del año: ${startDay}-${endDay}`);
console.log(`   Total prompts: ${monthPrompts.length}`);
console.log(`   Archivo: data/temp/month-${monthStr}-prompts.json`);
console.log('');
