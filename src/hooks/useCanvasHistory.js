import { useState, useRef, useCallback } from 'react';
import Logger from '../utils/logger.js';

export const useCanvasHistory = (drawingCanvasRef, updateImmediately) => {
  // Estados para undo/redo
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const isPerformingUndoRedo = useRef(false);
  const hasDrawnInCurrentStroke = useRef(false);
  const isSavingState = useRef(false);

  // Función para guardar el estado del canvas
  const saveCanvasState = useCallback(() => {
    if (!drawingCanvasRef.current) return;
    
    // Guard para evitar doble ejecución
    if (isSavingState.current) {
      Logger.log('⚠️ EVITANDO doble guardado - ya se está guardando');
      return;
    }
    
    isSavingState.current = true;
    
    const imageData = drawingCanvasRef.current.getContext('2d').getImageData(0, 0, 1024, 1024);
    
    setUndoStack(prevStack => {
      const newStack = [...prevStack, imageData];
      const limitedStack = newStack.slice(-20); // Mantener solo los últimos 20 estados
      
      Logger.log('🔸 GUARDANDO ESTADO para UNDO/REDO:');
      Logger.log('  - Stack size antes:', prevStack.length);
      Logger.log('  - Stack size después:', limitedStack.length);
      
      return limitedStack;
    });
    
    // Limpiar el redo stack cuando se hace una nueva acción
    setRedoStack([]);
    
    // Reset del guard después de un pequeño delay
    setTimeout(() => {
      isSavingState.current = false;
    }, 50);
  }, [drawingCanvasRef]);

  // Función undo
  const undo = useCallback(() => {
    if (undoStack.length <= 1) {
      Logger.log('❌ UNDO: No hay estados suficientes para deshacer (necesario al menos 2)');
      return;
    }
    
    // Guard para evitar doble ejecución
    if (isPerformingUndoRedo.current) {
      Logger.log('⚠️ EVITANDO doble UNDO - ya se está ejecutando');
      return;
    }
    
    Logger.log('↶ EJECUTANDO UNDO:');
    Logger.log('  - Estados disponibles:', undoStack.length);
    Logger.log('  - Redo stack antes:', redoStack.length);
    
    isPerformingUndoRedo.current = true;
    
    // El estado actual es el último del stack, necesitamos el anterior
    const currentState = undoStack[undoStack.length - 1];
    const previousState = undoStack[undoStack.length - 2];
    
    // Mover el estado actual al redo stack
    setRedoStack(prevStack => {
      const newStack = [...prevStack, currentState];
      Logger.log('  - Redo stack después:', newStack.length);
      return newStack;
    });
    
    // Remover el estado actual del undo stack
    setUndoStack(prevStack => {
      const newStack = prevStack.slice(0, -1);
      Logger.log('  - Undo stack después:', newStack.length);
      return newStack;
    });
    
    // Aplicar el estado anterior
    drawingCanvasRef.current.getContext('2d').putImageData(previousState, 0, 0);
    updateImmediately();
    
    setTimeout(() => {
      isPerformingUndoRedo.current = false;
      Logger.log('  - UNDO completado ✅');
    }, 150);
  }, [undoStack, redoStack, updateImmediately, drawingCanvasRef]);

  // Función redo
  const redo = useCallback(() => {
    if (redoStack.length === 0) {
      Logger.log('❌ REDO: No hay estados para rehacer');
      return;
    }
    
    // Guard para evitar doble ejecución
    if (isPerformingUndoRedo.current) {
      Logger.log('⚠️ EVITANDO doble REDO - ya se está ejecutando');
      return;
    }
    
    Logger.log('↷ EJECUTANDO REDO:');
    Logger.log('  - Estados disponibles:', redoStack.length);
    Logger.log('  - Undo stack antes:', undoStack.length);
    
    isPerformingUndoRedo.current = true;
    
    // Guardar el estado actual en el undo stack y aplicar el estado del redo
    const currentState = drawingCanvasRef.current.getContext('2d').getImageData(0, 0, 1024, 1024);
    const nextState = redoStack[redoStack.length - 1];
    
    setUndoStack(prevStack => {
      const newStack = [...prevStack, currentState];
      Logger.log('  - Undo stack después:', newStack.length);
      return newStack;
    });
    
    setRedoStack(prevStack => {
      const newStack = prevStack.slice(0, -1);
      Logger.log('  - Redo stack después:', newStack.length);
      return newStack;
    });
    
    drawingCanvasRef.current.getContext('2d').putImageData(nextState, 0, 0);
    updateImmediately();
    
    setTimeout(() => {
      isPerformingUndoRedo.current = false;
      Logger.log('  - REDO completado ✅');
    }, 150);
  }, [redoStack, undoStack, updateImmediately, drawingCanvasRef]);

  return {
    undoStack,
    redoStack,
    setUndoStack,
    setRedoStack,
    isPerformingUndoRedo,
    hasDrawnInCurrentStroke,
    saveCanvasState,
    undo,
    redo,
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0
  };
};