// API Service for persistent image storage
import staticImageService from './staticImageService.js';

class PersistentStorageService {
  constructor() {
    this.apiUrl = 'http://localhost:3001/api';
    this.isServerAvailable = false;
    this.checkServerStatus();
  }

  // Check if the API server is running
  async checkServerStatus() {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      if (response.ok) {
        this.isServerAvailable = true;
        console.log('✅ Servidor API disponible');
      }
    } catch (error) {
      this.isServerAvailable = false;
      console.log('⚠️ Servidor API no disponible, usando localStorage como fallback');
    }
  }

  // Save image to persistent storage
  async saveImage(imageData, fileName, dateKey, prompt, animal) {
    if (!this.isServerAvailable) {
      console.log('💾 Guardando en localStorage (servidor no disponible)');
      return this.saveToLocalStorage(imageData, fileName, dateKey, prompt, animal);
    }

    try {
      const response = await fetch(`${this.apiUrl}/save-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageData,
          fileName,
          dateKey,
          prompt,
          animal
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Imagen guardada en servidor:', result.filePath);
        return {
          success: true,
          url: `http://localhost:3001${result.filePath}`,
          filePath: result.filePath,
          metadata: result.metadata
        };
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error guardando en servidor, usando localStorage:', error);
      return this.saveToLocalStorage(imageData, fileName, dateKey, prompt, animal);
    }
  }

  // Fallback to localStorage
  saveToLocalStorage(imageData, fileName, dateKey, prompt, animal) {
    try {
      const timestamp = Date.now();
      const blobUrl = `data:image/png;base64,${imageData}`;
      
      const imageInfo = {
        fileName,
        dateKey,
        prompt,
        animal,
        timestamp,
        savedAt: new Date().toISOString(),
        source: 'localStorage'
      };

      // Save to localStorage
      localStorage.setItem(`image_data_${timestamp}`, JSON.stringify({
        data: imageData,
        mimeType: 'image/png',
        prompt,
        dateKey
      }));

      return {
        success: true,
        url: blobUrl,
        metadata: imageInfo,
        source: 'localStorage'
      };
    } catch (error) {
      console.error('❌ Error guardando en localStorage:', error);
      return { success: false, error: error.message };
    }
  }

  // Get images for a specific day
  async getImagesForDay(dateKey) {
    if (!this.isServerAvailable) {
      // Primero intentar cargar imagen estática
      const staticImage = await staticImageService.getImageForDate(dateKey);
      if (staticImage) {
        console.log('✅ Imagen estática encontrada:', staticImage.url);
        return [staticImage];
      }
      // Fallback a localStorage
      return this.getFromLocalStorage(dateKey);
    }

    try {
      const response = await fetch(`${this.apiUrl}/images/${dateKey}`);
      if (response.ok) {
        const images = await response.json();
        return images.map(img => ({
          ...img,
          url: `http://localhost:3001${img.url}`,
          source: 'server'
        }));
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error obteniendo imágenes del servidor, usando localStorage:', error);
      return this.getFromLocalStorage(dateKey);
    }
  }

  // Fallback to get from localStorage
  getFromLocalStorage(dateKey) {
    try {
      const dayImages = JSON.parse(localStorage.getItem(`daily_images_${dateKey}`) || '[]');
      return dayImages.map(img => ({
        ...img,
        source: 'localStorage'
      }));
    } catch (error) {
      console.error('❌ Error obteniendo de localStorage:', error);
      return [];
    }
  }

  // Test server connection
  async testConnection() {
    await this.checkServerStatus();
    return this.isServerAvailable;
  }
}

// Export singleton instance
const persistentStorage = new PersistentStorageService();
export default persistentStorage;