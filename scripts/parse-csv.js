// Script para parsear el CSV de 365 prompts y convertirlo a formato JavaScript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer el CSV de 365 prompts
const csvPath = path.join(__dirname, '../src/data/365 promts.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Parsear CSV
const lines = csvContent.split('\n');
const headers = lines[0].split(',');
const prompts = [];

for (let i = 1; i < lines.length && i <= 365; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  
  // Parse CSV line (handling commas inside quoted fields)
  const fields = [];
  let current = '';
  let inQuotes = false;
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  
  if (fields.length >= 4) {
    prompts.push({
      id: i,
      day: i,
      tematica: fields[0],
      prompt_es: fields[1],
      prompt_en: fields[2],
      difficulty: fields[3]
    });
  }
}

console.log(`✅ Parseados ${prompts.length} prompts del CSV`);

// Generar el código JavaScript para incluir en promptsManager.js
const jsCode = `// 365 prompts del CSV, uno para cada día del año
const DAILY_PROMPTS = ${JSON.stringify(prompts, null, 2)};`;

// Guardar en un archivo separado
const outputPath = path.join(__dirname, '../src/data/daily-prompts.js');
fs.writeFileSync(outputPath, jsCode);

console.log(`💾 Prompts guardados en: ${outputPath}`);
console.log(`📊 Total de prompts: ${prompts.length}`);