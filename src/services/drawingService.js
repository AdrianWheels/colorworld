// AI Drawing Service
// This service handles generating daily drawings using Gemini 2.5 Flash Image Preview

import { GoogleGenAI } from '@google/genai';
import promptsManager from './promptsManager.js';
import persistentStorage from './persistentStorage.js';
import Logger from '../utils/logger.js';

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
        Logger.error('? API key no encontrada. Aseg�rate de configurar VITE_GEMINI_API_KEY en .env');
        return;
      }
      
      this.genAI = new GoogleGenAI({
        apiKey: this.apiKey,
      });
      
      Logger.log('? Gemini 2.5 Flash Image Preview inicializada correctamente');
    } catch (error) {
      Logger.error('? Error inicializando Gemini API:', error);
    }
  }

  // Set the Gemini API key (opcional, ya est� en .env)
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
      Logger.error('? Gemini API no est� inicializada');
      return this.generateMockDrawing();
    }

    try {
      const targetDate = forDateKey ? new Date(forDateKey) : new Date();
      const dateKey = targetDate.toISOString().split('T')[0];
      const promptInfo = this.getColoringPrompts(targetDate);
      
      Logger.log('?? Prompt seleccionado:', promptInfo.theme, 'para el d�a:', dateKey);
      
      // Usar el prompt optimizado del promptsManager
      const enhancedPrompt = promptsManager.buildEnhancedPrompt(promptInfo.promptData);

      Logger.log('?? Generando imagen con Gemini 2.5...');
      Logger.log('??? Prompt optimizado:', enhancedPrompt.substring(0, 100) + '...');
      
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
          Logger.log('? Imagen generada por Gemini recibida');
          break; // Solo necesitamos la primera imagen
        }
      }
      
      if (imageData) {
        // Guardar la imagen localmente para el d�a especificado
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
        Logger.log('?? No se gener� imagen con Gemini, usando SVG de respaldo');
        return this.generateMockDrawing(promptInfo.theme);
      }
      
    } catch (error) {
      Logger.error('? Error generando con Gemini 2.5:', error);
      
      // Manejo espec�fico de error de cuota
      if (error.code === 429) {
        throw new Error('Cuota de Gemini agotada. Int�ntalo m�s tarde.');
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
      
      // Determinar extensi�n basada en mimeType
      let extension = 'png';
      if (imageData.mimeType?.includes('jpeg')) extension = 'jpg';
      else if (imageData.mimeType?.includes('webp')) extension = 'webp';
      
      const fullFileName = `${fileName}.${extension}`;
      const theme = this.extractThemeFromPrompt(prompt);
      
      Logger.log(`?? Guardando imagen: ${fullFileName} para el d�a ${dateKey}`);
      
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
          Logger.log(`? Imagen guardada exitosamente en servidor: ${fullFileName}`);
          return saveResult.url;
        }
      } catch (serverError) {
        Logger.warn('?? Error guardando en servidor, continuando sin guardar:', serverError.message);
      }
      
      // Si falla el servidor, retornar data URL directamente sin intentar localStorage
      Logger.log('?? Usando data URL directamente (sin persistencia)');
      return `data:${imageData.mimeType};base64,${imageData.data}`;
      
    } catch (error) {
      Logger.error('? Error en saveGeneratedImage:', error);
      // Fallback: retornar data URL directamente
      return `data:${imageData.mimeType};base64,${imageData.data}`;
    }
  }

  // Extract theme from prompt for organization
  extractThemeFromPrompt(prompt) {
    const themes = ['calabaza', 'murci�lago', 'fantasma', 'bruja', 'esqueleto', 'ara�a', 'gato', 'sombrero', 'castillo', 'zombie'];
    for (const theme of themes) {
      if (prompt.toLowerCase().includes(theme)) {
        return theme;
      }
    }
    return 'dibujo'; // fallback
  }

  // Save image for specific day
  saveDailyImage(dateKey, imageInfo) {
    // Obtener im�genes existentes para este d�a
    const dayImages = JSON.parse(localStorage.getItem(`daily_images_${dateKey}`) || '[]');
    
    // Agregar la nueva imagen
    dayImages.push(imageInfo);
    
    // Guardar de vuelta
    localStorage.setItem(`daily_images_${dateKey}`, JSON.stringify(dayImages));
    
    // Actualizar �ndice de d�as con im�genes
    const daysWithImages = JSON.parse(localStorage.getItem('days_with_images') || '[]');
    if (!daysWithImages.includes(dateKey)) {
      daysWithImages.push(dateKey);
      daysWithImages.sort().reverse(); // M�s recientes primero
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
    
    Logger.log('?? Buscando imagen para el d�a:', dateKey);
    
    // Primero intentar obtener desde el servidor
    try {
      const serverImages = await persistentStorage.getImagesForDay(dateKey);
      
      if (serverImages.length > 0) {
        const imageInfo = serverImages[0];
        Logger.log('?? Imagen encontrada en servidor:', imageInfo.fileName);
        
        return {
          fileName: imageInfo.fileName || 'imagen.png',
          prompt: imageInfo.prompt || imageInfo.theme || 'Sin prompt',
          theme: imageInfo.theme || 'Sin tema',
          dateKey: dateKey,
          blobUrl: imageInfo.url, // URL del servidor o est�tica
          source: imageInfo.source || 'static',
          generatedAt: imageInfo.savedAt || imageInfo.lastModified || new Date().toISOString()
        };
      }
    } catch (error) {
      Logger.warn('?? No se pudo conectar al servidor, intentando localStorage:', error);
    }
    
    // Fallback a localStorage solo si el servidor no est� disponible
    const dayImages = this.getImagesForDay(dateKey);
    
    if (dayImages.length > 0) {
      const imageInfo = dayImages[0];
      Logger.log('? Imagen encontrada en localStorage:', imageInfo.fileName);
      
      // SIEMPRE recrear el blob URL desde localStorage para garantizar que funcione
      const imageData = localStorage.getItem(`image_data_${imageInfo.timestamp}`);
      if (imageData) {
        try {
          const parsedData = JSON.parse(imageData);
          const buffer = Uint8Array.from(atob(parsedData.data), c => c.charCodeAt(0));
          const blob = new Blob([buffer], { type: parsedData.mimeType });
          const newBlobUrl = URL.createObjectURL(blob);
          
          Logger.log('? Blob URL recreado desde localStorage');
          
          // Actualizar la informaci�n con el nuevo blob URL
          imageInfo.blobUrl = newBlobUrl;
          imageInfo.source = 'localStorage';
          
          return imageInfo;
        } catch (error) {
          Logger.error('? Error recreando blob:', error);
          return null;
        }
      }
    }
    
    Logger.log('?? No hay imagen guardada para este d�a');
    return null; // No hay imagen para este d�a
  }

  // Get all days with images
  getDaysWithImages() {
    return JSON.parse(localStorage.getItem('days_with_images') || '[]');
  }

  // Clean up old localStorage blob URLs when server is available
  cleanupLocalStorage() {
    Logger.log('?? Limpiando localStorage obsoleto...');
    
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
    
    Logger.log(`? Limpiado ${cleanedCount} blob URLs obsoletos`);
  }
  
  // Get list of generated images
  getGeneratedImages() {
    try {
      return JSON.parse(localStorage.getItem('generated_images') || '[]');
    } catch (error) {
      Logger.error('? Error obteniendo im�genes:', error);
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
      Logger.error('? Error restaurando imagen:', error);
      return null;
    }
  }
  
  // Clear old generated images to save space
  clearOldImages(daysOld = 7) {
    try {
      const cutoffDate = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
      const savedImages = this.getGeneratedImages();
      
      // Filtrar im�genes recientes
      const recentImages = savedImages.filter(img => img.timestamp > cutoffDate);
      
      // Liberar URLs de im�genes antiguas
      savedImages.forEach(img => {
        if (img.timestamp <= cutoffDate && img.blobUrl) {
          URL.revokeObjectURL(img.blobUrl);
          localStorage.removeItem(`image_data_${img.timestamp}`);
        }
      });
      
      localStorage.setItem('generated_images', JSON.stringify(recentImages));
      Logger.log(`?? Limpieza completada: ${savedImages.length - recentImages.length} im�genes eliminadas`);
      
    } catch (error) {
      Logger.error('? Error en limpieza:', error);
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
        Logger.log('?? Generando nuevo dibujo del d�a...');
        todayDrawing = await this.generateWithGemini();
        this.saveDrawing(todayDrawing);
        Logger.log('? Dibujo generado y guardado');
      } catch (error) {
        Logger.error('? Error generating drawing:', error);
        throw error;
      }
    }
    
    return todayDrawing;
  }

  // New function: Generate custom drawing with Gemini
  async generateCustomDrawing(userPrompt) {
    Logger.log('?? Generando dibujo personalizado:', userPrompt);
    try {
      const drawing = await this.generateWithGemini(userPrompt);
      // Optionally save custom drawings too
      const customKey = `custom_${Date.now()}`;
      localStorage.setItem(`drawing_${customKey}`, JSON.stringify(drawing));
      return drawing;
    } catch (error) {
      Logger.error('? Error generando dibujo personalizado:', error);
      throw error;
    }
  }
}

export default new DrawingService();
