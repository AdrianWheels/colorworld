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
      const drawing = await drawingService.getTodayDrawingOrGenerate();
      setDailyDrawing(drawing);
    } catch (err) {
      setError('Error al cargar el dibujo del día');
      console.error('Error loading daily drawing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadColoredDrawings = () => {
    try {
      const drawings = drawingService.getAllDrawings();
      setColoredDrawings(drawings);
    } catch (err) {
      console.error('Error loading colored drawings:', err);
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
      
      localStorage.setItem(`colored_${todayKey}`, JSON.stringify(coloredDrawing));
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