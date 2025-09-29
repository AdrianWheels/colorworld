#!/usr/bin/env node

// Script para generar la imagen diaria de forma automática
// Se ejecuta desde GitHub Actions cada día

import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { DAILY_PROMPTS } from '../src/data/daily-prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DailyImageGenerator {
  constructor() {
    this.apiKey = process.env.VITE_GEMINI_API_KEY;
    this.genAI = null;
    this.model = 'gemini-2.5-flash-image-preview';
    this.baseDir = path.resolve(__dirname, '../public/generated-images');
    this.initializeGemini();
  }

  initializeGemini() {
    if (!this.apiKey) {
      console.error('❌ GEMINI_API_KEY no encontrada en variables de entorno');
      process.exit(1);
    }
    
    this.genAI = new GoogleGenAI({
      apiKey: this.apiKey,
    });
    
    console.log('✅ Gemini API inicializada correctamente');
  }

  // Calculate day of year (1-365)
  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  // Get prompt for specific date
  getPromptForDate(date) {
    const dayOfYear = this.getDayOfYear(date);
    const day = Math.max(1, Math.min(365, dayOfYear));
    return DAILY_PROMPTS.find(prompt => prompt.day === day) || DAILY_PROMPTS[0];
  }

  // Build enhanced prompt for AI generation
  buildEnhancedPrompt(promptData, language = 'es') {
    const basePrompt = language === 'es' ? promptData.prompt_es : promptData.prompt_en;
    
    return `
      Crea una imagen de libro para colorear de: ${basePrompt}
      
      REQUISITOS ESPECÍFICOS:
      - SOLO líneas negras gruesas (stroke 3-5px) sobre fondo completamente blanco
      - Sin colores, sin grises, sin sombras, sin degradados
      - Estilo viñeta: elementos contenidos en un marco visual claro
      - Formas simples y claras, perfectas para colorear
      - Espacios amplios entre líneas para facilitar el coloreado
      - Contornos bien definidos y cerrados
      - Estilo cartoon amigable para niños
      - El elemento principal debe estar centrado
      - Elementos decorativos simples alrededor (flores, hojas, etc.)
      - Imagen cuadrada, composición equilibrada
      
      La imagen debe parecer sacada directamente de un libro para colorear tradicional.
      Temática: ${promptData.tematica}
      Dificultad: ${promptData.difficulty}
    `;
  }

  // Ensure directory exists
  async ensureDir(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  // Generate image with Gemini
  async generateImage(promptData, targetDate) {
    try {
      const enhancedPrompt = this.buildEnhancedPrompt(promptData);
      
      console.log('🤖 Generando imagen con Gemini...');
      console.log('📅 Fecha:', targetDate.toISOString().split('T')[0]);
      console.log('🎨 Temática:', promptData.tematica);
      console.log('🔑 API Key disponible:', this.apiKey ? 'SÍ' : 'NO');
      console.log('📝 Prompt length:', enhancedPrompt.length);
      
      const config = {
        responseModalities: ['IMAGE'],
      };
      
      const contents = [
        {
          role: 'user',
          parts: [
            {
              text: enhancedPrompt,
            },
          ],
        },
      ];

      console.log('📡 Enviando request a Gemini...');
      const response = await this.genAI.models.generateContentStream({
        model: this.model,
        config,
        contents,
      });

      let imageData = null;
      let chunkCount = 0;
      
      console.log('📥 Procesando respuesta de Gemini...');
      for await (const chunk of response) {
        chunkCount++;
        console.log(`📦 Chunk ${chunkCount} recibido`);
        
        if (!chunk.candidates) {
          console.log('⚠️ Chunk sin candidates');
          continue;
        }
        
        if (!chunk.candidates[0]) {
          console.log('⚠️ Chunk sin candidates[0]');
          continue;
        }
        
        if (!chunk.candidates[0].content) {
          console.log('⚠️ Chunk sin content');
          continue;
        }
        
        if (!chunk.candidates[0].content.parts) {
          console.log('⚠️ Chunk sin parts');
          continue;
        }
        
        if (chunk.candidates[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          imageData = {
            data: inlineData.data,
            mimeType: inlineData.mimeType || 'image/png'
          };
          console.log('✅ Imagen generada exitosamente');
          console.log('📊 Tamaño de datos:', inlineData.data.length, 'caracteres');
          break;
        } else {
          console.log('⚠️ Chunk sin inlineData');
          if (chunk.candidates[0]?.content?.parts?.[0]) {
            console.log('🔍 Parte disponible:', Object.keys(chunk.candidates[0].content.parts[0]));
          }
        }
      }
      
      console.log(`📊 Total chunks procesados: ${chunkCount}`);
      
      if (!imageData) {
        console.log('❌ No se encontró imageData en ningún chunk');
        return null;
      }
      
      return imageData;
      
    } catch (error) {
      console.error('❌ Error generando imagen:', error);
      throw error;
    }
  }

  // Save image and metadata
  async saveImage(imageData, promptData, targetDate) {
    const dateKey = targetDate.toISOString().split('T')[0];
    const [year, month] = dateKey.split('-');
    const monthDir = path.join(this.baseDir, `${year}-${month}`);
    
    // Ensure directory exists
    await this.ensureDir(monthDir);
    
    // Create filename
    const timestamp = Date.now();
    const cleanTheme = promptData.tematica.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 30);
    const fileName = `${dateKey}_${cleanTheme}_${timestamp}.png`;
    
    // Save image
    const imageBuffer = Buffer.from(imageData.data, 'base64');
    const imagePath = path.join(monthDir, fileName);
    await fs.writeFile(imagePath, imageBuffer);
    
    // Save metadata
    const metadataPath = path.join(monthDir, `${path.parse(fileName).name}.json`);
    const metadata = {
      fileName,
      dateKey,
      prompt: promptData.prompt_es,
      tematica: promptData.tematica,
      difficulty: promptData.difficulty,
      dayOfYear: promptData.day,
      savedAt: new Date().toISOString(),
      fileSize: imageBuffer.length,
      source: 'github-action'
    };
    
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    
    console.log(`💾 Imagen guardada: ${imagePath}`);
    console.log(`📋 Metadata guardada: ${metadataPath}`);
    
    return {
      imagePath,
      metadataPath,
      fileName,
      metadata
    };
  }

  // Check if image already exists for today
  async checkExistingImage(targetDate) {
    const dateKey = targetDate.toISOString().split('T')[0];
    const [year, month] = dateKey.split('-');
    const monthDir = path.join(this.baseDir, `${year}-${month}`);
    
    try {
      const files = await fs.readdir(monthDir);
      const existingImage = files.find(file => 
        file.includes(dateKey) && !file.endsWith('.json')
      );
      
      if (existingImage) {
        console.log(`📸 Imagen ya existe para ${dateKey}: ${existingImage}`);
        return true;
      }
    } catch (error) {
      // Directory doesn't exist, no existing image
    }
    
    return false;
  }

  // Main generation function
  async generateDailyImage() {
    try {
      const today = new Date();
      const promptData = this.getPromptForDate(today);
      
      console.log('🎯 Iniciando generación de imagen diaria...');
      console.log('📅 Fecha:', today.toISOString().split('T')[0]);
      console.log('🎨 Temática del día:', promptData.tematica);
      
      // Check if image already exists
      if (await this.checkExistingImage(today)) {
        console.log('⏭️ Imagen ya existe, saltando generación');
        return;
      }
      
      // Generate image
      const imageData = await this.generateImage(promptData, today);
      
      if (!imageData) {
        throw new Error('No se pudo generar la imagen');
      }
      
      // Save image
      const result = await this.saveImage(imageData, promptData, today);
      
      console.log('🎉 ¡Imagen diaria generada exitosamente!');
      console.log('📊 Resumen:');
      console.log(`   - Archivo: ${result.fileName}`);
      console.log(`   - Temática: ${promptData.tematica}`);
      console.log(`   - Tamaño: ${Math.round(result.metadata.fileSize / 1024)} KB`);
      
    } catch (error) {
      console.error('❌ Error en generación diaria:', error);
      process.exit(1);
    }
  }
}

// Execute daily generation
const generator = new DailyImageGenerator();
generator.generateDailyImage().then(() => {
  console.log('✅ Proceso completado');
}).catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});