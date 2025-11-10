/**
 * Script para validar archivos JSON de paletas de colores
 * Verifica que cumplan con todos los requisitos
 * 
 * Uso: node scripts/validate-palettes.js --month 1
 * Uso: node scripts/validate-palettes.js --all
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validar formato hexadecimal
function isValidHex(color) {
  return /^#[0-9A-F]{6}$/i.test(color);
}

// Validar una paleta individual
function validatePalette(palette, day, monthName) {
  const errors = [];
  
  // Verificar que existe colorPalette
  if (!palette.colorPalette || !Array.isArray(palette.colorPalette)) {
    errors.push(`Día ${day}: No tiene array colorPalette`);
    return errors;
  }
  
  // Verificar cantidad exacta de colores
  if (palette.colorPalette.length !== 10) {
    errors.push(`Día ${day}: Tiene ${palette.colorPalette.length} colores, debe tener exactamente 10`);
  }
  
  // Verificar que incluya negro y blanco
  const hasBlack = palette.colorPalette.some(c => c.toUpperCase() === '#000000');
  const hasWhite = palette.colorPalette.some(c => c.toUpperCase() === '#FFFFFF');
  
  if (!hasBlack) {
    errors.push(`Día ${day}: No incluye negro (#000000)`);
  }
  if (!hasWhite) {
    errors.push(`Día ${day}: No incluye blanco (#FFFFFF)`);
  }
  
  // Verificar formato hexadecimal de todos los colores
  palette.colorPalette.forEach((color, index) => {
    if (!isValidHex(color)) {
      errors.push(`Día ${day}, color ${index + 1}: "${color}" no es un hexadecimal válido`);
    } else if (color !== color.toUpperCase()) {
      errors.push(`Día ${day}, color ${index + 1}: "${color}" debe estar en MAYÚSCULAS`);
    }
  });
  
  // Verificar que el día coincida
  if (palette.day !== day) {
    errors.push(`Día ${day}: El campo day (${palette.day}) no coincide`);
  }
  
  return errors;
}

// Validar archivo de un mes
function validateMonthFile(month) {
  const monthStr = month.toString().padStart(2, '0');
  const filePath = path.join(__dirname, '..', 'data', 'palettes', `palettes-month-${monthStr}.json`);
  
  console.log(`\n🔍 Validando mes ${month}...`);
  
  // Verificar que existe el archivo
  if (!fs.existsSync(filePath)) {
    console.error(`   ❌ Archivo no encontrado: ${filePath}`);
    return false;
  }
  
  try {
    // Leer y parsear JSON
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Validar estructura básica
    if (!data.month || !data.monthName || !data.palettes) {
      console.error('   ❌ Estructura JSON inválida (falta month, monthName o palettes)');
      return false;
    }
    
    if (data.month !== month) {
      console.error(`   ❌ El campo month (${data.month}) no coincide con ${month}`);
      return false;
    }
    
    if (!Array.isArray(data.palettes)) {
      console.error('   ❌ El campo palettes no es un array');
      return false;
    }
    
    console.log(`   ✓ Archivo JSON válido`);
    console.log(`   ✓ Mes: ${data.monthName}`);
    console.log(`   ✓ Total paletas: ${data.palettes.length}`);
    
    // Validar cada paleta
    let totalErrors = 0;
    data.palettes.forEach(palette => {
      const errors = validatePalette(palette, palette.day, data.monthName);
      if (errors.length > 0) {
        errors.forEach(error => {
          console.error(`   ❌ ${error}`);
          totalErrors++;
        });
      }
    });
    
    if (totalErrors === 0) {
      console.log(`   ✅ Todas las paletas son válidas`);
      return true;
    } else {
      console.error(`   ❌ ${totalErrors} error(es) encontrado(s)`);
      return false;
    }
    
  } catch (error) {
    console.error(`   ❌ Error al leer/parsear JSON: ${error.message}`);
    return false;
  }
}

// Obtener argumentos de línea de comandos
const args = process.argv.slice(2);
const monthArg = args.find(arg => arg.startsWith('--month='));
const allFlag = args.includes('--all');

console.log('🎨 VALIDADOR DE PALETAS DE COLORES\n');

if (allFlag) {
  // Validar todos los meses
  console.log('Validando todos los meses...');
  let allValid = true;
  for (let month = 1; month <= 12; month++) {
    const isValid = validateMonthFile(month);
    if (!isValid) allValid = false;
  }
  
  console.log('\n' + '='.repeat(50));
  if (allValid) {
    console.log('✅ TODOS LOS ARCHIVOS SON VÁLIDOS');
  } else {
    console.log('❌ HAY ERRORES EN UNO O MÁS ARCHIVOS');
  }
  
} else if (monthArg) {
  // Validar un mes específico
  const month = parseInt(monthArg.split('=')[1]);
  if (month < 1 || month > 12) {
    console.error('❌ Mes inválido. Debe ser entre 1 y 12');
    process.exit(1);
  }
  validateMonthFile(month);
  
} else {
  console.log('Uso:');
  console.log('  node scripts/validate-palettes.js --month=1    (validar un mes)');
  console.log('  node scripts/validate-palettes.js --all        (validar todos)');
}

console.log('');
