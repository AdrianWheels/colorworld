import { useState, useEffect } from 'react';
import drawingService from '../services/drawingService';

export const useDrawing = () => {
  const [dailyDrawing, setDailyDrawing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coloredDrawings, setColoredDrawings] = useState([]);

  // Load today's drawing
  useEffect(() => {
    loadTodayDrawing();
    loadColoredDrawings();
  }, []);

  const loadTodayDrawing = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Intentar cargar imagen existente primero
      const existingImage = await drawingService.getDailyImage();
      if (existingImage) {
        setDailyDrawing({
          prompt: existingImage.prompt || 'Dibujo del día',
          imageUrl: existingImage.blobUrl,
          source: existingImage.source
        });
        return;
      }
      
      // Si no hay imagen, la web debe cargar igual sin imagen
      setDailyDrawing({
        prompt: 'No hay imagen disponible para hoy',
        imageUrl: null,
        source: 'none'
      });
      
    } catch (err) {
      // Si hay error, la web debe cargar con placeholder
      console.warn('No se pudo cargar imagen del día:', err);
      setDailyDrawing({
        prompt: 'Imagen no disponible',
        imageUrl: null,
        source: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadColoredDrawings = () => {
    try {
      const drawings = drawingService.getAllDrawings();
      setColoredDrawings(drawings || []);
    } catch (err) {
      console.warn('Error loading colored drawings:', err);
      setColoredDrawings([]);
    }
  };

  const saveColoredDrawing = (canvasDataUrl) => {
    try {
      const todayKey = drawingService.getTodayKey();
      const coloredDrawing = {
        originalPrompt: dailyDrawing?.prompt || 'Dibujo coloreado',
        coloredImageUrl: canvasDataUrl,
        coloredAt: new Date().toISOString()
      };
      
      // Intentar guardar, pero si falla por cuota, limpiar primero
      try {
        localStorage.setItem(`colored_${todayKey}`, JSON.stringify(coloredDrawing));
      } catch (quotaError) {
        if (quotaError.name === 'QuotaExceededError') {
          console.warn('localStorage lleno, limpiando datos antiguos...');
          drawingService.clearOldImages(3); // Limpiar imágenes de más de 3 días
          localStorage.setItem(`colored_${todayKey}`, JSON.stringify(coloredDrawing));
        } else {
          throw quotaError;
        }
      }
      
      loadColoredDrawings();
      
      return true;
    } catch (err) {
      console.error('Error saving colored drawing:', err);
      return false;
    }
  };

  const generateNewDrawing = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clear today's drawing from cache to force regeneration
      const todayKey = drawingService.getTodayKey();
      localStorage.removeItem(`drawing_${todayKey}`);
      
      const newDrawing = await drawingService.generateMockDrawing();
      drawingService.saveDrawing(newDrawing);
      setDailyDrawing(newDrawing);
    } catch (err) {
      setError('Error al generar nuevo dibujo');
      console.error('Error generating new drawing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dailyDrawing,
    isLoading,
    error,
    coloredDrawings,
    saveColoredDrawing,
    generateNewDrawing,
    refreshDrawings: loadColoredDrawings
  };
};