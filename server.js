import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Para manejar imágenes grandes

// Asegurar que la carpeta generated-images existe
const IMAGES_DIR = path.join(__dirname, 'public', 'generated-images');

async function ensureImagesDir() {
  try {
    await fs.access(IMAGES_DIR);
  } catch (error) {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    console.log('📁 Carpeta generated-images creada');
  }
}

// Endpoint para guardar imagen
app.post('/api/save-image', async (req, res) => {
  try {
    const { imageData, fileName, dateKey, prompt, animal } = req.body;
    
    if (!imageData || !fileName) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Asegurar que la carpeta existe
    await ensureImagesDir();

    // Crear subcarpeta por año-mes si no existe
    const [year, month] = dateKey.split('-');
    const monthDir = path.join(IMAGES_DIR, `${year}-${month}`);
    try {
      await fs.access(monthDir);
    } catch (error) {
      await fs.mkdir(monthDir, { recursive: true });
    }

    // Guardar la imagen
    const imageBuffer = Buffer.from(imageData, 'base64');
    const filePath = path.join(monthDir, fileName);
    await fs.writeFile(filePath, imageBuffer);

    // Guardar metadata
    const metadataPath = path.join(monthDir, `${path.parse(fileName).name}.json`);
    const metadata = {
      fileName,
      dateKey,
      prompt,
      animal,
      savedAt: new Date().toISOString(),
      fileSize: imageBuffer.length
    };
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`💾 Imagen guardada: ${filePath}`);
    
    res.json({ 
      success: true, 
      filePath: `/generated-images/${year}-${month}/${fileName}`,
      metadata 
    });

  } catch (error) {
    console.error('❌ Error guardando imagen:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para listar imágenes por día
app.get('/api/images/:dateKey', async (req, res) => {
  try {
    const { dateKey } = req.params;
    const [year, month] = dateKey.split('-');
    const monthDir = path.join(IMAGES_DIR, `${year}-${month}`);
    
    try {
      const files = await fs.readdir(monthDir);
      const imageFiles = files.filter(file => file.includes(dateKey) && !file.endsWith('.json'));
      
      const images = [];
      for (const file of imageFiles) {
        const metadataFile = path.join(monthDir, `${path.parse(file).name}.json`);
        try {
          const metadata = JSON.parse(await fs.readFile(metadataFile, 'utf8'));
          images.push({
            ...metadata,
            url: `/generated-images/${year}-${month}/${file}`
          });
        } catch (error) {
          // Si no hay metadata, crear básica
          images.push({
            fileName: file,
            dateKey,
            url: `/generated-images/${year}-${month}/${file}`
          });
        }
      }
      
      res.json(images);
    } catch (error) {
      res.json([]); // No hay imágenes para este día
    }

  } catch (error) {
    console.error('❌ Error listando imágenes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Servir archivos estáticos de las imágenes generadas
app.use('/generated-images', express.static(IMAGES_DIR));

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, async () => {
  await ensureImagesDir();
  console.log(`🚀 Servidor API corriendo en puerto ${PORT}`);
  console.log(`📁 Imágenes se guardarán en: ${IMAGES_DIR}`);
});

export default app;