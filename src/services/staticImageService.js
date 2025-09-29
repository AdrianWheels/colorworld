// Servicio para cargar imágenes estáticas desde Vercel usando índice dinámico
class StaticImageService {
  constructor() {
    this.baseImagePath = '/generated-images';
    this.indexUrl = '/generated-images/images-index.json';
    this.indexCache = null;
    this.lastIndexUpdate = null;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutos
  }

  // Cargar el índice de imágenes dinámicamente
  async loadImagesIndex() {
    try {
      // Usar caché si está disponible y no ha expirado
      if (this.indexCache && this.lastIndexUpdate && 
          (Date.now() - this.lastIndexUpdate < this.cacheExpiry)) {
        return this.indexCache;
      }

      console.log('🔄 Cargando índice de imágenes...');
      const response = await fetch(this.indexUrl);
      
      if (!response.ok) {
        throw new Error(`Error cargando índice: ${response.status}`);
      }
      
      const index = await response.json();
      this.indexCache = index;
      this.lastIndexUpdate = Date.now();
      
      console.log('✅ Índice de imágenes cargado:', Object.keys(index.images).length, 'días disponibles');
      return index;
      
    } catch (error) {
      console.warn('⚠️ Error cargando índice de imágenes:', error);
      // Fallback: devolver estructura vacía
      return {
        lastUpdated: new Date().toISOString(),
        images: {},
        daysByMonth: {}
      };
    }
  }

  // Intentar cargar una imagen para una fecha específica
  async getImageForDate(dateKey) {
    console.log(`🔍 Buscando imagen para el día: ${dateKey}`);
    
    try {
      const index = await this.loadImagesIndex();
      const dayImages = index.images[dateKey];
      
      if (!dayImages || dayImages.length === 0) {
        console.log(`📭 No hay imágenes disponibles para: ${dateKey}, usando fallback`);
        return this.getFallbackImage();
      }
      
      // Tomar la primera imagen disponible para el día
      const imageInfo = dayImages[0];
      
      // Verificar que la imagen realmente existe
      if (await this.imageExists(imageInfo.url)) {
        console.log(`✅ Imagen estática encontrada: ${imageInfo.url}`);
        return {
          url: imageInfo.url,
          fileName: imageInfo.fileName,
          dateKey: imageInfo.dateKey,
          theme: imageInfo.theme,
          timestamp: imageInfo.timestamp,
          source: 'static'
        };
      } else {
        console.log(`❌ Imagen en índice no existe físicamente: ${imageInfo.url}, usando fallback`);
        return this.getFallbackImage();
      }
      
    } catch (error) {
      console.error('❌ Error buscando imagen estática para:', dateKey, error);
      console.log('🐰 Usando imagen de fallback');
      return this.getFallbackImage();
    }
  }

  // Obtener imagen de fallback (conejo)
  getFallbackImage() {
    return {
      url: '/conejoprueba.png',
      fileName: 'conejoprueba.png',
      dateKey: 'fallback',
      theme: 'Conejo de prueba',
      prompt: 'Imagen de fallback del conejo',
      timestamp: 0,
      source: 'fallback',
      lastModified: new Date().toISOString()
    };
  }

  // Verificar si una imagen existe
  async imageExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Obtener todas las imágenes disponibles del índice
  async getAllKnownImages() {
    try {
      const index = await this.loadImagesIndex();
      const allImages = [];
      
      // Convertir el objeto de imágenes a un array plano
      for (const [, dayImages] of Object.entries(index.images)) {
        for (const imageInfo of dayImages) {
          allImages.push({
            ...imageInfo,
            source: 'static'
          });
        }
      }
      
      // Ordenar por fecha (más recientes primero)
      allImages.sort((a, b) => new Date(b.dateKey) - new Date(a.dateKey));
      
      console.log(`📋 ${allImages.length} imágenes disponibles en total`);
      return allImages;
      
    } catch (error) {
      console.error('❌ Error obteniendo todas las imágenes:', error);
      return [];
    }
  }

  // Obtener días disponibles para un mes específico
  async getDaysForMonth(yearMonth) {
    try {
      const index = await this.loadImagesIndex();
      return index.daysByMonth[yearMonth] || [];
    } catch (error) {
      console.error('❌ Error obteniendo días del mes:', yearMonth, error);
      return [];
    }
  }

  // Invalidar caché (útil para desarrollo)
  invalidateCache() {
    this.indexCache = null;
    this.lastIndexUpdate = null;
    console.log('🗑️ Caché de índice invalidado');
  }
}

export default new StaticImageService();