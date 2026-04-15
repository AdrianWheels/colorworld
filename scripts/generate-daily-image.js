#!/usr/bin/env node

// Generador de imágenes diarias usando Gemini 2.5 Flash Image
// Basado en el código oficial de Google AI Studio
// Se ejecuta desde GitHub Actions cada día

// Cargar variables de entorno desde .env (para ejecución local)
import 'dotenv/config';

import { GoogleGenAI } from '@google/genai';
import { Buffer } from 'buffer';
import process from 'process';
import { DAILY_PROMPTS } from '../src/data/daily-prompts.js';
import { supabaseAdmin, uploadDailyImage, upsertDailyImageRow, DAILY_IMAGES_TABLE } from './lib/supabase-admin.js';

class DailyImageGenerator {
  constructor() {
    this.apiKey = process.env.VITE_GEMINI_API_KEY;
    this.genAI = null;
    this.model = 'gemini-2.5-flash-image'; // ✅ Modelo estable (preview deprecado 15-Jan-2026)
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

    return `GENERATE IMAGE NOW. CREATE A COLORING PAGE.

Subject: ${basePrompt}
Theme: ${promptData.tematica}

GENERATE A BLACK AND WHITE COLORING PAGE IMAGE:
- Black outlines only on pure white background
- Simple line art suitable for children
- No text, no descriptions, ONLY THE IMAGE
- Clear, thick black lines
- Large areas for coloring
- Cartoon style

IMPORTANT: Generate the actual image file now, do not describe it.`;
  }

  // Generate image with Gemini
  async generateImage(promptData, targetDate) {
    try {
      const enhancedPrompt = this.buildEnhancedPrompt(promptData);

      console.log('🤖 Generando imagen con Gemini 2.5 Flash Image Preview...');
      console.log('📅 Fecha:', targetDate.toISOString().split('T')[0]);
      console.log('🎨 Temática:', promptData.tematica);
      console.log('🔑 API Key disponible:', this.apiKey ? 'SÍ' : 'NO');
      console.log('📝 Prompt length:', enhancedPrompt.length);

      // ✅ Forzar SOLO imagen, sin texto
      const config = {
        responseModalities: [
          'IMAGE',
        ],
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

      console.log('📡 Enviando request a Gemini 2.5 Flash Image Preview...');
      const response = await this.genAI.models.generateContentStream({
        model: this.model,
        config,
        contents,
      });

      let imageData = null;
      let chunkCount = 0;

      console.log('📥 Procesando respuesta...');
      for await (const chunk of response) {
        chunkCount++;
        console.log(`� Chunk ${chunkCount} recibido`);

        // ✅ Usar exactamente la misma lógica que Google AI Studio
        if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
          console.log('⚠️ Chunk sin candidates/content/parts - continuando...');
          continue;
        }

        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          imageData = {
            data: inlineData.data,
            mimeType: inlineData.mimeType || 'image/png'
          };
          console.log('✅ Imagen encontrada!');
          console.log('📊 MIME Type:', inlineData.mimeType);
          console.log('📊 Tamaño de datos:', inlineData.data.length, 'caracteres');
          break;
        } else {
          // Si hay texto en lugar de imagen
          if (chunk.text) {
            console.log('📝 Texto recibido:', chunk.text);
          } else {
            console.log('⚠️ Chunk sin inlineData ni texto');
          }
        }
      }

      console.log(`📊 Total chunks procesados: ${chunkCount}`);

      if (!imageData) {
        console.log('❌ No se encontró imagen en ningún chunk');
        return null;
      }

      return imageData;

    } catch (error) {
      console.error('❌ Error generando imagen:', error);
      console.error('🔍 Detalles del error:', error.message);
      if (error.response) {
        console.error('📡 Respuesta del servidor:', error.response);
      }
      throw error;
    }
  }

  // Sube la imagen a Supabase Storage y upserta metadata en daily_images.
  // Fuente única de verdad: Supabase. Nada se escribe al FS del repo.
  async saveImage(imageData, promptData, targetDate) {
    const dateKey = targetDate.toISOString().split('T')[0];
    const [year, month] = dateKey.split('-');
    const yearMonth = `${year}-${month}`;

    const timestamp = Date.now();
    const cleanTheme = promptData.tematica.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 30);
    const fileName = `${dateKey}_${cleanTheme}_${timestamp}.png`;
    const storagePath = `${yearMonth}/${fileName}`;

    const imageBuffer = Buffer.from(imageData.data, 'base64');
    const savedAt = new Date().toISOString();

    console.log('☁️  Subiendo a Supabase Storage...');
    const publicUrl = await uploadDailyImage({ buffer: imageBuffer, storagePath });
    console.log(`☁️  PNG subido: ${publicUrl}`);

    await upsertDailyImageRow({
      date_key: dateKey,
      file_name: fileName,
      storage_path: storagePath,
      public_url: publicUrl,
      tematica: promptData.tematica,
      difficulty: promptData.difficulty,
      prompt: promptData.prompt_es,
      day_of_year: promptData.day,
      file_size: imageBuffer.length,
      source: 'github-action',
      generated_at: savedAt,
      metadata: {},
    });
    console.log(`☁️  Fila daily_images upserted para ${dateKey}`);

    return {
      fileName,
      publicUrl,
      storagePath,
      metadata: {
        fileName,
        dateKey,
        prompt: promptData.prompt_es,
        tematica: promptData.tematica,
        difficulty: promptData.difficulty,
        dayOfYear: promptData.day,
        savedAt,
        fileSize: imageBuffer.length,
        source: 'github-action',
      },
    };
  }

  // Check if image already exists in Supabase for this date
  async checkExistingImage(targetDate) {
    const dateKey = targetDate.toISOString().split('T')[0];
    const { data, error } = await supabaseAdmin
      .from(DAILY_IMAGES_TABLE)
      .select('file_name')
      .eq('date_key', dateKey)
      .maybeSingle();

    if (error) {
      console.warn(`⚠️  No se pudo comprobar imagen existente en BD: ${error.message}`);
      return false; // ante la duda, generar
    }
    if (data) {
      console.log(`📸 Imagen ya existe para ${dateKey}: ${data.file_name}`);
      return true;
    }
    return false;
  }

  // Main generation function
  async generateDailyImage(customDate = null) {
    try {
      // Usar fecha personalizada si se proporciona, sino usar hoy
      const targetDate = customDate ? new Date(customDate) : new Date();
      const promptData = this.getPromptForDate(targetDate);

      console.log('🎯 Iniciando generación de imagen diaria...');
      console.log('📅 Fecha:', targetDate.toISOString().split('T')[0]);
      console.log('🎨 Temática del día:', promptData.tematica);

      // Si es regeneración, no verificar imagen existente
      if (!customDate) {
        // Check if image already exists
        if (await this.checkExistingImage(targetDate)) {
          console.log('⏭️ Imagen ya existe, saltando generación');
          return;
        }
      } else {
        console.log('🔄 Regenerando imagen (sobrescribirá existente)');
      }

      // Generate image
      const imageData = await this.generateImage(promptData, targetDate);

      if (!imageData) {
        throw new Error('No se pudo generar la imagen');
      }

      // Save image
      const result = await this.saveImage(imageData, promptData, targetDate);

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

// Verificar si se pasó una fecha como argumento
const customDate = process.argv[2];

if (customDate) {
  console.log(`🔄 Regenerando imagen para fecha: ${customDate}`);
  generator.generateDailyImage(customDate).then(() => {
    console.log('✅ Regeneración completada');
  }).catch((error) => {
    console.error('❌ Error en regeneración:', error);
    process.exit(1);
  });
} else {
  generator.generateDailyImage().then(() => {
    console.log('✅ Proceso completado');
  }).catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}