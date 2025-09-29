#!/usr/bin/env node

/**
 * Script para actualizar el índice de imágenes generadas
 * Uso: node scripts/update-images-index.js
 * 
 * Este script debe ejecutarse en GitHub Actions después de generar una nueva imagen
 */

import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'generated-images');
const INDEX_FILE = path.join(IMAGES_DIR, 'images-index.json');

async function scanImagesDirectory() {
  console.log('🔍 Escaneando directorio de imágenes...');
  
  try {
    const images = {};
    const daysByMonth = {};
    
    // Leer carpetas de meses (formato YYYY-MM)
    const monthFolders = await fs.readdir(IMAGES_DIR, { withFileTypes: true });
    
    for (const folder of monthFolders) {
      if (!folder.isDirectory() || folder.name === '.' || folder.name === '..' || folder.name.endsWith('.json')) {
        continue;
      }
      
      const monthPath = path.join(IMAGES_DIR, folder.name);
      console.log(`📂 Procesando mes: ${folder.name}`);
      
      try {
        const files = await fs.readdir(monthPath);
        const imageFiles = files.filter(file => 
          file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
        );
        
        // Procesar cada imagen
        for (const imageFile of imageFiles) {
          const imagePath = path.join(monthPath, imageFile);
          const stats = await fs.stat(imagePath);
          
          // Extraer información del nombre del archivo
          // Formato esperado: YYYY-MM-DD_TemaPrompt_timestamp.png
          const match = imageFile.match(/^(\d{4}-\d{2}-\d{2})_(.+?)_(\d+)\.(png|jpg|jpeg)$/);
          
          if (match) {
            const [, dateKey, theme, timestamp, extension] = match;
            
            // Inicializar array para el día si no existe
            if (!images[dateKey]) {
              images[dateKey] = [];
            }
            
            // Agregar información de la imagen
            images[dateKey].push({
              fileName: imageFile,
              url: `/generated-images/${folder.name}/${imageFile}`,
              theme: theme,
              dateKey: dateKey,
              timestamp: parseInt(timestamp),
              extension: extension,
              fileSize: stats.size,
              lastModified: stats.mtime.toISOString()
            });
            
            // Agregar día al índice mensual
            if (!daysByMonth[folder.name]) {
              daysByMonth[folder.name] = new Set();
            }
            daysByMonth[folder.name].add(dateKey);
            
            console.log(`✅ Procesada: ${imageFile}`);
          } else {
            console.warn(`⚠️ Nombre de archivo no reconocido: ${imageFile}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error procesando mes ${folder.name}:`, error);
      }
    }
    
    // Convertir Sets a arrays y ordenar
    for (const month in daysByMonth) {
      daysByMonth[month] = Array.from(daysByMonth[month]).sort();
    }
    
    // Ordenar imágenes por timestamp (más recientes primero)
    for (const dateKey in images) {
      images[dateKey].sort((a, b) => b.timestamp - a.timestamp);
    }
    
    return { images, daysByMonth };
    
  } catch (error) {
    console.error('❌ Error escaneando directorio:', error);
    return { images: {}, daysByMonth: {} };
  }
}

async function updateIndex() {
  try {
    console.log('🚀 Iniciando actualización del índice de imágenes...');
    
    // Escanear directorio
    const { images, daysByMonth } = await scanImagesDirectory();
    
    // Crear objeto índice
    const index = {
      lastUpdated: new Date().toISOString(),
      images,
      daysByMonth,
      totalImages: Object.values(images).reduce((sum, dayImages) => sum + dayImages.length, 0),
      totalDays: Object.keys(images).length
    };
    
    // Escribir archivo índice
    await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf8');
    
    console.log('✅ Índice actualizado exitosamente:');
    console.log(`   📸 Total de imágenes: ${index.totalImages}`);
    console.log(`   📅 Total de días: ${index.totalDays}`);
    console.log(`   📁 Archivo: ${INDEX_FILE}`);
    
    return index;
    
  } catch (error) {
    console.error('❌ Error actualizando índice:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (process.argv[1] === __filename) {
  updateIndex();
}

export default updateIndex;