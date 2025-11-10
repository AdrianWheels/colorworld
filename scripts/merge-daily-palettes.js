import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PALETTES_DIR = path.join(PROJECT_ROOT, 'data', 'palettes');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'daily-palettes.js');

console.log('🎨 Combinando paletas de colores diarias...\n');

// Leer todos los archivos de paletas por mes
const allPalettes = [];

for (let month = 1; month <= 12; month++) {
  const filename = `palettes-month-${String(month).padStart(2, '0')}.json`;
  const filepath = path.join(PALETTES_DIR, filename);
  
  if (!fs.existsSync(filepath)) {
    console.warn(`⚠️  No se encontró el archivo: ${filename}`);
    continue;
  }
  
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    const monthData = JSON.parse(content);
    
    if (!monthData.palettes || !Array.isArray(monthData.palettes)) {
      console.error(`❌ Formato inválido en ${filename}`);
      continue;
    }
    
    console.log(`✅ Mes ${month} (${monthData.monthName}): ${monthData.palettes.length} paletas`);
    allPalettes.push(...monthData.palettes);
  } catch (error) {
    console.error(`❌ Error leyendo ${filename}:`, error.message);
  }
}

// Ordenar por día
allPalettes.sort((a, b) => a.day - b.day);

console.log(`\n📊 Total de paletas combinadas: ${allPalettes.length}`);

// Validar que tenemos las 365 paletas
const missingDays = [];
for (let day = 1; day <= 365; day++) {
  if (!allPalettes.find(p => p.day === day)) {
    missingDays.push(day);
  }
}

if (missingDays.length > 0) {
  console.warn(`\n⚠️  Días faltantes: ${missingDays.join(', ')}`);
}

// Validar formato de cada paleta
let errorsFound = false;
allPalettes.forEach(palette => {
  const errors = [];
  
  if (!palette.colorPalette || !Array.isArray(palette.colorPalette)) {
    errors.push('No tiene array colorPalette');
  } else {
    if (palette.colorPalette.length !== 10) {
      errors.push(`Tiene ${palette.colorPalette.length} colores (debería tener 10)`);
    }
    
    if (!palette.colorPalette.includes('#000000')) {
      errors.push('No incluye negro (#000000)');
    }
    
    if (!palette.colorPalette.includes('#FFFFFF')) {
      errors.push('No incluye blanco (#FFFFFF)');
    }
    
    // Validar formato hexadecimal
    palette.colorPalette.forEach(color => {
      if (!/^#[0-9A-F]{6}$/i.test(color)) {
        errors.push(`Color inválido: ${color}`);
      }
    });
  }
  
  if (errors.length > 0) {
    console.error(`\n❌ Día ${palette.day} (${palette.tematica}):`);
    errors.forEach(err => console.error(`   - ${err}`));
    errorsFound = true;
  }
});

if (errorsFound) {
  console.error('\n❌ Se encontraron errores. Por favor, corrige los archivos de paletas.');
  process.exit(1);
}

// Generar el archivo JavaScript
const fileContent = `// Paletas de colores sugeridas para cada día del año
// Generadas automáticamente a partir de los archivos de paletas mensuales
// Cada día tiene 10 colores predefinidos (incluyendo negro y blanco)

export const DAILY_PALETTES = ${JSON.stringify(allPalettes, null, 2)};

// Función auxiliar para obtener la paleta de un día específico
export const getPaletteForDay = (day) => {
  return DAILY_PALETTES.find(p => p.day === day)?.colorPalette || [];
};

// Función auxiliar para obtener la paleta con información completa
export const getPaletteInfoForDay = (day) => {
  return DAILY_PALETTES.find(p => p.day === day) || null;
};
`;

// Escribir el archivo
fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');

console.log(`\n✅ Archivo generado exitosamente: ${OUTPUT_FILE}`);
console.log(`\n📦 Contenido:`);
console.log(`   - ${allPalettes.length} paletas diarias`);
console.log(`   - 10 colores por paleta`);
console.log(`   - Incluye funciones auxiliares getPaletteForDay() y getPaletteInfoForDay()`);
console.log('\n🎉 ¡Listo! Ahora puedes importar las paletas en tu aplicación.\n');
