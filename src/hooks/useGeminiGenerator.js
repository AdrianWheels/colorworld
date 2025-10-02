import { useState, useCallback } from 'react';
import drawingService from '../services/drawingService';
import Logger from '../utils/logger.js';

export const useGeminiGenerator = () => {
  const [isGeneratingWithGemini, setIsGeneratingWithGemini] = useState(false);

  const handleGenerateWithGemini = useCallback(async (targetDate, canvasRef, onStatusUpdate) => {
    try {
      setIsGeneratingWithGemini(true);
      const dateKey = targetDate ? targetDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      
      const generatedDrawing = await drawingService.generateImageWithGemini(dateKey);
      
      if (generatedDrawing && generatedDrawing.imageUrl) {
        if (canvasRef && canvasRef.current) {
          await canvasRef.current.loadBackgroundImage(generatedDrawing.imageUrl);
        }
        
        // Actualizar estado del día si se proporciona callback
        if (onStatusUpdate) {
          onStatusUpdate('available');
        }
        
        return { success: true, message: '¡Imagen generada exitosamente!' };
      } else {
        return { success: false, message: 'Error al generar la imagen. Inténtalo de nuevo.' };
      }
    } catch (error) {
      Logger.error('❌ Error generando con Gemini:', error);
      return { 
        success: false, 
        message: error.message || 'Error al generar la imagen. Verifica tu conexión e inténtalo de nuevo.' 
      };
    } finally {
      setIsGeneratingWithGemini(false);
    }
  }, []);

  return {
    isGeneratingWithGemini,
    handleGenerateWithGemini
  };
};
