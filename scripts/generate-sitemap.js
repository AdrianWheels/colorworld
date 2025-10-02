import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateSitemap() {
  const baseUrl = 'https://coloreveryday.vercel.app';
  
  // Leer imágenes generadas
  const projectRoot = path.join(__dirname, '..');
  const imagesIndexPath = path.join(projectRoot, 'public', 'generated-images', 'images-index.json');
  let imagesData = {};
  
  try {
    if (fs.existsSync(imagesIndexPath)) {
      const imagesContent = fs.readFileSync(imagesIndexPath, 'utf8');
      const parsedData = JSON.parse(imagesContent);
      imagesData = parsedData.images || {};
    }
  } catch (error) {
    console.error('Error reading images index:', error);
  }
  
  const currentDate = new Date().toISOString();
  
  let imageUrls = '';
  
  // Procesar imágenes por fecha
  Object.entries(imagesData).forEach(([date, images]) => {
    // images puede ser un array
    const imagesList = Array.isArray(images) ? images : [images];
    
    imagesList.forEach(imageData => {
      if (imageData && imageData.fileName && imageData.theme) {
        const imageUrl = `${baseUrl}${imageData.url}`;
        const pageUrl = `${baseUrl}/?date=${date}`;
        
        imageUrls += `  <!-- Dibujo del ${date} -->
  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>Dibujo de ${imageData.theme} para Colorear - ${date}</image:title>
      <image:caption>Dibujo generado con IA para colorear online gratis. Tema: ${imageData.theme}</image:caption>
      <image:license>https://creativecommons.org/licenses/by/4.0/</image:license>
    </image:image>
  </url>
`;
      }
    });
  });
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- About Us -->
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
${imageUrls}
</urlset>`;
  
  return sitemap;
}

// Función para escribir el sitemap
export async function writeSitemap() {
  try {
    const sitemap = await generateSitemap();
    const projectRoot = path.join(__dirname, '..');
    const sitemapPath = path.join(projectRoot, 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);
    console.log('Sitemap generado exitosamente en:', sitemapPath);
  } catch (error) {
    console.error('Error generando sitemap:', error);
  }
}

// Ejecutar automáticamente al importar
writeSitemap();