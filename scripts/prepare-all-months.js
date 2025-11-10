/**
 * Script para generar los datos de TODOS los meses de una vez
 * Útil para preparar todos los archivos antes de enviarlos al agente de IA
 * 
 * Uso: node scripts/prepare-all-months.js
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

console.log('🎨 GENERANDO DATOS PARA TODOS LOS MESES\n');

// Crear directorio de salida si no existe
const outputDir = path.join(__dirname, '..', 'data', 'temp');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let totalFiles = 0;
let totalPrompts = 0;

// Generar archivo para cada mes
for (let month = 1; month <= 12; month++) {
  const monthInfo = DAYS_IN_MONTH[month];
  const startDay = getStartDay(month);
  const endDay = startDay + monthInfo.days - 1;
  
  console.log(`📅 Mes ${month.toString().padStart(2, '0')} - ${monthInfo.name}`);
  
  // Filtrar prompts del mes
  const monthPrompts = DAILY_PROMPTS.filter(
    prompt => prompt.day >= startDay && prompt.day <= endDay
  );
  
  if (monthPrompts.length === 0) {
    console.error(`   ❌ No se encontraron prompts para este mes`);
    continue;
  }
  
  // Crear estructura de datos
  const outputData = {
    month: month,
    monthName: monthInfo.name,
    totalDays: monthInfo.days,
    startDay: startDay,
    endDay: endDay,
    prompts: monthPrompts
  };
  
  // Guardar archivo JSON
  const monthStr = month.toString().padStart(2, '0');
  const outputFile = path.join(outputDir, `month-${monthStr}-prompts.json`);
  fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2), 'utf8');
  
  console.log(`   ✓ ${monthPrompts.length} prompts → month-${monthStr}-prompts.json`);
  totalFiles++;
  totalPrompts += monthPrompts.length;
}

console.log('\n' + '='.repeat(50));
console.log('✅ GENERACIÓN COMPLETADA');
console.log(`   Archivos generados: ${totalFiles}/12`);
console.log(`   Total prompts: ${totalPrompts}`);
console.log(`   Ubicación: data/temp/`);
console.log('\n📝 Próximo paso:');
console.log('   1. Abre cada archivo month-XX-prompts.json');
console.log('   2. Copia su contenido y pásalo al agente de IA');
console.log('   3. Guarda la respuesta en data/palettes/palettes-month-XX.json');
console.log('');
