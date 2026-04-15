// Servicio para cargar imágenes del día desde Supabase.
// Fuente única de verdad: tabla `daily_images` (alimentada por el workflow diario).
import Logger from '../utils/logger.js';
import supabase from './supabaseClient.js';

class StaticImageService {
  constructor() {
    this.indexCache = null;
    this.lastIndexUpdate = null;
    this.cacheExpiry = 1 * 60 * 1000; // 1 minuto
  }

  // Devuelve el shape que consumen DrawingCalendar y demás:
  // { images: { 'YYYY-MM-DD': [{fileName, url, theme, dateKey, timestamp, ...}] }, daysByMonth, totalImages, totalDays }
  async loadImagesIndex() {
    if (this.indexCache && this.lastIndexUpdate &&
        (Date.now() - this.lastIndexUpdate < this.cacheExpiry)) {
      return this.indexCache;
    }

    try {
      const { data, error } = await supabase
        .from('daily_images')
        .select('date_key, file_name, public_url, tematica, file_size, generated_at')
        .order('date_key', { ascending: false });

      if (error) throw error;

      const images = {};
      const daysByMonth = {};

      for (const row of data ?? []) {
        images[row.date_key] = [{
          fileName: row.file_name,
          url: row.public_url,
          theme: row.tematica,
          dateKey: row.date_key,
          timestamp: new Date(row.generated_at).getTime(),
          extension: 'png',
          fileSize: row.file_size,
          lastModified: row.generated_at,
        }];
        const monthKey = row.date_key.slice(0, 7);
        if (!daysByMonth[monthKey]) daysByMonth[monthKey] = [];
        daysByMonth[monthKey].push(row.date_key);
      }

      const index = {
        lastUpdated: new Date().toISOString(),
        images,
        daysByMonth,
        totalImages: (data ?? []).length,
        totalDays: (data ?? []).length,
      };

      this.indexCache = index;
      this.lastIndexUpdate = Date.now();
      Logger.log('✅ Índice cargado desde Supabase:', index.totalImages, 'imágenes');
      return index;
    } catch (error) {
      Logger.warn('⚠️ Error cargando índice desde Supabase:', error.message);
      return {
        lastUpdated: new Date().toISOString(),
        images: {},
        daysByMonth: {},
        totalImages: 0,
        totalDays: 0,
      };
    }
  }

  // Intentar cargar una imagen para una fecha específica
  async getImageForDate(dateKey) {
    Logger.log(`🔍 Buscando imagen para el día: ${dateKey}`);
    
    try {
      const index = await this.loadImagesIndex();
      const dayImages = index.images[dateKey];
      
      if (!dayImages || dayImages.length === 0) {
        Logger.log(`📭 No hay imágenes disponibles para: ${dateKey}, usando fallback`);
        return this.getFallbackImage();
      }
      
      // Tomar la primera imagen disponible para el día
      const imageInfo = dayImages[0];
      
      // Verificar que la imagen realmente existe
      if (await this.imageExists(imageInfo.url)) {
        Logger.log(`✅ Imagen estática encontrada: ${imageInfo.url}`);
        return {
          url: imageInfo.url,
          fileName: imageInfo.fileName,
          dateKey: imageInfo.dateKey,
          theme: imageInfo.theme,
          timestamp: imageInfo.timestamp,
          source: 'static'
        };
      } else {
        Logger.log(`❌ Imagen en índice no existe físicamente: ${imageInfo.url}, usando fallback`);
        return this.getFallbackImage();
      }
      
    } catch (error) {
      Logger.error('❌ Error buscando imagen estática para:', dateKey, error);
      Logger.log('🐰 Usando imagen de fallback');
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
      
      Logger.log(`📋 ${allImages.length} imágenes disponibles en total`);
      return allImages;
      
    } catch (error) {
      Logger.error('❌ Error obteniendo todas las imágenes:', error);
      return [];
    }
  }

  // Obtener días disponibles para un mes específico
  async getDaysForMonth(yearMonth) {
    try {
      const index = await this.loadImagesIndex();
      return index.daysByMonth[yearMonth] || [];
    } catch (error) {
      Logger.error('❌ Error obteniendo días del mes:', yearMonth, error);
      return [];
    }
  }

  // Invalidar caché (útil para desarrollo)
  invalidateCache() {
    this.indexCache = null;
    this.lastIndexUpdate = null;
    Logger.log('🗑️ Caché de índice invalidado');
  }

  // Forzar recarga del índice sin caché
  async forceReloadIndex() {
    this.invalidateCache();
    return await this.loadImagesIndex();
  }
}

export default new StaticImageService();
