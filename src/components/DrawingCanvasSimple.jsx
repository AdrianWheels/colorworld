import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import Logger from '../utils/logger.js'; // Sistema de logging: debug() en desarrollo, silencioso en producción
import '../styles/DrawingCanvasSimple.css';

// Constantes del canvas
const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 1024;

// Funci�n para obtener zoom inicial basado �nicamente en tama�o de pantalla
const getInitialZoomByScreenSize = () => {
  const screenWidth = window.innerWidth;
  
  // M�vil: pantallas peque�as (hasta 768px)
  if (screenWidth <= 480) {
    return 0.33; // 33% en m�vil
  }
  
  // Tablet: pantallas medianas (481px - 1024px) - coincide con CSS --tablet-min/max
  if (screenWidth <= 1024) {
    return 0.66; // 66% en tablet
  }
  
  // Desktop: pantallas grandes (m�s de 1024px)
  return 0.70; // 100% en desktop
};

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
  
  // Estados para el cursor tooltip visual
  const [cursorPosition, setCursorPosition] = useState({ x: -100, y: -100 });
  const [showCursor, setShowCursor] = useState(false);

  // Estados para detecci�n inteligente de gestos
  const touchStartTime = useRef(0);
  const touchStartPosition = useRef({ x: 0, y: 0 });
  const isGesturing = useRef(false);
  const drawingDelay = useRef(null);
  const hasMovedSignificantly = useRef(false);
  
  // Constantes para detecci�n de gestos
  const DRAWING_DELAY_MS = 150; // Delay antes de empezar a dibujar
  const MIN_MOVEMENT_THRESHOLD = 10; // P�xeles m�nimos para considerar movimiento significativo
  const GESTURE_TIMEOUT_MS = 100; // Tiempo m�ximo para detectar gesto multi-touch

  // Estados para undo/redo
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const isPerformingUndoRedo = useRef(false);
  const hasDrawnInCurrentStroke = useRef(false);
  const isSavingState = useRef(false); // Guard para evitar doble guardado
  
  // Flag para preservar zoom manual del usuario
  const hasUserInteractedWithZoom = useRef(false);

  // Detectar cambios de dispositivo y ajustar zoom inicial
  useEffect(() => {
    // Solo aplicar zoom automático en la primera carga
    if (!hasUserInteractedWithZoom.current) {
      const currentZoom = getInitialZoomByScreenSize();
      Logger.log(`🔍 Zoom inicial configurado: ${(currentZoom * 100).toFixed(0)}% para dispositivo detectado`);
      setZoom(currentZoom);
    }
    
    const handleResize = () => {
      // Solo ajustar zoom automático si el usuario NO ha interactuado manualmente
      if (!hasUserInteractedWithZoom.current) {
        const newInitialZoom = getInitialZoomByScreenSize();
        // Solo cambiar si es significativamente diferente para evitar ajustes menores
        if (Math.abs(zoom - newInitialZoom) > 0.1) {
          Logger.log(`🔍 Cambio de zoom por redimensión: ${(newInitialZoom * 100).toFixed(0)}%`);
          setZoom(newInitialZoom);
        }
      } else {
        // Si el usuario ya interactuó, solo verificar límites mínimos/máximos
        setZoom(currentZoom => Math.max(0.1, Math.min(5, currentZoom)));
        Logger.log(`🔍 Zoom preservado del usuario: ${(zoom * 100).toFixed(0)}%`);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [zoom]);



  // Funci�n simple para llamar onCanvasChange cuando sea necesario
  const notifyCanvasChange = useCallback(() => {
    if (onCanvasChange && compositeCanvasRef.current) {
      const newDataUrl = compositeCanvasRef.current.toDataURL();
      if (newDataUrl !== lastDataUrlRef.current) {
        lastDataUrlRef.current = newDataUrl;
        Logger.log('📸 CANVAS CAMBIÓ - notificando cambio');
        onCanvasChange(newDataUrl);
      }
    }
  }, [onCanvasChange]);

  // Función para manejar el zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    // Marcar que el usuario ha interactuado manualmente con el zoom
    hasUserInteractedWithZoom.current = true;
    
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
    
    Logger.log(`🔍 Zoom manual (wheel): ${(newZoom * 100).toFixed(0)}%`);
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
        compositeCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Primero poner fondo blanco
        compositeCtx.fillStyle = 'white';
        compositeCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Segundo: dibujar la capa del usuario (colores debajo)
        compositeCtx.drawImage(drawingCanvasRef.current, 0, 0);
        
        // Tercero: dibujar las líneas negras (ENCIMA e intocables)
        compositeCtx.drawImage(backgroundCanvasRef.current, 0, 0);
      }
      
      updateRequestRef.current = null;
    });
  }, []);

  // Función para actualizar inmediatamente (para cuando termine de dibujar)
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
      
      // Tercero: dibujar las líneas negras (ENCIMA e intocables)
      compositeCtx.drawImage(backgroundCanvasRef.current, 0, 0);
      
      // Notificar cambio
      notifyCanvasChange();
    }
  }, [ notifyCanvasChange]);

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
      Logger.error('Error obteniendo color:', error);
      return '#000000';
    }
  }, []);

  // Función mejorada para comparar colores con tolerancia adaptiva
  const colorsMatch = useCallback((color1, color2, tolerance = 25) => {
    if (!color1 || !color2) return false;
    
    // Calcular diferencia euclidiana en espacio RGB
    const rDiff = color1.r - color2.r;
    const gDiff = color1.g - color2.g;
    const bDiff = color1.b - color2.b;
    const aDiff = color1.a - color2.a;
    
    const distance = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff + aDiff * aDiff);
    
    return distance <= tolerance;
  }, []);

  // TEMPORALMENTE DESHABILITADO: Función para limpiar píxeles aislados después del flood fill
  // eslint-disable-next-line no-unused-vars
  const cleanIsolatedPixels = useCallback((imageData, fillColor) => {
    const data = imageData.data;
    const width = CANVAS_WIDTH;
    const height = CANVAS_HEIGHT;
    let cleaned = 0;
    
    // Convertir color de llenado a RGBA
    const hex = fillColor.replace('#', '');
    const targetRGBA = {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16),
      a: 255
    };
    
    // Crear una copia para trabajar
    const newData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const index = (y * width + x) * 4;
        
        // Verificar si el pixel actual es blanco/transparente
        const currentPixel = {
          r: data[index],
          g: data[index + 1],
          b: data[index + 2],
          a: data[index + 3]
        };
        
        // Si es blanco o muy claro, verificar sus vecinos
        const isLightPixel = (currentPixel.r > 240 && currentPixel.g > 240 && currentPixel.b > 240) || currentPixel.a < 50;
        
        if (isLightPixel) {
          // Verificar los 8 píxeles vecinos
          let filledNeighbors = 0;
          const neighbors = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
          ];
          
          for (const [dx, dy] of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
            const nIndex = (ny * width + nx) * 4;
            
            const neighborPixel = {
              r: data[nIndex],
              g: data[nIndex + 1],
              b: data[nIndex + 2],
              a: data[nIndex + 3]
            };
            
            // Si el vecino tiene el color de llenado, contarlo
            if (colorsMatch(neighborPixel, targetRGBA, 30)) {
              filledNeighbors++;
            }
          }
          
          // Ser más agresivo: llenar si tiene 3+ vecinos llenos (en lugar de 5+)
          // También verificar si NO hay líneas negras cerca
          let blackNeighbors = 0;
          for (const [dx, dy] of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
            const nIndex = (ny * width + nx) * 4;
            
            const neighborPixel = {
              r: data[nIndex],
              g: data[nIndex + 1],
              b: data[nIndex + 2],
              a: data[nIndex + 3]
            };
            
            // Contar vecinos negros
            if (neighborPixel.r < 80 && neighborPixel.g < 80 && neighborPixel.b < 80 && neighborPixel.a > 200) {
              blackNeighbors++;
            }
          }
          
          // Llenar si tiene suficientes vecinos llenos Y no está rodeado de líneas negras
          if (filledNeighbors >= 3 && blackNeighbors < 6) {
            newData[index] = targetRGBA.r;
            newData[index + 1] = targetRGBA.g;
            newData[index + 2] = targetRGBA.b;
            newData[index + 3] = targetRGBA.a;
            cleaned++;
          }
        }
      }
    }
    
    // Aplicar los cambios
    for (let i = 0; i < data.length; i++) {
      data[i] = newData[i];
    }
    
    return cleaned;
  }, [colorsMatch]);

  // Algoritmo Flood Fill — stack tipado (Int32Array) + llenado directo sin acumulador
  const floodFill = useCallback((startX, startY, fillColor, options = {}) => {
    const {
      connectivity = 4, // 4 or 8 neighbor connectivity
      tolerance = 0,    // Color tolerance (0-255)
      enableLogs = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    } = options;

    if (!drawingCanvasRef.current || !compositeCanvasRef.current) {
      if (enableLogs) Logger.error('❌ Canvas no disponibles para flood fill');
      return false;
    }

    const x = Math.floor(startX);
    const y = Math.floor(startY);

    if (x < 0 || y < 0 || x >= CANVAS_WIDTH || y >= CANVAS_HEIGHT) {
      if (enableLogs) Logger.warn('❌ Flood fill: coordenadas fuera de límites');
      return false;
    }

    const t0 = enableLogs ? performance.now() : 0;

    const backgroundCtx = backgroundCanvasRef.current.getContext('2d');
    const drawingCtx = drawingCanvasRef.current.getContext('2d');
    const compositeCtx = compositeCanvasRef.current.getContext('2d');

    const backgroundImageData = backgroundCtx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const drawingImageData = drawingCtx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const compositeImageData = compositeCtx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const bgData = backgroundImageData.data;
    const drData = drawingImageData.data; // se modifica directamente (getImageData devuelve copia)
    const cpData = compositeImageData.data;

    // Parsear fillColor hex → componentes
    const hex = fillColor.replace('#', '');
    const fillR = parseInt(hex.substr(0, 2), 16);
    const fillG = parseInt(hex.substr(2, 2), 16);
    const fillB = parseInt(hex.substr(4, 2), 16);
    const fillA = 255;

    // Validaciones sobre el píxel inicial (composite)
    const startDataIdx = (y * CANVAS_WIDTH + x) * 4;
    const cpR = cpData[startDataIdx], cpG = cpData[startDataIdx + 1],
          cpB = cpData[startDataIdx + 2], cpA = cpData[startDataIdx + 3];

    if (cpR < 80 && cpG < 80 && cpB < 80 && cpA > 200) {
      if (enableLogs) Logger.info('🚫 Flood fill: no se puede llenar sobre líneas negras');
      return false;
    }

    // Verificar que el punto inicial no es línea negra en background
    if (bgData[startDataIdx] < 50 && bgData[startDataIdx + 1] < 50 &&
        bgData[startDataIdx + 2] < 50 && bgData[startDataIdx + 3] > 200) {
      if (enableLogs) Logger.debug('❌ Punto inicial no válido: es línea negra');
      return false;
    }

    // Verificar que fill color ≠ target color
    if (Math.abs(cpR - fillR) <= tolerance && Math.abs(cpG - fillG) <= tolerance &&
        Math.abs(cpB - fillB) <= tolerance) {
      if (enableLogs) Logger.info('🎨 Flood fill: color objetivo igual al de llenado, no hay cambios');
      return false;
    }

    // Determinar modo: reemplazar color existente o llenar área vacía
    const drStartA = drData[startDataIdx + 3];
    const drStartR = drData[startDataIdx], drStartG = drData[startDataIdx + 1], drStartB = drData[startDataIdx + 2];
    const replaceMode = drStartA > 10 && !(drStartR > 240 && drStartG > 240 && drStartB > 240);

    // Color objetivo en drawing layer (para replace mode)
    const targetDrR = replaceMode ? drStartR : 0;
    const targetDrG = replaceMode ? drStartG : 0;
    const targetDrB = replaceMode ? drStartB : 0;
    const targetDrA = replaceMode ? drStartA : 0;

    // Stack tipado: almacena índices de píxel (Int32Array evita millones de objetos {x,y})
    const TOTAL_PIXELS = CANVAS_WIDTH * CANVAS_HEIGHT;
    const stack = new Int32Array(TOTAL_PIXELS);
    const visited = new Uint8Array(TOTAL_PIXELS);
    let stackTop = 0;

    const startPixel = y * CANVAS_WIDTH + x;
    stack[stackTop++] = startPixel;
    visited[startPixel] = 1;

    let pixelsChanged = 0;

    while (stackTop > 0) {
      const pixelIdx = stack[--stackTop];
      const px = pixelIdx % CANVAS_WIDTH;
      const py = (pixelIdx / CANVAS_WIDTH) | 0;
      const dataIdx = pixelIdx * 4;

      // Saltar líneas negras del background
      if (bgData[dataIdx] < 50 && bgData[dataIdx + 1] < 50 &&
          bgData[dataIdx + 2] < 50 && bgData[dataIdx + 3] > 200) {
        continue;
      }

      // Verificar si el píxel pertenece al área a llenar
      let shouldFill = false;
      const drA = drData[dataIdx + 3];
      const drR = drData[dataIdx], drG = drData[dataIdx + 1], drB = drData[dataIdx + 2];

      if (replaceMode) {
        if (tolerance <= 5) {
          shouldFill = Math.abs(drR - targetDrR) <= tolerance &&
                       Math.abs(drG - targetDrG) <= tolerance &&
                       Math.abs(drB - targetDrB) <= tolerance &&
                       Math.abs(drA - targetDrA) <= tolerance;
        } else {
          const dR = drR - targetDrR, dG = drG - targetDrG,
                dB = drB - targetDrB, dA = drA - targetDrA;
          shouldFill = Math.sqrt(dR*dR + dG*dG + dB*dB + dA*dA) <= tolerance * 1.732;
        }
      } else {
        // Área vacía: incluir solo si no está pintado (alpha bajo o casi blanco)
        shouldFill = !(drA > 10 && !(drR > 240 && drG > 240 && drB > 240));
      }

      if (!shouldFill) continue;

      // Llenar directamente en drData (evita array acumulador + segundo bucle)
      drData[dataIdx]     = fillR;
      drData[dataIdx + 1] = fillG;
      drData[dataIdx + 2] = fillB;
      drData[dataIdx + 3] = fillA;
      pixelsChanged++;

      // Empujar vecinos al stack (inline, sin crear arrays ni objetos)
      let ni;
      if (px + 1 < CANVAS_WIDTH) {
        ni = pixelIdx + 1;
        if (!visited[ni]) { visited[ni] = 1; stack[stackTop++] = ni; }
      }
      if (px > 0) {
        ni = pixelIdx - 1;
        if (!visited[ni]) { visited[ni] = 1; stack[stackTop++] = ni; }
      }
      if (py + 1 < CANVAS_HEIGHT) {
        ni = pixelIdx + CANVAS_WIDTH;
        if (!visited[ni]) { visited[ni] = 1; stack[stackTop++] = ni; }
      }
      if (py > 0) {
        ni = pixelIdx - CANVAS_WIDTH;
        if (!visited[ni]) { visited[ni] = 1; stack[stackTop++] = ni; }
      }
      if (connectivity === 8) {
        if (px + 1 < CANVAS_WIDTH && py + 1 < CANVAS_HEIGHT) {
          ni = pixelIdx + CANVAS_WIDTH + 1;
          if (!visited[ni]) { visited[ni] = 1; stack[stackTop++] = ni; }
        }
        if (px > 0 && py > 0) {
          ni = pixelIdx - CANVAS_WIDTH - 1;
          if (!visited[ni]) { visited[ni] = 1; stack[stackTop++] = ni; }
        }
        if (px + 1 < CANVAS_WIDTH && py > 0) {
          ni = pixelIdx - CANVAS_WIDTH + 1;
          if (!visited[ni]) { visited[ni] = 1; stack[stackTop++] = ni; }
        }
        if (px > 0 && py + 1 < CANVAS_HEIGHT) {
          ni = pixelIdx + CANVAS_WIDTH - 1;
          if (!visited[ni]) { visited[ni] = 1; stack[stackTop++] = ni; }
        }
      }
    }

    if (pixelsChanged === 0) return false;

    // Aplicar cambios al canvas (un solo putImageData)
    drawingCtx.putImageData(drawingImageData, 0, 0);

    if (enableLogs) {
      const t1 = performance.now();
      Logger.log(`✅ Flood fill: ${pixelsChanged} píxeles en ${(t1 - t0).toFixed(1)}ms [modo: ${replaceMode ? 'reemplazar' : 'vacío'}, conectividad: ${connectivity}]`);
    }

    updateImmediately();
    return true;
  }, [updateImmediately]);

  // Funciones de undo/redo - definir saveCanvasState primero
  const saveCanvasState = useCallback(() => {
    if (!drawingCanvasRef.current) return;
    
    // Guard para evitar doble ejecución
    if (isSavingState.current) {
      Logger.log('⚠️ EVITANDO doble guardado - ya se está guardando');
      return;
    }
    
    isSavingState.current = true;
    
    const imageData = drawingCanvasRef.current.getContext('2d').getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    setUndoStack(prevStack => {
      const newStack = [...prevStack, imageData];
      const limitedStack = newStack.slice(-20); // Mantener solo los últimos 20 estados
      
      // Debug: Log cuando se guarda un estado
      Logger.log('🔸 GUARDANDO ESTADO para UNDO/REDO:');
      Logger.log('  - Stack size antes:', prevStack.length);
      Logger.log('  - Stack size después:', limitedStack.length);
      Logger.log('  - hasDrawnInCurrentStroke:', hasDrawnInCurrentStroke.current);
      Logger.log('  - isPerformingUndoRedo:', isPerformingUndoRedo.current);
      Logger.log('  - tool actual:', tool);
      
      return limitedStack;
    });
    
    // Limpiar el redo stack cuando se hace una nueva acción
    setRedoStack([]);
    
    // Reset del guard después de un pequeño delay
    setTimeout(() => {
      isSavingState.current = false;
    }, 50);
  }, [ tool]);

  // Funciones de dibujo básicas (definir después de saveCanvasState)
  const startDrawing = useCallback((e) => {
    if (!drawingCanvasRef.current || !containerRef.current) return;
    
    const coords = transformMouseCoords(e.clientX, e.clientY);
    
    // Si es herramienta cuenta gotas, seleccionar color y cambiar a pincel
    if (tool === 'eyedropper') {
      Logger.log('🎨 CUENTA GOTAS: seleccionando color en', coords);
      const pickedColor = getColorAtPosition(coords.x, coords.y);
      if (pickedColor && onColorPicked) {
        onColorPicked(pickedColor);
      }
      return;
    }
    
    // Si es herramienta bucket (balde de pintura), hacer flood fill
    if (tool === 'bucket') {
      Logger.log('🪣 BUCKET FILL: iniciando en', coords);
      
      // Función para calcular tolerancia dinámica basada en el color objetivo
      const calculateDynamicTolerance = (x, y) => {
        const compositeCtx = compositeCanvasRef.current.getContext('2d');
        const imageData = compositeCtx.getImageData(x, y, 1, 1);
        const [r, g, b] = imageData.data;
        
        // Si es un color muy oscuro (como negro), usar tolerancia baja
        if (r < 80 && g < 80 && b < 80) {
          return 5;
        }
        
        // Para colores más claros o saturados, usar tolerancia más alta
        // para compensar antialiasing
        const brightness = (r + g + b) / 3;
        const saturation = Math.max(r, g, b) - Math.min(r, g, b);
        
        // Tolerancia base + ajuste por brillo y saturación
        let tolerance = 15;
        
        // Colores claros necesitan más tolerancia por antialiasing
        if (brightness > 150) tolerance += 10;
        
        // Colores saturados pueden necesitar más tolerancia
        if (saturation > 100) tolerance += 5;
        
        return Math.min(tolerance, 35); // Máximo 35 para evitar llenado excesivo
      };
      
      const dynamicTolerance = calculateDynamicTolerance(coords.x, coords.y);
      
      // Opciones configurables para el flood fill
      const floodFillOptions = {
        connectivity: 4,    // Podría ser 8 para más conectividad
        tolerance: dynamicTolerance,       // Tolerancia dinámica mejorada
        enableLogs: typeof window !== 'undefined' && window.location.hostname === 'localhost'
      };
      
      if (floodFillOptions.enableLogs) {
        Logger.log(`🎨 Tolerancia dinámica calculada: ${dynamicTolerance} para coordenadas (${coords.x}, ${coords.y})`);
      }
      
      const success = floodFill(coords.x, coords.y, brushColor, floodFillOptions);
      if (success) {
        // Guardar estado para undo/redo solo si el flood fill cambió algo
        setTimeout(() => {
          if (!isPerformingUndoRedo.current) {
            Logger.log('💾 GUARDANDO estado después de flood fill');
            saveCanvasState();
          }
        }, 100);
      }
      return;
    }
    
    Logger.log('🖊️ INICIANDO DIBUJO:', { tool, coords });
    setIsDrawing(true);
    hasDrawnInCurrentStroke.current = false; // Reset de la bandera
    const ctx = drawingCanvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  }, [transformMouseCoords, tool, onColorPicked, getColorAtPosition, floodFill, brushColor, saveCanvasState]);

  const draw = useCallback((e) => {
    if (!isDrawing || !drawingCanvasRef.current || !containerRef.current) return;
    
    const coords = transformMouseCoords(e.clientX, e.clientY);
    
    const ctx = drawingCanvasRef.current.getContext('2d');
    
    // Función auxiliar para efecto spray siguiendo SRP
    const applySprayEffect = (x, y) => {
      const density = brushSize * 2; // Densidad basada en el grosor
      const radius = brushSize * 1.5; // Radio de dispersión
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = brushColor;
      
      for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        const px = x + Math.cos(angle) * distance;
        const py = y + Math.sin(angle) * distance;
        
        ctx.fillRect(px, py, 1, 1);
      }
    };
    
    if (tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    } else if (tool === 'spray') {
      applySprayEffect(coords.x, coords.y);
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = 'round';
      
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
    
    
    // Marcar que se ha dibujado algo en este trazo
    if (!hasDrawnInCurrentStroke.current) {
      Logger.log('✏️ PRIMER TRAZO detectado - marcando hasDrawnInCurrentStroke = true');
      hasDrawnInCurrentStroke.current = true;
    }
    
    // Actualizar el composite canvas en tiempo real para ver el dibujo
    requestCompositeUpdate();
  }, [isDrawing, transformMouseCoords, tool, brushColor, brushSize, requestCompositeUpdate]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    
    Logger.log('🛑 PARANDO DIBUJO:');
    Logger.log('  - hasDrawnInCurrentStroke:', hasDrawnInCurrentStroke.current);
    Logger.log('  - isPerformingUndoRedo:', isPerformingUndoRedo.current);
    Logger.log('  - tool:', tool);
    
    setIsDrawing(false);
    
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext('2d');
      ctx.beginPath();
    }
    
    // Actualizar inmediatamente al terminar de dibujar para asegurar el estado final
    updateImmediately();
    
    // Guardar estado para undo/redo solo si realmente se dibujó algo
    if (!isPerformingUndoRedo.current && hasDrawnInCurrentStroke.current) {
      Logger.log('💾 GUARDANDO estado porque se dibujó algo');
      saveCanvasState();
    } else {
      Logger.log('❌ NO guardando estado:', {
        isPerformingUndoRedo: isPerformingUndoRedo.current,
        hasDrawnInCurrentStroke: hasDrawnInCurrentStroke.current
      });
    }
  }, [isDrawing, updateImmediately, saveCanvasState, tool]);

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
    const currentState = undoStack[undoStack.length - 1]; // Estado actual
    const previousState = undoStack[undoStack.length - 2]; // Estado anterior al que queremos volver
    
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
  }, [undoStack, redoStack, updateImmediately]);

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
    const currentState = drawingCanvasRef.current.getContext('2d').getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
  }, [redoStack, undoStack, updateImmediately]);

  // Guardar estado inicial cuando se inicializa el canvas - Solo una vez
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (drawingCanvasRef.current && !hasInitialized.current && !isSavingState.current) {
      Logger.log('🏁 INICIALIZANDO: Guardando estado inicial del canvas');
      hasInitialized.current = true;
      setTimeout(() => {
        saveCanvasState();
        // Notificar que el canvas está listo
        if (onCanvasReady) {
          Logger.log('🎯 CANVAS LISTO: Notificando al padre');
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
    // Actualizar posición del cursor tooltip relativo al canvas container
    if (['brush', 'spray', 'eraser'].includes(tool) && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCursorPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setShowCursor(true);
    } else {
      setShowCursor(false);
    }
    
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
  }, [isPanning, lastPanPoint, draw, tool]);

  const handleMouseLeave = useCallback(() => {
    setShowCursor(false);
  }, []);

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

  // Funciones para manejar gestos táctiles
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
      
      // Guardar posici�n y tiempo inicial
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
          
          // Si el movimiento es muy r�pido o grande, probablemente es pan/scroll
          const timeElapsed = Date.now() - touchStartTime.current;
          const velocity = totalMovement / Math.max(timeElapsed, 1);
          
          if (velocity > 2 || totalMovement > 50) {
            // Movimiento muy r�pido o grande - cancelar dibujo
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
        // Marcar que el usuario ha interactuado manualmente con el zoom
        hasUserInteractedWithZoom.current = true;
        
        // Calcular zoom
        const zoomFactor = distance / touchStartDistance;
        const newZoom = Math.max(0.1, Math.min(5, initialZoom * zoomFactor));
        
        // Calcular el offset necesario para mantener el punto de zoom centrado
        const zoomDelta = newZoom - initialZoom;
        const offsetX = zoomCenter.x * zoomDelta;
        const offsetY = zoomCenter.y * zoomDelta;
        
        // Calcular pan con compensaci�n del zoom centrado
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
      // No hay m�s dedos - resetear todo
      stopDrawing();
      setIsPanning(false);
      setTouchStartDistance(0);
      
      // Resetear estados de detecci�n
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
      // Configurar tamaños y optimización para lecturas frecuentes
      [backgroundCanvasRef.current, drawingCanvasRef.current, compositeCanvasRef.current].forEach(canvas => {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
        
        // Optimizar para lecturas frecuentes de getImageData
        canvas.getContext('2d', { willReadFrequently: true });
      });

      // El canvas de fondo será transparente inicialmente
      // Se llenará cuando se cargue la imagen
      
      // El canvas de dibujo del usuario también comienza transparente
      // para que el usuario pueda pintar colores

      requestCompositeUpdate();
    }
  }, [ requestCompositeUpdate]);

  // Cargar imagen de fondo - Tamaño fijo 1024x1024
  useEffect(() => {
    if (backgroundImage && backgroundCanvasRef.current) {
      const bgCtx = backgroundCanvasRef.current.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        Logger.log('📏 Imagen cargada, procesando para 1024x1024');
        
        // Crear un canvas temporal para procesar la imagen
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        tempCanvas.width = 1024;
        tempCanvas.height = 1024;
        
        // Dibujar la imagen redimensionada al tamaño fijo
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
            // Convertir colores oscuros a negro para las líneas
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
        Logger.error('Error cargando imagen:', error);
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
    
    // Limpiar también los stacks de undo/redo y guardar el estado limpio
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

  // Función para cargar una nueva imagen de fondo dinámicamente - Tamaño fijo 1024x1024
  const loadBackgroundImage = useCallback((newImageUrl) => {
    Logger.log('🖼️ Cargando nueva imagen de fondo:', newImageUrl);
    
    if (!backgroundCanvasRef.current) return;
    
    const bgCtx = backgroundCanvasRef.current.getContext('2d', { willReadFrequently: true });
    const img = new Image();
    
    img.onload = () => {
      Logger.log('📏 Nueva imagen cargada, procesando para 1024x1024');
      
      // Limpiar el canvas de fondo
      bgCtx.clearRect(0, 0, 1024, 1024);
      
      // Crear un canvas temporal para procesar la imagen
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
      tempCanvas.width = 1024;
      tempCanvas.height = 1024;
      
      // Dibujar la imagen redimensionada al tamaño fijo
      tempCtx.drawImage(img, 0, 0, 1024, 1024);
      
      // Procesar la imagen para optimizar las líneas negras con transparencia
      const imageData = tempCtx.getImageData(0, 0, 1024, 1024);
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
      
      Logger.log('✅ Nueva imagen de fondo cargada');
    };
    
    img.onerror = (error) => {
      Logger.error('❌ Error cargando la nueva imagen de fondo');
      Logger.error('🔍 Detalles del error:', error);
      Logger.error('🔍 URL que falló:', newImageUrl);
    };
    
    // Solo aplicar CORS para URLs externas, no para imágenes estáticas del mismo dominio
    if (newImageUrl.startsWith('http') && !newImageUrl.includes(window.location.hostname)) {
      img.crossOrigin = 'anonymous';
    }
    
    img.src = newImageUrl;
  }, [requestCompositeUpdate]);

  // Exponer métodos al componente padre
  // Función para exportar imagen combinada con todas las capas
  const exportCombinedImage = useCallback(() => {
    if (!backgroundCanvasRef.current || !drawingCanvasRef.current) {
      Logger.warn('❌ Canvas no disponibles para exportar');
      return null;
    }

    // Crear un canvas temporal para combinar todas las capas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = CANVAS_WIDTH;
    tempCanvas.height = CANVAS_HEIGHT;
    const tempCtx = tempCanvas.getContext('2d');

    // ORDEN CORRECTO DE CAPAS:
    
    // Capa 1: Fondo blanco sólido
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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
  }, []);

  // Función para verificar si hay contenido en el canvas de dibujo
  const hasDrawingContent = useCallback(() => {
    if (!drawingCanvasRef.current) return false;
    
    try {
      const ctx = drawingCanvasRef.current.getContext('2d');
      const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const data = imageData.data;
      
      // Verificar si hay algún píxel que no sea transparente
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) { // Si alpha > 0, hay contenido
          return true;
        }
      }
      return false;
    } catch (error) {
      Logger.error('Error checking canvas content:', error);
      return false;
    }
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
    loadBackgroundImage,
    floodFill: (x, y, color) => floodFill(x, y, color),
    hasDrawingContent
  }), [clearCanvas, printCanvas, exportCombinedImage, undo, redo, undoStack, redoStack, loadBackgroundImage, floodFill, hasDrawingContent]);

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
          cursor: showCursor ? 'none' : (
            isPanning ? 'grabbing' : (
              tool === 'brush' ? 'crosshair' : 
              tool === 'spray' ? 'crosshair' :
              tool === 'eyedropper' ? 'copy' : 
              tool === 'bucket' ? 'pointer' :
              tool === 'eraser' ? 'pointer' : 
              'pointer'
            )
          )
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
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
          {/* Canvas de fondo - líneas del dibujo (invisible, solo para trabajo) */}
          <canvas
            ref={backgroundCanvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
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
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
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
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1,
              pointerEvents: 'none'
            }}
          />
        </div>
        
        {/* Cursor tooltip visual - fuera del transform para evitar escala */}
        {showCursor && (
          <div
            className="brush-cursor-tooltip"
            style={{
              position: 'absolute',
              left: cursorPosition.x,
              top: cursorPosition.y,
              width: brushSize * 2 * zoom,
              height: brushSize * 2 * zoom,
              border: tool === 'eraser' ? '2px solid #ff4444' : `2px solid ${brushColor}`,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 10000,
              opacity: 0.6,
              backgroundColor: tool === 'eraser' ? 'transparent' : `${brushColor}20`,
              transition: 'width 0.1s ease, height 0.1s ease'
            }}
          />
        )}
      </div>
    </div>
  );
});

DrawingCanvasSimple.displayName = 'DrawingCanvasSimple';

export default DrawingCanvasSimple;
