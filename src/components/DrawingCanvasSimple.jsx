import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import '../styles/DrawingCanvasSimple.css';

// Constantes del canvas
const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 1024;

// Función para obtener zoom inicial basado únicamente en tamaño de pantalla
const getInitialZoomByScreenSize = () => {
  const screenWidth = window.innerWidth;
  
  // Móvil: pantallas pequeñas (hasta 768px)
  if (screenWidth <= 768) {
    return 0.33; // 33% en móvil
  }
  
  // Tablet: pantallas medianas (769px - 1024px)
  if (screenWidth <= 1024) {
    return 0.66; // 66% en tablet
  }
  
  // Desktop: pantallas grandes (más de 1024px)
  return 1.0; // 100% en desktop
};

const DrawingCanvasSimple = forwardRef(({ 
  brushSize = 5, 
  brushColor = '#000000', 
  tool = 'brush',
  backgroundImage = null,
  onCanvasChange,
  onColorPicked,
  onCanvasReady // Nuevo callback cuando el canvas estÃ© listo
}, ref) => {
  const containerRef = useRef(null);
  const backgroundCanvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const compositeCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const updateRequestRef = useRef(null);
  const lastDataUrlRef = useRef(null);
  const [touchStartDistance, setTouchStartDistance] = useState(0);
  const [initialZoom, setInitialZoom] = useState(1);
  const [initialPan, setInitialPan] = useState({ x: 0, y: 0 });
  const [zoomCenter, setZoomCenter] = useState({ x: 0, y: 0 });
  
  // Estados para zoom y pan - Zoom inicial basado en dispositivo
  const [zoom, setZoom] = useState(getInitialZoomByScreenSize());
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Estados para detección inteligente de gestos
  const touchStartTime = useRef(0);
  const touchStartPosition = useRef({ x: 0, y: 0 });
  const isGesturing = useRef(false);
  const drawingDelay = useRef(null);
  const hasMovedSignificantly = useRef(false);
  
  // Constantes para detección de gestos
  const DRAWING_DELAY_MS = 150; // Delay antes de empezar a dibujar
  const MIN_MOVEMENT_THRESHOLD = 10; // Píxeles mínimos para considerar movimiento significativo
  const GESTURE_TIMEOUT_MS = 100; // Tiempo máximo para detectar gesto multi-touch

  // Estados para undo/redo
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const isPerformingUndoRedo = useRef(false);
  const hasDrawnInCurrentStroke = useRef(false);
  const isSavingState = useRef(false); // Guard para evitar doble guardado

  // Detectar cambios de dispositivo y ajustar zoom inicial
  useEffect(() => {
    const currentZoom = getInitialZoomByScreenSize();
    console.log(`🔍 Zoom inicial configurado: ${(currentZoom * 100).toFixed(0)}% para dispositivo detectado`);
    
    const handleResize = () => {
      const newInitialZoom = getInitialZoomByScreenSize();
      // Solo cambiar si es significativamente diferente para evitar ajustes menores
      if (Math.abs(zoom - newInitialZoom) > 0.1) {
        console.log(`🔄 Cambio de zoom por redimensión: ${(newInitialZoom * 100).toFixed(0)}%`);
        setZoom(newInitialZoom);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [zoom]);



  // Función simple para llamar onCanvasChange cuando sea necesario
  const notifyCanvasChange = useCallback(() => {
    if (onCanvasChange && compositeCanvasRef.current) {
      const newDataUrl = compositeCanvasRef.current.toDataURL();
      if (newDataUrl !== lastDataUrlRef.current) {
        lastDataUrlRef.current = newDataUrl;
        console.log('ðŸ“¸ CANVAS CAMBIÃ“ - notificando cambio');
        onCanvasChange(newDataUrl);
      }
    }
  }, [onCanvasChange]);

  // FunciÃ³n para manejar el zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));
    
    // Ajustar pan para que el zoom se centre en el cursor
    const zoomRatio = newZoom / zoom;
    const newPan = {
      x: mouseX - (mouseX - pan.x) * zoomRatio,
      y: mouseY - (mouseY - pan.y) * zoomRatio
    };
    
    setZoom(newZoom);
    setPan(newPan);
  }, [zoom, pan]);

  // FunciÃ³n para transformar coordenadas del mouse a coordenadas del canvas
  const transformMouseCoords = useCallback((clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    
    // Transformar de coordenadas de viewport a coordenadas del canvas
    const canvasX = (mouseX - pan.x) / zoom;
    const canvasY = (mouseY - pan.y) / zoom;
    
    return { x: canvasX, y: canvasY };
  }, [zoom, pan]);

  // FunciÃ³n throttled para actualizar el canvas - SEPARAR visual de onCanvasChange
  const requestCompositeUpdate = useCallback(() => {
    if (updateRequestRef.current) {
      return; // Ya hay una actualizaciÃ³n pendiente
    }
    
    updateRequestRef.current = requestAnimationFrame(() => {
      // SIEMPRE actualizar el canvas visual
      if (compositeCanvasRef.current && backgroundCanvasRef.current && drawingCanvasRef.current) {
        const compositeCtx = compositeCanvasRef.current.getContext('2d');
        compositeCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Primero poner fondo blanco
        compositeCtx.fillStyle = 'white';
        compositeCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Segundo: dibujar la capa del usuario (colores debajo)
        compositeCtx.drawImage(drawingCanvasRef.current, 0, 0);
        
        // Tercero: dibujar las lÃ­neas negras (ENCIMA e intocables)
        compositeCtx.drawImage(backgroundCanvasRef.current, 0, 0);
      }
      
      updateRequestRef.current = null;
    });
  }, []);

  // FunciÃ³n para actualizar inmediatamente (para cuando termine de dibujar)
  const updateImmediately = useCallback(() => {
    if (updateRequestRef.current) {
      cancelAnimationFrame(updateRequestRef.current);
      updateRequestRef.current = null;
    }
    
    // Actualizar canvas compuesto inmediatamente
    if (compositeCanvasRef.current && backgroundCanvasRef.current && drawingCanvasRef.current) {
      const compositeCtx = compositeCanvasRef.current.getContext('2d');
      compositeCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Primero poner fondo blanco
      compositeCtx.fillStyle = 'white';
      compositeCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Segundo: dibujar la capa del usuario (colores debajo)
      compositeCtx.drawImage(drawingCanvasRef.current, 0, 0);
      
      // Tercero: dibujar las lÃ­neas negras (ENCIMA e intocables)
      compositeCtx.drawImage(backgroundCanvasRef.current, 0, 0);
      
      // Notificar cambio
      notifyCanvasChange();
    }
  }, [ notifyCanvasChange]);

  // FunciÃ³n para obtener el color en una posiciÃ³n especÃ­fica
  const getColorAtPosition = useCallback((x, y) => {
    if (!compositeCanvasRef.current) return null;
    
    try {
      const ctx = compositeCanvasRef.current.getContext('2d');
      const imageData = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
      const data = imageData.data;
      
      // Convertir RGB a hex
      const r = data[0];
      const g = data[1];
      const b = data[2];
      const alpha = data[3];
      
      // Si es transparente, devolver blanco
      if (alpha === 0) {
        return '#ffffff';
      }
      
      // Convertir a hexadecimal
      const hex = '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
      
      return hex;
    } catch (error) {
      console.error('Error obteniendo color:', error);
      return '#000000';
    }
  }, []);

  // Funciones de dibujo bÃ¡sicas (deben definirse antes de los manejadores)
  const startDrawing = useCallback((e) => {
    if (!drawingCanvasRef.current || !containerRef.current) return;
    
    const coords = transformMouseCoords(e.clientX, e.clientY);
    
    // Si es herramienta cuenta gotas, seleccionar color y cambiar a pincel
    if (tool === 'eyedropper') {
      console.log('ðŸŽ¨ CUENTA GOTAS: seleccionando color en', coords);
      const pickedColor = getColorAtPosition(coords.x, coords.y);
      if (pickedColor && onColorPicked) {
        onColorPicked(pickedColor);
      }
      return;
    }
    
    console.log('ðŸ–Šï¸ INICIANDO DIBUJO:', { tool, coords });
    setIsDrawing(true);
    hasDrawnInCurrentStroke.current = false; // Reset de la bandera
    const ctx = drawingCanvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  }, [transformMouseCoords, tool, onColorPicked, getColorAtPosition]);

  const draw = useCallback((e) => {
    if (!isDrawing || !drawingCanvasRef.current || !containerRef.current) return;
    
    const coords = transformMouseCoords(e.clientX, e.clientY);
    
    const ctx = drawingCanvasRef.current.getContext('2d');
    
    if (tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = 'round';
    }
    
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    
    // Marcar que se ha dibujado algo en este trazo
    if (!hasDrawnInCurrentStroke.current) {
      console.log('âœï¸ PRIMER TRAZO detectado - marcando hasDrawnInCurrentStroke = true');
      hasDrawnInCurrentStroke.current = true;
    }
    
    // Actualizar el composite canvas en tiempo real para ver el dibujo
    requestCompositeUpdate();
  }, [isDrawing, transformMouseCoords, tool, brushColor, brushSize, requestCompositeUpdate]);

  // Funciones de undo/redo - definir saveCanvasState primero
  const saveCanvasState = useCallback(() => {
    if (!drawingCanvasRef.current) return;
    
    // Guard para evitar doble ejecuciÃ³n
    if (isSavingState.current) {
      console.log('âš ï¸ EVITANDO doble guardado - ya se estÃ¡ guardando');
      return;
    }
    
    isSavingState.current = true;
    
    const imageData = drawingCanvasRef.current.getContext('2d').getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    setUndoStack(prevStack => {
      const newStack = [...prevStack, imageData];
      const limitedStack = newStack.slice(-20); // Mantener solo los Ãºltimos 20 estados
      
      // Debug: Log cuando se guarda un estado
      console.log('ðŸ”¸ GUARDANDO ESTADO para UNDO/REDO:');
      console.log('  - Stack size antes:', prevStack.length);
      console.log('  - Stack size despuÃ©s:', limitedStack.length);
      console.log('  - hasDrawnInCurrentStroke:', hasDrawnInCurrentStroke.current);
      console.log('  - isPerformingUndoRedo:', isPerformingUndoRedo.current);
      console.log('  - tool actual:', tool);
      
      return limitedStack;
    });
    
    // Limpiar el redo stack cuando se hace una nueva acciÃ³n
    setRedoStack([]);
    
    // Reset del guard despuÃ©s de un pequeÃ±o delay
    setTimeout(() => {
      isSavingState.current = false;
    }, 50);
  }, [ tool]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    
    console.log('ðŸ›‘ PARANDO DIBUJO:');
    console.log('  - hasDrawnInCurrentStroke:', hasDrawnInCurrentStroke.current);
    console.log('  - isPerformingUndoRedo:', isPerformingUndoRedo.current);
    console.log('  - tool:', tool);
    
    setIsDrawing(false);
    
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext('2d');
      ctx.beginPath();
    }
    
    // Actualizar inmediatamente al terminar de dibujar para asegurar el estado final
    updateImmediately();
    
    // Guardar estado para undo/redo solo si realmente se dibujÃ³ algo
    if (!isPerformingUndoRedo.current && hasDrawnInCurrentStroke.current) {
      console.log('ðŸ’¾ GUARDANDO estado porque se dibujÃ³ algo');
      saveCanvasState();
    } else {
      console.log('âŒ NO guardando estado:', {
        isPerformingUndoRedo: isPerformingUndoRedo.current,
        hasDrawnInCurrentStroke: hasDrawnInCurrentStroke.current
      });
    }
  }, [isDrawing, updateImmediately, saveCanvasState, tool]);

  const undo = useCallback(() => {
    if (undoStack.length <= 1) {
      console.log('âŒ UNDO: No hay estados suficientes para deshacer (necesario al menos 2)');
      return;
    }
    
    // Guard para evitar doble ejecuciÃ³n
    if (isPerformingUndoRedo.current) {
      console.log('âš ï¸ EVITANDO doble UNDO - ya se estÃ¡ ejecutando');
      return;
    }
    
    console.log('â†¶ EJECUTANDO UNDO:');
    console.log('  - Estados disponibles:', undoStack.length);
    console.log('  - Redo stack antes:', redoStack.length);
    
    isPerformingUndoRedo.current = true;
    
    // El estado actual es el Ãºltimo del stack, necesitamos el anterior
    const currentState = undoStack[undoStack.length - 1]; // Estado actual
    const previousState = undoStack[undoStack.length - 2]; // Estado anterior al que queremos volver
    
    // Mover el estado actual al redo stack
    setRedoStack(prevStack => {
      const newStack = [...prevStack, currentState];
      console.log('  - Redo stack despuÃ©s:', newStack.length);
      return newStack;
    });
    
    // Remover el estado actual del undo stack
    setUndoStack(prevStack => {
      const newStack = prevStack.slice(0, -1);
      console.log('  - Undo stack despuÃ©s:', newStack.length);
      return newStack;
    });
    
    // Aplicar el estado anterior
    drawingCanvasRef.current.getContext('2d').putImageData(previousState, 0, 0);
    updateImmediately();
    
    setTimeout(() => {
      isPerformingUndoRedo.current = false;
      console.log('  - UNDO completado âœ…');
    }, 150);
  }, [undoStack, redoStack, updateImmediately]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) {
      console.log('âŒ REDO: No hay estados para rehacer');
      return;
    }
    
    // Guard para evitar doble ejecuciÃ³n
    if (isPerformingUndoRedo.current) {
      console.log('âš ï¸ EVITANDO doble REDO - ya se estÃ¡ ejecutando');
      return;
    }
    
    console.log('â†· EJECUTANDO REDO:');
    console.log('  - Estados disponibles:', redoStack.length);
    console.log('  - Undo stack antes:', undoStack.length);
    
    isPerformingUndoRedo.current = true;
    
    // Guardar el estado actual en el undo stack y aplicar el estado del redo
    const currentState = drawingCanvasRef.current.getContext('2d').getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const nextState = redoStack[redoStack.length - 1];
    
    setUndoStack(prevStack => {
      const newStack = [...prevStack, currentState];
      console.log('  - Undo stack despuÃ©s:', newStack.length);
      return newStack;
    });
    
    setRedoStack(prevStack => {
      const newStack = prevStack.slice(0, -1);
      console.log('  - Redo stack despuÃ©s:', newStack.length);
      return newStack;
    });
    
    drawingCanvasRef.current.getContext('2d').putImageData(nextState, 0, 0);
    updateImmediately();
    
    setTimeout(() => {
      isPerformingUndoRedo.current = false;
      console.log('  - REDO completado âœ…');
    }, 150);
  }, [redoStack, undoStack, updateImmediately]);

  // Guardar estado inicial cuando se inicializa el canvas - Solo una vez
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (drawingCanvasRef.current && !hasInitialized.current && !isSavingState.current) {
      console.log('ðŸ INICIALIZANDO: Guardando estado inicial del canvas');
      hasInitialized.current = true;
      setTimeout(() => {
        saveCanvasState();
        // Notificar que el canvas estÃ¡ listo
        if (onCanvasReady) {
          console.log('ðŸŽ¯ CANVAS LISTO: Notificando al padre');
          onCanvasReady();
        }
      }, 100);
    }
  }, [saveCanvasState, onCanvasReady]);

  // Registrar evento wheel de manera no-pasiva para evitar el error de preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelEvent = (e) => {
      handleWheel(e);
    };

    container.addEventListener('wheel', handleWheelEvent, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheelEvent);
    };
  }, [handleWheel]);

  // Funciones para el pan con botÃ³n secundario
  const handleMouseDown = useCallback((e) => {
    if (e.button === 2) { // BotÃ³n secundario (derecho)
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // BotÃ³n primario - dibujar
    if (e.button === 0 && !isPanning) {
      startDrawing(e);
    }
  }, [isPanning, startDrawing]);

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      e.preventDefault();
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Dibujo normal
    if (!isPanning) {
      draw(e);
    }
  }, [isPanning, lastPanPoint, draw]);

  const handleMouseUp = useCallback((e) => {
    if (e.button === 2) { // BotÃ³n secundario
      setIsPanning(false);
      return;
    }
    
    // BotÃ³n primario
    if (e.button === 0) {
      stopDrawing();
    }
  }, [stopDrawing]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault(); // Prevenir el menÃº contextual
  }, []);

  // Funciones para manejar gestos tÃ¡ctiles
  const getTouchDistance = useCallback((touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getTouchCenter = useCallback((touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }, []);

  // Convertir coordenadas de pantalla a coordenadas del canvas
  const screenToCanvasCoordinates = useCallback((clientX, clientY) => {
    const canvas = compositeCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }, []);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    
    const touches = e.touches;
    const now = Date.now();
    
    // Limpiar delay anterior si existe
    if (drawingDelay.current) {
      clearTimeout(drawingDelay.current);
      drawingDelay.current = null;
    }
    
    if (touches.length === 1) {
      // Un dedo - POSIBLE dibujo (con delay)
      const touch = touches[0];
      
      // Guardar posición y tiempo inicial
      touchStartTime.current = now;
      touchStartPosition.current = {
        x: touch.clientX,
        y: touch.clientY
      };
      hasMovedSignificantly.current = false;
      isGesturing.current = false;
      
      // Delay antes de empezar a dibujar para detectar si es un gesto
      drawingDelay.current = setTimeout(() => {
        // Solo dibujar si no se ha detectado gesto y no se ha movido mucho
        if (!isGesturing.current && !isPanning) {
          const mouseEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            button: 0
          };
          startDrawing(mouseEvent);
        }
        drawingDelay.current = null;
      }, DRAWING_DELAY_MS);
      
    } else if (touches.length === 2) {
      // Dos dedos - zoom/pan (cancelar cualquier intento de dibujo)
      isGesturing.current = true;
      if (drawingDelay.current) {
        clearTimeout(drawingDelay.current);
        drawingDelay.current = null;
      }
      
      // Parar cualquier dibujo en curso
      if (isDrawing) {
        stopDrawing();
      }
      
      const distance = getTouchDistance(touches[0], touches[1]);
      const center = getTouchCenter(touches[0], touches[1]);
      const canvasCenter = screenToCanvasCoordinates(center.x, center.y);
      
      setTouchStartDistance(distance);
      setInitialZoom(zoom);
      setInitialPan(pan);
      setLastPanPoint(center);
      setZoomCenter(canvasCenter);
      setIsPanning(true);
    }
  }, [startDrawing, getTouchDistance, getTouchCenter, screenToCanvasCoordinates, zoom, pan, isDrawing, stopDrawing, isPanning]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    
    const touches = e.touches;
    
    if (touches.length === 1 && !isPanning) {
      const touch = touches[0];
      
      // Verificar si se ha movido significativamente desde el inicio
      if (touchStartPosition.current && !hasMovedSignificantly.current) {
        const deltaX = Math.abs(touch.clientX - touchStartPosition.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartPosition.current.y);
        const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (totalMovement > MIN_MOVEMENT_THRESHOLD) {
          hasMovedSignificantly.current = true;
          
          // Si el movimiento es muy rápido o grande, probablemente es pan/scroll
          const timeElapsed = Date.now() - touchStartTime.current;
          const velocity = totalMovement / Math.max(timeElapsed, 1);
          
          if (velocity > 2 || totalMovement > 50) {
            // Movimiento muy rápido o grande - cancelar dibujo
            isGesturing.current = true;
            if (drawingDelay.current) {
              clearTimeout(drawingDelay.current);
              drawingDelay.current = null;
            }
            if (isDrawing) {
              stopDrawing();
            }
            return;
          }
        }
      }
      
      // Solo dibujar si no estamos esperando delay y no es un gesto
      if (!drawingDelay.current && !isGesturing.current) {
        const mouseEvent = {
          clientX: touch.clientX,
          clientY: touch.clientY
        };
        draw(mouseEvent);
      }
    } else if (touches.length === 2) {
      // Dos dedos - zoom/pan
      const distance = getTouchDistance(touches[0], touches[1]);
      const center = getTouchCenter(touches[0], touches[1]);
      
      if (touchStartDistance > 0) {
        // Calcular zoom
        const zoomFactor = distance / touchStartDistance;
        const newZoom = Math.max(0.1, Math.min(5, initialZoom * zoomFactor));
        
        // Calcular el offset necesario para mantener el punto de zoom centrado
        const zoomDelta = newZoom - initialZoom;
        const offsetX = zoomCenter.x * zoomDelta;
        const offsetY = zoomCenter.y * zoomDelta;
        
        // Calcular pan con compensación del zoom centrado
        const deltaX = center.x - lastPanPoint.x;
        const deltaY = center.y - lastPanPoint.y;
        
        const newPan = {
          x: initialPan.x + deltaX - offsetX,
          y: initialPan.y + deltaY - offsetY
        };
        
        setZoom(newZoom);
        setPan(newPan);
      }
    }
  }, [draw, isPanning, getTouchDistance, getTouchCenter, touchStartDistance, initialZoom, initialPan, lastPanPoint, zoomCenter, isDrawing, stopDrawing]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    
    // Limpiar delay si existe
    if (drawingDelay.current) {
      clearTimeout(drawingDelay.current);
      drawingDelay.current = null;
    }
    
    if (e.touches.length === 0) {
      // No hay más dedos - resetear todo
      stopDrawing();
      setIsPanning(false);
      setTouchStartDistance(0);
      
      // Resetear estados de detección
      isGesturing.current = false;
      hasMovedSignificantly.current = false;
      touchStartTime.current = 0;
      touchStartPosition.current = { x: 0, y: 0 };
      
    } else if (e.touches.length === 1) {
      // Queda un dedo, pasar de zoom/pan a dibujo
      setIsPanning(false);
      setTouchStartDistance(0);
      
      // Resetear para permitir nuevo dibujo con el dedo restante
      isGesturing.current = false;
      const touch = e.touches[0];
      touchStartTime.current = Date.now();
      touchStartPosition.current = {
        x: touch.clientX,
        y: touch.clientY
      };
      hasMovedSignificantly.current = false;
    }
  }, [stopDrawing]);

  // Inicializar canvas
  useEffect(() => {
    if (backgroundCanvasRef.current && drawingCanvasRef.current && compositeCanvasRef.current) {
      // Configurar tamaÃ±os y optimizaciÃ³n para lecturas frecuentes
      [backgroundCanvasRef.current, drawingCanvasRef.current, compositeCanvasRef.current].forEach(canvas => {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        
        // Optimizar para lecturas frecuentes de getImageData
        canvas.getContext('2d', { willReadFrequently: true });
      });

      // El canvas de fondo serÃ¡ transparente inicialmente
      // Se llenarÃ¡ cuando se cargue la imagen
      
      // El canvas de dibujo del usuario tambiÃ©n comienza transparente
      // para que el usuario pueda pintar colores

      requestCompositeUpdate();
    }
  }, [ requestCompositeUpdate]);

  // Cargar imagen de fondo - TamaÃ±o fijo 1024x1024
  useEffect(() => {
    if (backgroundImage && backgroundCanvasRef.current) {
      const bgCtx = backgroundCanvasRef.current.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        console.log('ðŸ“ Imagen cargada, procesando para 1024x1024');
        
        // Crear un canvas temporal para procesar la imagen
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        tempCanvas.width = 1024;
        tempCanvas.height = 1024;
        
        // Dibujar la imagen redimensionada al tamaÃ±o fijo
        tempCtx.drawImage(img, 0, 0, 1024, 1024);
        
        // Obtener los datos de la imagen
        const imageData = tempCtx.getImageData(0, 0, 1024, 1024);
        const data = imageData.data;
        
        // Procesar cada pixel para hacer transparente el fondo blanco
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Si el pixel es muy claro (casi blanco), hacerlo transparente
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // Hacer transparente
          } else {
            // Convertir colores oscuros a negro para las lÃ­neas
            data[i] = 0;     // R
            data[i + 1] = 0; // G
            data[i + 2] = 0; // B
            data[i + 3] = 255; // A (opaco)
          }
        }
        
        // Poner los datos procesados de vuelta en el canvas temporal
        tempCtx.putImageData(imageData, 0, 0);
        
        // Limpiar el canvas de fondo y dibujar la imagen procesada
        bgCtx.clearRect(0, 0, 1024, 1024);
        bgCtx.drawImage(tempCanvas, 0, 0);
        
        // Actualizar el composite canvas
        requestCompositeUpdate();
      };
      
      img.onerror = (error) => {
        console.error('Error cargando imagen:', error);
      };
      
      img.crossOrigin = 'anonymous';
      img.src = backgroundImage;
    }
  }, [backgroundImage, requestCompositeUpdate]);

  const clearCanvas = useCallback(() => {
    if (!drawingCanvasRef.current) return;
    
    const ctx = drawingCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    updateImmediately();
    
    // Limpiar tambiÃ©n los stacks de undo/redo y guardar el estado limpio
    setUndoStack([]);
    setRedoStack([]);
    // Guardar el estado del canvas limpio
    setTimeout(() => {
      saveCanvasState();
    }, 100);
  }, [ updateImmediately, saveCanvasState]);

  const printCanvas = useCallback(() => {
    if (!compositeCanvasRef.current) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>ColorEveryday Drawing</title>
          <style>
            body { margin: 0; padding: 20px; text-align: center; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <h1>My ColorEveryday Creation</h1>
          <img src="${compositeCanvasRef.current.toDataURL()}" alt="My Drawing" />
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  }, []);

  // FunciÃ³n para cargar una nueva imagen de fondo dinÃ¡micamente - TamaÃ±o fijo 1024x1024
  const loadBackgroundImage = useCallback((newImageUrl) => {
    console.log('ðŸ–¼ï¸ Cargando nueva imagen de fondo:', newImageUrl);
    
    if (!backgroundCanvasRef.current) return;
    
    const bgCtx = backgroundCanvasRef.current.getContext('2d', { willReadFrequently: true });
    const img = new Image();
    
    img.onload = () => {
      console.log('ðŸ“ Nueva imagen cargada, procesando para 1024x1024');
      
      // Limpiar el canvas de fondo
      bgCtx.clearRect(0, 0, 1024, 1024);
      
      // Crear un canvas temporal para procesar la imagen
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      tempCanvas.width = 1024;
      tempCanvas.height = 1024;
      
      // Dibujar la imagen redimensionada al tamaÃ±o fijo
      tempCtx.drawImage(img, 0, 0, 1024, 1024);
      
      // Procesar la imagen para optimizar las lÃ­neas negras con transparencia
      const imageData = tempCtx.getImageData(0, 0, 1024, 1024);
      const data = imageData.data;
      
      // Procesar cada pÃ­xel para hacer transparentes los fondos blancos
      // pero mantener las lÃ­neas negras opacas
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Si el pÃ­xel es muy claro (fondo blanco/gris claro), hacerlo transparente
        const brightness = (r + g + b) / 3;
        if (brightness > 240) {
          data[i + 3] = 0; // Hacer transparente
        } else if (brightness < 100) {
          // LÃ­neas oscuras: asegurar que sean completamente opacas y negras
          data[i] = 0;     // R = 0
          data[i + 1] = 0; // G = 0 
          data[i + 2] = 0; // B = 0
          data[i + 3] = 255; // Alpha = 255 (opaco)
        } else {
          // Tonos medios: reducir opacidad gradualmente
          const alpha = Math.max(0, 255 - brightness);
          data[i + 3] = alpha;
        }
      }
      
      // Aplicar los cambios al canvas temporal
      tempCtx.putImageData(imageData, 0, 0);
      
      // Copiar al canvas de fondo con las lÃ­neas optimizadas
      bgCtx.drawImage(tempCanvas, 0, 0);
      
      // Actualizar la visualizaciÃ³n compuesta
      requestCompositeUpdate();
      
      console.log('âœ… Nueva imagen de fondo cargada');
    };
    
    img.onerror = (error) => {
      console.error('âŒ Error cargando la nueva imagen de fondo');
      console.error('ðŸ” Detalles del error:', error);
      console.error('ðŸ” URL que fallÃ³:', newImageUrl);
    };
    
    // Solo aplicar CORS para URLs externas, no para imÃ¡genes estÃ¡ticas del mismo dominio
    if (newImageUrl.startsWith('http') && !newImageUrl.includes(window.location.hostname)) {
      img.crossOrigin = 'anonymous';
    }
    
    img.src = newImageUrl;
  }, [requestCompositeUpdate]);

  // Exponer mÃ©todos al componente padre
  // FunciÃ³n para exportar imagen combinada con todas las capas
  const exportCombinedImage = useCallback(() => {
    if (!backgroundCanvasRef.current || !drawingCanvasRef.current) {
      console.warn('âŒ Canvas no disponibles para exportar');
      return null;
    }

    // Crear un canvas temporal para combinar todas las capas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = CANVAS_WIDTH;
    tempCanvas.height = CANVAS_HEIGHT;
    const tempCtx = tempCanvas.getContext('2d');

    // ORDEN CORRECTO DE CAPAS:
    
    // Capa 1: Fondo blanco sÃ³lido
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Capa 2: Dibujo del usuario (colores DEBAJO de las lÃ­neas)
    if (drawingCanvasRef.current) {
      tempCtx.drawImage(drawingCanvasRef.current, 0, 0);
    }

    // Capa 3: LÃ­neas negras ENCIMA (backgroundCanvas)
    if (backgroundCanvasRef.current) {
      tempCtx.drawImage(backgroundCanvasRef.current, 0, 0);
    }

    // Retornar como data URL PNG
    return tempCanvas.toDataURL('image/png', 1.0);
  }, []);

  useImperativeHandle(ref, () => ({
    clearCanvas,
    printCanvas,
    getCanvas: () => compositeCanvasRef.current,
    exportCombinedImage,
    undo,
    redo,
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
    loadBackgroundImage
  }), [clearCanvas, printCanvas, exportCombinedImage, undo, redo, undoStack, redoStack, loadBackgroundImage]);

  return (
    <div className="drawing-canvas-container">
      {/* Indicador de zoom */}
      <div className="zoom-indicator">
        Zoom: {Math.round(zoom * 100)}%
      </div>
      
      <div 
        ref={containerRef}
        className="canvas-layers-container"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          maxWidth: CANVAS_WIDTH,
          maxHeight: CANVAS_HEIGHT,
          border: '3px solid #333',
          borderRadius: '12px',
          cursor: isPanning ? 'grabbing' : (tool === 'brush' ? 'crosshair' : tool === 'eyedropper' ? 'copy' : 'pointer'),
          overflow: 'hidden',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            position: 'relative',
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
          }}
        >
          {/* Canvas de fondo - lÃ­neas del dibujo (invisible, solo para trabajo) */}
          <canvas
            ref={backgroundCanvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
              display: 'none'
            }}
          />
          
          {/* Canvas de dibujo del usuario - colores (invisible, solo para trabajo) */}
          <canvas
            ref={drawingCanvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              display: 'none'
            }}
          />
          
          {/* Canvas compuesto - el que se muestra al usuario */}
          <canvas
            ref={compositeCanvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1,
              pointerEvents: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
});

DrawingCanvasSimple.displayName = 'DrawingCanvasSimple';

export default DrawingCanvasSimple;
