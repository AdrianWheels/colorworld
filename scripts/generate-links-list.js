#!/usr/bin/env node

/**
 * generate-links-list.js
 * 
 * Genera un archivo con los enlaces de Pinterest y los enlaces correspondientes
 * de la web para facilitar la actualización manual de enlaces en Pinterest.
 * 
 * Usage: node scripts/generate-links-list.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const INPUT_FILE = path.join(ROOT_DIR, 'public', 'data', 'pinterest-gallery.json');
const OUTPUT_CSV = path.join(ROOT_DIR, 'pinterest-links.csv');
const OUTPUT_MD = path.join(ROOT_DIR, 'pinterest-links.md');
const SITE_BASE_URL = 'https://coloreveryday.vercel.app';

console.log('\n📋 Generando lista de enlaces Pinterest → Web\n');

try {
    // Read gallery data
    const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
    
    // Prepare CSV content
    let csvContent = 'Board,Pin Title,Pinterest URL,Web Coloring URL\n';
    
    // Prepare Markdown content
    let mdContent = '# Enlaces Pinterest → ColorEveryday\n\n';
    mdContent += `Generado: ${new Date().toLocaleString('es-ES')}\n\n`;
    mdContent += `Total de pines: ${data.boards.reduce((sum, b) => sum + b.pinCount, 0)}\n\n`;
    mdContent += '---\n\n';
    
    // Process each board
    for (const board of data.boards) {
        mdContent += `## ${board.name} (${board.pinCount} pines)\n\n`;
        mdContent += '| Pin | Pinterest URL | Web URL |\n';
        mdContent += '|-----|---------------|----------|\n';
        
        for (const pin of board.pins) {
            const pinterestUrl = `https://www.pinterest.com/pin/${pin.id}/`;
            const webUrl = `${SITE_BASE_URL}/colorear/${pin.id}`;
            const title = (pin.title || 'Sin título').replace(/"/g, '""'); // Escape quotes for CSV
            
            // Add to CSV
            csvContent += `"${board.name}","${title}","${pinterestUrl}","${webUrl}"\n`;
            
            // Add to Markdown
            const shortTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;
            mdContent += `| ${shortTitle} | [Pinterest](${pinterestUrl}) | [Colorear](${webUrl}) |\n`;
        }
        
        mdContent += '\n';
    }
    
    // Write CSV file
    fs.writeFileSync(OUTPUT_CSV, csvContent, 'utf-8');
    
    // Write Markdown file
    fs.writeFileSync(OUTPUT_MD, mdContent, 'utf-8');
    
    console.log('✅ Archivos generados:');
    console.log(`   📄 CSV: ${OUTPUT_CSV}`);
    console.log(`   📄 Markdown: ${OUTPUT_MD}`);
    console.log('\n💡 Puedes abrir el archivo CSV en Excel/Google Sheets');
    console.log('   o el archivo Markdown para copiar los enlaces.\n');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
