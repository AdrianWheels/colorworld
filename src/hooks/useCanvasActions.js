import { useState, useCallback } from 'react';

export const useCanvasActions = (canvasRef, saveColoredDrawing) => {
  const [canvasData, setCanvasData] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateUndoRedoState = useCallback(() => {
    if (canvasRef.current) {
      setCanUndo(canvasRef.current.canUndo());
      setCanRedo(canvasRef.current.canRedo());
    }
  }, [canvasRef]);

  const handleUndo = useCallback(() => {
    if (canvasRef.current && canvasRef.current.undo) {
      canvasRef.current.undo();
      updateUndoRedoState();
    }
  }, [canvasRef, updateUndoRedoState]);

  const handleRedo = useCallback(() => {
    if (canvasRef.current && canvasRef.current.redo) {
      canvasRef.current.redo();
      updateUndoRedoState();
    }
  }, [canvasRef, updateUndoRedoState]);

  const handleClearCanvas = useCallback(() => {
    if (canvasRef.current && canvasRef.current.clearCanvas) {
      canvasRef.current.clearCanvas();
    }
  }, [canvasRef]);

  const handleCanvasChangeWithUndoUpdate = useCallback((dataUrl) => {
    setCanvasData(dataUrl);
    // Pequeño delay para asegurar que el canvas se actualice
    setTimeout(() => {
      updateUndoRedoState();
    }, 0);
  }, [updateUndoRedoState]);

  const handleSaveDrawing = useCallback(() => {
    if (canvasRef.current && canvasRef.current.exportCombinedImage) {
      try {
        // Exportar imagen combinada con todas las capas
        const combinedImageData = canvasRef.current.exportCombinedImage();
        
        if (combinedImageData) {
          // Crear enlace de descarga
          const link = document.createElement('a');
          link.download = `coloreveryday_drawing_${new Date().toISOString().slice(0, 10)}.png`;
          link.href = combinedImageData;
          
          // Forzar descarga
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // También intentar guardar con el sistema anterior como backup
          if (canvasData && saveColoredDrawing) {
            saveColoredDrawing(canvasData);
          }
          
          return { success: true, message: '¡Dibujo guardado y descargado exitosamente!' };
        } else {
          throw new Error('No se pudo generar la imagen combinada');
        }
      } catch (error) {
        console.error('Error al guardar dibujo:', error);
        return { success: false, message: 'Error al guardar el dibujo' };
      }
    } else if (canvasData && saveColoredDrawing) {
      // Fallback al método anterior si no está disponible la nueva función
      const success = saveColoredDrawing(canvasData);
      return success 
        ? { success: true, message: '¡Dibujo guardado exitosamente!' }
        : { success: false, message: 'Error al guardar el dibujo' };
    }
    return { success: false, message: 'No hay datos del canvas para guardar' };
  }, [canvasRef, canvasData, saveColoredDrawing]);

  return {
    canvasData,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    handleClearCanvas,
    handleCanvasChangeWithUndoUpdate,
    handleSaveDrawing,
    updateUndoRedoState
  };
};