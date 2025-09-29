// AI Drawing Service
// This service handles generating daily drawings using Gemini 2.5 Flash Image Preview

import { GoogleGenAI } from '@google/genai';
import promptsManager from './promptsManager.js';
import persistentStorage from './persistentStorage.js';

class DrawingService {
  constructor() {
    // Usar variable de entorno para la API key
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.genAI = null;
    this.model = 'gemini-2.5-flash-image-preview'; // Modelo actualizado
    this.cache = new Map();
    this.generatedImagesPath = '/generated-images/';
    this.initializeGemini();
  }

  // Initialize Gemini API
  initializeGemini() {
    try {
      if (!this.apiKey) {
        console.error('❌ API key no encontrada. Asegúrate de configurar VITE_GEMINI_API_KEY en .env');
        return;
      }
      
      this.genAI = new GoogleGenAI({
        apiKey: this.apiKey,
      });
      
      console.log('✅ Gemini 2.5 Flash Image Preview inicializada correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Gemini API:', error);
    }
  }

  // Set the Gemini API key (opcional, ya está en .env)
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.initializeGemini();
  }

  // Get today's date as a string (YYYY-MM-DD)
  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  // Get cached drawing for today
  getTodayDrawing() {
    const todayKey = this.getTodayKey();
    const cached = localStorage.getItem(`drawing_${todayKey}`);
    return cached ? JSON.parse(cached) : null;
  }

  // Save drawing to cache
  saveDrawing(drawing) {
    const todayKey = this.getTodayKey();
    localStorage.setItem(`drawing_${todayKey}`, JSON.stringify(drawing));
  }

  // Get list of all saved drawings
  getAllDrawings() {
    const drawings = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('drawing_')) {
        const date = key.replace('drawing_', '');
        const drawing = JSON.parse(localStorage.getItem(key));
        drawings.push({ date, ...drawing });
      }
    }
    return drawings.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Get coloring prompts based on date
  getColoringPrompts(forDate = null) {
    const targetDate = forDate || new Date();
    const promptData = promptsManager.getPromptForDate(targetDate);
    return {
      theme: promptData.tematica,
      prompt: promptData.prompt_es,
      promptData: promptData
    };
  }

  // Get specific theme prompt
  getThemePrompt(themeName) {
    const promptData = promptsManager.getPromptByTheme(themeName);
    if (!promptData) {
      return this.getColoringPrompts(); // Fallback to today's prompt
    }
    return {
      theme: promptData.tematica,
      prompt: promptData.prompt_es,
      promptData: promptData
    };
  }

  // Generate image using Gemini 2.5 Flash Image Preview with optimized prompts
  async generateImageWithGemini(forDateKey = null) {
    if (!this.genAI) {
      console.error('❌ Gemini API no está inicializada');
      return this.generateMockDrawing();
    }

    try {
      const targetDate = forDateKey ? new Date(forDateKey) : new Date();
      const dateKey = targetDate.toISOString().split('T')[0];
      const promptInfo = this.getColoringPrompts(targetDate);
      
      console.log('🎨 Prompt seleccionado:', promptInfo.theme, 'para el día:', dateKey);
      
      // Usar el prompt optimizado del promptsManager
      const enhancedPrompt = promptsManager.buildEnhancedPrompt(promptInfo.promptData);

      console.log('🤖 Generando imagen con Gemini 2.5...');
      console.log('🗺️ Prompt optimizado:', enhancedPrompt.substring(0, 100) + '...');
      
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

      const response = await this.genAI.models.generateContentStream({
        model: this.model,
        config,
        contents,
      });

      let imageData = null;
      
      for await (const chunk of response) {
        if (!chunk.candidates || !chunk.candidates[0]?.content?.parts) {
          continue;
        }
        
        // Procesar imagen
        if (chunk.candidates[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          imageData = {
            data: inlineData.data,
            mimeType: inlineData.mimeType || 'image/png'
          };
          console.log('✅ Imagen generada por Gemini recibida');
          break; // Solo necesitamos la primera imagen
        }
      }
      
      if (imageData) {
        // Guardar la imagen localmente para el día especificado
        const savedImagePath = await this.saveGeneratedImage(imageData, promptInfo.prompt, dateKey);
        
        return {
          prompt: promptInfo.prompt,
          theme: promptInfo.theme,
          imageUrl: savedImagePath,
          imageData: imageData,
          generatedAt: new Date().toISOString(),
          source: 'gemini-2.5',
          mimeType: imageData.mimeType,
          promptData: promptInfo.promptData
        };
      } else {
        console.log('⚠️ No se generó imagen con Gemini, usando SVG de respaldo');
        return this.generateMockDrawing(promptInfo.theme);
      }
      
    } catch (error) {
      console.error('❌ Error generando con Gemini 2.5:', error);
      
      // Manejo específico de error de cuota
      if (error.code === 429) {
        throw new Error('Cuota de Gemini agotada. Inténtalo más tarde.');
      }
      
      throw error;
    }
  }

  // Save generated image locally with day-based organization
  async saveGeneratedImage(imageData, prompt, forDateKey = null) {
    try {
      const dateKey = forDateKey || new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      const cleanPrompt = prompt.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 30);
      
      // Crear nombre de archivo con fecha y tema
      const fileName = `${dateKey}_${cleanPrompt}_${timestamp}`;
      
      // Determinar extensión basada en mimeType
      let extension = 'png';
      if (imageData.mimeType?.includes('jpeg')) extension = 'jpg';
      else if (imageData.mimeType?.includes('webp')) extension = 'webp';
      
      const fullFileName = `${fileName}.${extension}`;
      const theme = this.extractThemeFromPrompt(prompt);
      
      console.log(`💾 Guardando imagen: ${fullFileName} para el día ${dateKey}`);
      
      // Intentar guardar en servidor persistente
      try {
        const saveResult = await persistentStorage.saveImage(
          imageData.data,
          fullFileName,
          dateKey,
          prompt,
          theme
        );
        
        if (saveResult.success) {
          console.log(`✅ Imagen guardada exitosamente en servidor: ${fullFileName}`);
          return saveResult.url;
        }
      } catch (serverError) {
        console.warn('⚠️ Error guardando en servidor, continuando sin guardar:', serverError.message);
      }
      
      // Si falla el servidor, retornar data URL directamente sin intentar localStorage
      console.log('📱 Usando data URL directamente (sin persistencia)');
      return `data:${imageData.mimeType};base64,${imageData.data}`;
      
    } catch (error) {
      console.error('❌ Error en saveGeneratedImage:', error);
      // Fallback: retornar data URL directamente
      return `data:${imageData.mimeType};base64,${imageData.data}`;
    }
  }

  // Extract theme from prompt for organization
  extractThemeFromPrompt(prompt) {
    const themes = ['calabaza', 'murciélago', 'fantasma', 'bruja', 'esqueleto', 'araña', 'gato', 'sombrero', 'castillo', 'zombie'];
    for (const theme of themes) {
      if (prompt.toLowerCase().includes(theme)) {
        return theme;
      }
    }
    return 'dibujo'; // fallback
  }

  // Save image for specific day
  saveDailyImage(dateKey, imageInfo) {
    // Obtener imágenes existentes para este día
    const dayImages = JSON.parse(localStorage.getItem(`daily_images_${dateKey}`) || '[]');
    
    // Agregar la nueva imagen
    dayImages.push(imageInfo);
    
    // Guardar de vuelta
    localStorage.setItem(`daily_images_${dateKey}`, JSON.stringify(dayImages));
    
    // Actualizar índice de días con imágenes
    const daysWithImages = JSON.parse(localStorage.getItem('days_with_images') || '[]');
    if (!daysWithImages.includes(dateKey)) {
      daysWithImages.push(dateKey);
      daysWithImages.sort().reverse(); // Más recientes primero
      localStorage.setItem('days_with_images', JSON.stringify(daysWithImages));
    }
  }

  // Get images for specific day
  getImagesForDay(dateKey) {
    return JSON.parse(localStorage.getItem(`daily_images_${dateKey}`) || '[]');
  }

  // Get current day's image (or generate if doesn't exist)
  async getDailyImage(dateKey = null) {
    if (!dateKey) {
      dateKey = new Date().toISOString().split('T')[0];
    }
    
    console.log('🔍 Buscando imagen para el día:', dateKey);
    
    // Primero intentar obtener desde el servidor
    try {
      const serverImages = await persistentStorage.getImagesForDay(dateKey);
      
      if (serverImages.length > 0) {
        const imageInfo = serverImages[0];
        console.log('🌐 Imagen encontrada en servidor:', imageInfo.fileName);
        
        return {
          fileName: imageInfo.fileName,
          prompt: imageInfo.prompt,
          theme: imageInfo.theme,
          dateKey: dateKey,
          blobUrl: imageInfo.url, // URL del servidor
          source: 'server',
          generatedAt: imageInfo.savedAt
        };
      }
    } catch (error) {
      console.warn('⚠️ No se pudo conectar al servidor, intentando localStorage:', error);
    }
    
    // Fallback a localStorage solo si el servidor no está disponible
    const dayImages = this.getImagesForDay(dateKey);
    
    if (dayImages.length > 0) {
      const imageInfo = dayImages[0];
      console.log('� Imagen encontrada en localStorage:', imageInfo.fileName);
      
      // SIEMPRE recrear el blob URL desde localStorage para garantizar que funcione
      const imageData = localStorage.getItem(`image_data_${imageInfo.timestamp}`);
      if (imageData) {
        try {
          const parsedData = JSON.parse(imageData);
          const buffer = Uint8Array.from(atob(parsedData.data), c => c.charCodeAt(0));
          const blob = new Blob([buffer], { type: parsedData.mimeType });
          const newBlobUrl = URL.createObjectURL(blob);
          
          console.log('✅ Blob URL recreado desde localStorage');
          
          // Actualizar la información con el nuevo blob URL
          imageInfo.blobUrl = newBlobUrl;
          imageInfo.source = 'localStorage';
          
          return imageInfo;
        } catch (error) {
          console.error('❌ Error recreando blob:', error);
          return null;
        }
      }
    }
    
    console.log('📅 No hay imagen guardada para este día');
    return null; // No hay imagen para este día
  }

  // Get all days with images
  getDaysWithImages() {
    return JSON.parse(localStorage.getItem('days_with_images') || '[]');
  }

  // Clean up old localStorage blob URLs when server is available
  cleanupLocalStorage() {
    console.log('🧹 Limpiando localStorage obsoleto...');
    
    // Limpiar blob URLs antiguos
    const keys = Object.keys(localStorage);
    let cleanedCount = 0;
    
    keys.forEach(key => {
      if (key.startsWith('generated_images') || key.startsWith('daily_images_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item.blobUrl && item.blobUrl.startsWith('blob:')) {
                URL.revokeObjectURL(item.blobUrl);
                cleanedCount++;
              }
            });
          }
          localStorage.removeItem(key);
        } catch {
          // Ignorar errores de parsing
        }
      }
    });
    
    console.log(`✅ Limpiado ${cleanedCount} blob URLs obsoletos`);
  }
  
  // Get list of generated images
  getGeneratedImages() {
    try {
      return JSON.parse(localStorage.getItem('generated_images') || '[]');
    } catch (error) {
      console.error('❌ Error obteniendo imágenes:', error);
      return [];
    }
  }
  
  // Restore image from localStorage
  restoreImageFromStorage(timestamp) {
    try {
      const imageDataStr = localStorage.getItem(`image_data_${timestamp}`);
      if (!imageDataStr) return null;
      
      const imageData = JSON.parse(imageDataStr);
      const buffer = Uint8Array.from(atob(imageData.data), c => c.charCodeAt(0));
      const blob = new Blob([buffer], { type: imageData.mimeType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('❌ Error restaurando imagen:', error);
      return null;
    }
  }
  
  // Clear old generated images to save space
  clearOldImages(daysOld = 7) {
    try {
      const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      const savedImages = this.getGeneratedImages();
      
      // Filtrar imágenes recientes
      const recentImages = savedImages.filter(img => img.timestamp > cutoffDate);
      
      // Liberar URLs de imágenes antiguas
      savedImages.forEach(img => {
        if (img.timestamp <= cutoffDate && img.blobUrl) {
          URL.revokeObjectURL(img.blobUrl);
          localStorage.removeItem(`image_data_${img.timestamp}`);
        }
      });
      
      localStorage.setItem('generated_images', JSON.stringify(recentImages));
      console.log(`🧹 Limpieza completada: ${savedImages.length - recentImages.length} imágenes eliminadas`);
      
    } catch (error) {
      console.error('❌ Error en limpieza:', error);
    }
  }







  // Main function: Generate with Gemini
  async generateWithGemini(customPrompt = null) {
    return await this.generateImageWithGemini(customPrompt);
  }

  // Get or generate today's drawing
  async getTodayDrawingOrGenerate() {
    let todayDrawing = this.getTodayDrawing();
    
    if (!todayDrawing) {
      try {
        console.log('🎨 Generando nuevo dibujo del día...');
        todayDrawing = await this.generateWithGemini();
        this.saveDrawing(todayDrawing);
        console.log('✅ Dibujo generado y guardado');
      } catch (error) {
        console.error('❌ Error generating drawing:', error);
        throw error;
      }
    }
    
    return todayDrawing;
  }

  // New function: Generate custom drawing with Gemini
  async generateCustomDrawing(userPrompt) {
    console.log('🎨 Generando dibujo personalizado:', userPrompt);
    try {
      const drawing = await this.generateWithGemini(userPrompt);
      // Optionally save custom drawings too
      const customKey = `custom_${Date.now()}`;
      localStorage.setItem(`drawing_${customKey}`, JSON.stringify(drawing));
      return drawing;
    } catch (error) {
      console.error('❌ Error generando dibujo personalizado:', error);
      throw error;
    }
  }
}

export default new DrawingService();