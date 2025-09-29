// Servicio para cargar imágenes estáticas desde Vercel
class StaticImageService {
  constructor() {
    this.baseImagePath = '/generated-images';
  }

  // Construir la URL de la imagen para una fecha específica
  buildImageUrl(dateKey, fileName = null) {
    const [year, month] = dateKey.split('-');
    const monthFolder = `${year}-${month}`;
    
    if (fileName) {
      return `${this.baseImagePath}/${monthFolder}/${fileName}`;
    }
    
    // Si no tenemos fileName, devolvemos la URL base de la carpeta
    return `${this.baseImagePath}/${monthFolder}`;
  }

  // Intentar cargar una imagen para una fecha específica
  async getImageForDate(dateKey) {
    const [year, month] = dateKey.split('-');
    const monthFolder = `${year}-${month}`;
    
    // Lista de posibles extensiones y patrones de nombres
    const possiblePatterns = [
      `${dateKey}_*.png`,
      `${dateKey}_*.jpg`,
      `${dateKey}_*.jpeg`
    ];

    // En el navegador, no podemos listar archivos directamente
    // Pero podemos intentar cargar patrones conocidos
    try {
      // Intentar cargar con patrones comunes basados en los archivos que vimos
      const commonPatterns = [
        `${dateKey}_Un_perrito_alegre_corriendo_po_1758975693548.png`,
        `${dateKey}_Un_elefante_beb_jugando_con_ag_1758974062645.png`,
        `${dateKey}_mandala_frutas_verano.png`, // Patrón esperado para hoy
      ];

      for (const pattern of commonPatterns) {
        const imageUrl = this.buildImageUrl(dateKey, pattern);
        
        // Verificar si la imagen existe
        if (await this.imageExists(imageUrl)) {
          return {
            url: imageUrl,
            fileName: pattern,
            dateKey,
            source: 'static'
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error buscando imagen estática:', error);
      return null;
    }
  }

  // Verificar si una imagen existe
  async imageExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Obtener todas las imágenes conocidas (basado en patrones)
  async getAllKnownImages() {
    const knownImages = [
      { dateKey: '2025-09-23', fileName: '2025-09-23_Un_perrito_alegre_corriendo_po_1758975693548.png' },
      { dateKey: '2025-09-24', fileName: '2025-09-24_Un_perrito_alegre_corriendo_po_1758975693548.png' },
      { dateKey: '2025-09-25', fileName: '2025-09-25_Un_perrito_alegre_corriendo_po_1758975693548.png' },
      { dateKey: '2025-09-26', fileName: '2025-09-26_Un_elefante_beb_jugando_con_ag_1758974062645.png' },
      { dateKey: '2025-09-27', fileName: '2025-09-27_Un_perrito_alegre_corriendo_po_1758975693548.png' },
      { dateKey: '2025-09-29', fileName: '2025-09-29_Un_perrito_alegre_corriendo_po_1758975693548 - copia.png' }
    ];

    const availableImages = [];
    
    for (const image of knownImages) {
      const imageUrl = this.buildImageUrl(image.dateKey, image.fileName);
      if (await this.imageExists(imageUrl)) {
        availableImages.push({
          ...image,
          url: imageUrl,
          source: 'static'
        });
      }
    }
    
    return availableImages;
  }
}

export default new StaticImageService();