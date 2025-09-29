import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import '../styles/DrawingCanvasSimple.css';

const DrawingCanvasSimple = forwardRef(({ 
  brushSize = 5, 
  brushColor = '#000000', 
  tool = 'brush',
  backgroundImage = null,
  onCanvasChange,
  onColorPicked,
  onCanvasReady // Nuevo callback cuando el canvas esté listo
}, ref) => {
  const containerRef = useRef(null);
  const backgroundCanvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const compositeCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasSize] = useState({ width: 800, height: 600 });
  const updateRequestRef = useRef(null);
  const lastDataUrlRef = useRef(null);
  
  // Estados para zoom y pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Estados para undo/redo
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const isPerformingUndoRedo = useRef(false);
  const hasDrawnInCurrentStroke = useRef(false);
  const isSavingState = useRef(false); // Guard para evitar doble guardado

  // Función simple para llamar onCanvasChange cuando sea necesario
  const notifyCanvasChange = useCallback(() => {
    if (onCanvasChange && compositeCanvasRef.current) {
      const newDataUrl = compositeCanvasRef.current.toDataURL();
      if (newDataUrl !== lastDataUrlRef.current) {
        lastDataUrlRef.current = newDataUrl;
        console.log('📸 CANVAS CAMBIÓ - notificando cambio');
        onCanvasChange(newDataUrl);
      }
    }
  }, [onCanvasChange]);

  // Función para manejar el zoom
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

  // Función para transformar coordenadas del mouse a coordenadas del canvas
  const transformMouseCoords = useCallback((clientX, clientY) => {
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    
    // Transformar de coordenadas de viewport a coordenadas del canvas
    const canvasX = (mouseX - pan.x) / zoom;
    const canvasY = (mouseY - pan.y) / zoom;
    
    return { x: canvasX, y: canvasY };
  }, [zoom, pan]);

  // Función throttled para actualizar el canvas - SEPARAR visual de onCanvasChange
  const requestCompositeUpdate = useCallback(() => {
    if (updateRequestRef.current) {
      return; // Ya hay una actualización pendiente
    }
    
    updateRequestRef.current = requestAnimationFrame(() => {
      // SIEMPRE actualizar el canvas visual
      if (compositeCanvasRef.current && backgroundCanvasRef.current && drawingCanvasRef.current) {
        const compositeCtx = compositeCanvasRef.current.getContext('2d');
        compositeCtx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        
        // Primero poner fondo blanco
        compositeCtx.fillStyle = 'white';
        compositeCtx.fillRect(0, 0, canvasSize.width, canvasSize.height);
        
        // Segundo: dibujar la capa del usuario (colores debajo)
        compositeCtx.drawImage(drawingCanvasRef.current, 0, 0);
        
        // Tercero: dibujar las líneas negras (ENCIMA e intocables)
        compositeCtx.drawImage(backgroundCanvasRef.current, 0, 0);
      }
      
      updateRequestRef.current = null;
    });
  }, [canvasSize]);

  // Función para actualizar inmediatamente (para cuando termine de dibujar)
  const updateImmediately = useCallback(() => {
    if (updateRequestRef.current) {
      cancelAnimationFrame(updateRequestRef.current);
      updateRequestRef.current = null;
    }
    
    // Actualizar canvas compuesto inmediatamente
    if (compositeCanvasRef.current && backgroundCanvasRef.current && drawingCanvasRef.current) {
      const compositeCtx = compositeCanvasRef.current.getContext('2d');
      compositeCtx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      
      // Primero poner fondo blanco
      compositeCtx.fillStyle = 'white';
      compositeCtx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      
      // Segundo: dibujar la capa del usuario (colores debajo)
      compositeCtx.drawImage(drawingCanvasRef.current, 0, 0);
      
      // Tercero: dibujar las líneas negras (ENCIMA e intocables)
      compositeCtx.drawImage(backgroundCanvasRef.current, 0, 0);
      
      // Notificar cambio
      notifyCanvasChange();
    }
  }, [canvasSize, notifyCanvasChange]);

  // Función para obtener el color en una posición específica
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

  // Funciones de dibujo básicas (deben definirse antes de los manejadores)
  const startDrawing = useCallback((e) => {
    if (!drawingCanvasRef.current || !containerRef.current) return;
    
    const coords = transformMouseCoords(e.clientX, e.clientY);
    
    // Si es herramienta cuenta gotas, seleccionar color y cambiar a pincel
    if (tool === 'eyedropper') {
      console.log('🎨 CUENTA GOTAS: seleccionando color en', coords);
      const pickedColor = getColorAtPosition(coords.x, coords.y);
      if (pickedColor && onColorPicked) {
        onColorPicked(pickedColor);
      }
      return;
    }
    
    console.log('🖊️ INICIANDO DIBUJO:', { tool, coords });
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
      console.log('✏️ PRIMER TRAZO detectado - marcando hasDrawnInCurrentStroke = true');
      hasDrawnInCurrentStroke.current = true;
    }
    
    // Actualizar el composite canvas en tiempo real para ver el dibujo
    requestCompositeUpdate();
  }, [isDrawing, transformMouseCoords, tool, brushColor, brushSize, requestCompositeUpdate]);

  // Funciones de undo/redo - definir saveCanvasState primero
  const saveCanvasState = useCallback(() => {
    if (!drawingCanvasRef.current) return;
    
    // Guard para evitar doble ejecución
    if (isSavingState.current) {
      console.log('⚠️ EVITANDO doble guardado - ya se está guardando');
      return;
    }
    
    isSavingState.current = true;
    
    const imageData = drawingCanvasRef.current.getContext('2d').getImageData(0, 0, canvasSize.width, canvasSize.height);
    
    setUndoStack(prevStack => {
      const newStack = [...prevStack, imageData];
      const limitedStack = newStack.slice(-20); // Mantener solo los últimos 20 estados
      
      // Debug: Log cuando se guarda un estado
      console.log('🔸 GUARDANDO ESTADO para UNDO/REDO:');
      console.log('  - Stack size antes:', prevStack.length);
      console.log('  - Stack size después:', limitedStack.length);
      console.log('  - hasDrawnInCurrentStroke:', hasDrawnInCurrentStroke.current);
      console.log('  - isPerformingUndoRedo:', isPerformingUndoRedo.current);
      console.log('  - tool actual:', tool);
      
      return limitedStack;
    });
    
    // Limpiar el redo stack cuando se hace una nueva acción
    setRedoStack([]);
    
    // Reset del guard después de un pequeño delay
    setTimeout(() => {
      isSavingState.current = false;
    }, 50);
  }, [canvasSize, tool]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    
    console.log('🛑 PARANDO DIBUJO:');
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
    
    // Guardar estado para undo/redo solo si realmente se dibujó algo
    if (!isPerformingUndoRedo.current && hasDrawnInCurrentStroke.current) {
      console.log('💾 GUARDANDO estado porque se dibujó algo');
      saveCanvasState();
    } else {
      console.log('❌ NO guardando estado:', {
        isPerformingUndoRedo: isPerformingUndoRedo.current,
        hasDrawnInCurrentStroke: hasDrawnInCurrentStroke.current
      });
    }
  }, [isDrawing, updateImmediately, saveCanvasState, tool]);

  const undo = useCallback(() => {
    if (undoStack.length <= 1) {
      console.log('❌ UNDO: No hay estados suficientes para deshacer (necesario al menos 2)');
      return;
    }
    
    // Guard para evitar doble ejecución
    if (isPerformingUndoRedo.current) {
      console.log('⚠️ EVITANDO doble UNDO - ya se está ejecutando');
      return;
    }
    
    console.log('↶ EJECUTANDO UNDO:');
    console.log('  - Estados disponibles:', undoStack.length);
    console.log('  - Redo stack antes:', redoStack.length);
    
    isPerformingUndoRedo.current = true;
    
    // El estado actual es el último del stack, necesitamos el anterior
    const currentState = undoStack[undoStack.length - 1]; // Estado actual
    const previousState = undoStack[undoStack.length - 2]; // Estado anterior al que queremos volver
    
    // Mover el estado actual al redo stack
    setRedoStack(prevStack => {
      const newStack = [...prevStack, currentState];
      console.log('  - Redo stack después:', newStack.length);
      return newStack;
    });
    
    // Remover el estado actual del undo stack
    setUndoStack(prevStack => {
      const newStack = prevStack.slice(0, -1);
      console.log('  - Undo stack después:', newStack.length);
      return newStack;
    });
    
    // Aplicar el estado anterior
    drawingCanvasRef.current.getContext('2d').putImageData(previousState, 0, 0);
    updateImmediately();
    
    setTimeout(() => {
      isPerformingUndoRedo.current = false;
      console.log('  - UNDO completado ✅');
    }, 150);
  }, [undoStack, redoStack, updateImmediately]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) {
      console.log('❌ REDO: No hay estados para rehacer');
      return;
    }
    
    // Guard para evitar doble ejecución
    if (isPerformingUndoRedo.current) {
      console.log('⚠️ EVITANDO doble REDO - ya se está ejecutando');
      return;
    }
    
    console.log('↷ EJECUTANDO REDO:');
    console.log('  - Estados disponibles:', redoStack.length);
    console.log('  - Undo stack antes:', undoStack.length);
    
    isPerformingUndoRedo.current = true;
    
    // Guardar el estado actual en el undo stack y aplicar el estado del redo
    const currentState = drawingCanvasRef.current.getContext('2d').getImageData(0, 0, canvasSize.width, canvasSize.height);
    const nextState = redoStack[redoStack.length - 1];
    
    setUndoStack(prevStack => {
      const newStack = [...prevStack, currentState];
      console.log('  - Undo stack después:', newStack.length);
      return newStack;
    });
    
    setRedoStack(prevStack => {
      const newStack = prevStack.slice(0, -1);
      console.log('  - Redo stack después:', newStack.length);
      return newStack;
    });
    
    drawingCanvasRef.current.getContext('2d').putImageData(nextState, 0, 0);
    updateImmediately();
    
    setTimeout(() => {
      isPerformingUndoRedo.current = false;
      console.log('  - REDO completado ✅');
    }, 150);
  }, [redoStack, undoStack, canvasSize, updateImmediately]);

  // Guardar estado inicial cuando se inicializa el canvas - Solo una vez
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (drawingCanvasRef.current && !hasInitialized.current && !isSavingState.current) {
      console.log('🏁 INICIALIZANDO: Guardando estado inicial del canvas');
      hasInitialized.current = true;
      setTimeout(() => {
        saveCanvasState();
        // Notificar que el canvas está listo
        if (onCanvasReady) {
          console.log('🎯 CANVAS LISTO: Notificando al padre');
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

  // Funciones para el pan con botón secundario
  const handleMouseDown = useCallback((e) => {
    if (e.button === 2) { // Botón secundario (derecho)
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Botón primario - dibujar
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
    if (e.button === 2) { // Botón secundario
      setIsPanning(false);
      return;
    }
    
    // Botón primario
    if (e.button === 0) {
      stopDrawing();
    }
  }, [stopDrawing]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault(); // Prevenir el menú contextual
  }, []);

  // Inicializar canvas
  useEffect(() => {
    if (backgroundCanvasRef.current && drawingCanvasRef.current && compositeCanvasRef.current) {
      // Configurar tamaños y optimización para lecturas frecuentes
      [backgroundCanvasRef.current, drawingCanvasRef.current, compositeCanvasRef.current].forEach(canvas => {
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
        
        // Optimizar para lecturas frecuentes de getImageData
        canvas.getContext('2d', { willReadFrequently: true });
      });

      // El canvas de fondo será transparente inicialmente
      // Se llenará cuando se cargue la imagen
      
      // El canvas de dibujo del usuario también comienza transparente
      // para que el usuario pueda pintar colores

      requestCompositeUpdate();
    }
  }, [canvasSize, requestCompositeUpdate]);

  // Cargar imagen de fondo
  useEffect(() => {
    if (backgroundImage && backgroundCanvasRef.current) {
      const bgCtx = backgroundCanvasRef.current.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Crear un canvas temporal para procesar la imagen
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        tempCanvas.width = canvasSize.width;
        tempCanvas.height = canvasSize.height;
        
        // Dibujar la imagen original en el canvas temporal
        tempCtx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);
        
        // Obtener los datos de la imagen
        const imageData = tempCtx.getImageData(0, 0, canvasSize.width, canvasSize.height);
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
            // Convertir colores oscuros a negro para las líneas
            data[i] = 0;     // R
            data[i + 1] = 0; // G
            data[i + 2] = 0; // B
            data[i + 3] = 255; // A (opaco)
          }
        }
        
        // Poner los datos procesados de vuelta en el canvas temporal
        tempCtx.putImageData(imageData, 0, 0);
        
        // Limpiar el canvas de fondo y poner fondo transparente
        bgCtx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        
        // Dibujar la imagen procesada (solo líneas negras con fondo transparente)
        bgCtx.drawImage(tempCanvas, 0, 0);
        requestCompositeUpdate();
      };
      
      img.onerror = (error) => {
        console.error('Error cargando imagen:', error);
      };
      
      img.crossOrigin = 'anonymous'; // Para evitar problemas de CORS
      img.src = backgroundImage;
    }
  }, [backgroundImage, canvasSize, requestCompositeUpdate]);

  const clearCanvas = useCallback(() => {
    if (!drawingCanvasRef.current) return;
    
    const ctx = drawingCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    updateImmediately();
    
    // Limpiar también los stacks de undo/redo y guardar el estado limpio
    setUndoStack([]);
    setRedoStack([]);
    // Guardar el estado del canvas limpio
    setTimeout(() => {
      saveCanvasState();
    }, 100);
  }, [canvasSize, updateImmediately, saveCanvasState]);

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

  // Función para cargar una nueva imagen de fondo dinámicamente
  const loadBackgroundImage = useCallback((newImageUrl) => {
    console.log('🖼️ Cargando nueva imagen de fondo:', newImageUrl);
    
    if (!backgroundCanvasRef.current) return;
    
    const bgCtx = backgroundCanvasRef.current.getContext('2d', { willReadFrequently: true });
    const img = new Image();
    
    img.onload = () => {
      // Limpiar el canvas de fondo
      bgCtx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      
      // Crear un canvas temporal para procesar la imagen
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      tempCanvas.width = canvasSize.width;
      tempCanvas.height = canvasSize.height;
      
      // Dibujar la imagen escalada al tamaño del canvas
      tempCtx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height);
      
      // Procesar la imagen para optimizar las líneas negras con transparencia
      const imageData = tempCtx.getImageData(0, 0, canvasSize.width, canvasSize.height);
      const data = imageData.data;
      
      // Procesar cada píxel para hacer transparentes los fondos blancos
      // pero mantener las líneas negras opacas
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Si el píxel es muy claro (fondo blanco/gris claro), hacerlo transparente
        const brightness = (r + g + b) / 3;
        if (brightness > 240) {
          data[i + 3] = 0; // Hacer transparente
        } else if (brightness < 100) {
          // Líneas oscuras: asegurar que sean completamente opacas y negras
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
      
      // Copiar al canvas de fondo con las líneas optimizadas
      bgCtx.drawImage(tempCanvas, 0, 0);
      
      // Actualizar la visualización compuesta
      requestCompositeUpdate();
      
      console.log('✅ Nueva imagen de fondo cargada');
    };
    
    img.onerror = (error) => {
      console.error('❌ Error cargando la nueva imagen de fondo');
      console.error('🔍 Detalles del error:', error);
      console.error('🔍 URL que falló:', newImageUrl);
    };
    
    // Solo aplicar CORS para URLs externas, no para imágenes estáticas del mismo dominio
    if (newImageUrl.startsWith('http') && !newImageUrl.includes(window.location.hostname)) {
      img.crossOrigin = 'anonymous';
    }
    
    img.src = newImageUrl;
  }, [canvasSize, requestCompositeUpdate]);

  // Exponer métodos al componente padre
  // Función para exportar imagen combinada con todas las capas
  const exportCombinedImage = useCallback(() => {
    if (!backgroundCanvasRef.current || !drawingCanvasRef.current) {
      console.warn('❌ Canvas no disponibles para exportar');
      return null;
    }

    // Crear un canvas temporal para combinar todas las capas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasSize.width;
    tempCanvas.height = canvasSize.height;
    const tempCtx = tempCanvas.getContext('2d');

    // ORDEN CORRECTO DE CAPAS:
    
    // Capa 1: Fondo blanco sólido
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Capa 2: Dibujo del usuario (colores DEBAJO de las líneas)
    if (drawingCanvasRef.current) {
      tempCtx.drawImage(drawingCanvasRef.current, 0, 0);
    }

    // Capa 3: Líneas negras ENCIMA (backgroundCanvas)
    if (backgroundCanvasRef.current) {
      tempCtx.drawImage(backgroundCanvasRef.current, 0, 0);
    }

    // Retornar como data URL PNG
    return tempCanvas.toDataURL('image/png', 1.0);
  }, [canvasSize]);

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

  // Manejar eventos táctiles
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    startDrawing(mouseEvent);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    draw(mouseEvent);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    stopDrawing();
  };

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
          width: canvasSize.width,
          height: canvasSize.height,
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
            width: canvasSize.width,
            height: canvasSize.height,
          }}
        >
          {/* Canvas de fondo - líneas del dibujo (invisible, solo para trabajo) */}
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