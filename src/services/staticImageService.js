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
    console.log(`🔍 Buscando imagen para el día: ${dateKey}`);
    
    try {
      // Lista específica de archivos conocidos por fecha
      const knownFiles = this.getKnownFilesForDate(dateKey);
      
      // Probar archivos conocidos específicos
      for (const fileName of knownFiles) {
        const imageUrl = this.buildImageUrl(dateKey, fileName);
        console.log(`🔍 Probando: ${imageUrl}`);
        
        if (await this.imageExists(imageUrl)) {
          console.log(`✅ Imagen estática encontrada: ${imageUrl}`);
          return {
            url: imageUrl,
            fileName: fileName,
            dateKey,
            source: 'static'
          };
        }
      }
      
      console.log(`❌ No se encontró imagen para: ${dateKey}`);
      return null;
    } catch {
      console.error('Error buscando imagen estática para:', dateKey);
      return null;
    }
  }
  
  // Obtener archivos conocidos para una fecha específica
  getKnownFilesForDate(dateKey) {
    const knownFilesByDate = {
      '2025-09-23': ['2025-09-23_Un_perrito_alegre_corriendo_po_1758975693548.png'],
      '2025-09-24': ['2025-09-24_Un_perrito_alegre_corriendo_po_1758975693548.png'],
      '2025-09-25': ['2025-09-25_Un_perrito_alegre_corriendo_po_1758975693548.png'],
      '2025-09-26': ['2025-09-26_Un_elefante_beb_jugando_con_ag_1758974062645.png'],
      '2025-09-27': ['2025-09-27_Un_perrito_alegre_corriendo_po_1758975693548.png'],
      // 2025-09-28: No existe imagen (normal)
      '2025-09-29': [
        // Usar la imagen que realmente está en Vercel según la captura
        '2025-09-29_MandalaFrutasVerano_1759156265294.png',
        '2025-09-29_MandalaFrutasVerano_1759156146822.png'
      ],
      // Las siguientes fechas tendrán imágenes generadas automáticamente
      '2025-09-30': [], // Se agregará cuando GitHub Actions genere
      '2025-10-01': [], // Se agregará cuando GitHub Actions genere
    };
    
    return knownFilesByDate[dateKey] || [];
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