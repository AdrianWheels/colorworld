import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import '../styles/DrawingCanvas.css';

const DrawingCanvasSimple = forwardRef(({ 
  brushSize = 5, 
  brushColor = '#000000', 
  tool = 'brush',
  backgroundImage = null,
  onCanvasChange
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

  // Actualizar canvas compuesto con throttling
  const updateCompositeCanvas = useCallback(() => {
    if (!compositeCanvasRef.current || !backgroundCanvasRef.current || !drawingCanvasRef.current) {
      return;
    }
    
    const compositeCtx = compositeCanvasRef.current.getContext('2d');
    compositeCtx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Primero poner fondo blanco
    compositeCtx.fillStyle = 'white';
    compositeCtx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Segundo: dibujar la capa del usuario (colores atrás)
    compositeCtx.drawImage(drawingCanvasRef.current, 0, 0);
    
    // Tercero: dibujar la capa de fondo (líneas negras adelante)
    compositeCtx.drawImage(backgroundCanvasRef.current, 0, 0);
    
    // Solo llamar onCanvasChange si el contenido realmente cambió
    if (onCanvasChange) {
      const newDataUrl = compositeCanvasRef.current.toDataURL();
      if (newDataUrl !== lastDataUrlRef.current) {
        lastDataUrlRef.current = newDataUrl;
        onCanvasChange(newDataUrl);
      }
    }
  }, [canvasSize, onCanvasChange]);

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

  // Función throttled para actualizar el canvas
  const requestCompositeUpdate = useCallback(() => {
    if (updateRequestRef.current) {
      return; // Ya hay una actualización pendiente
    }
    
    updateRequestRef.current = requestAnimationFrame(() => {
      updateCompositeCanvas();
      updateRequestRef.current = null;
    });
  }, [updateCompositeCanvas]);

  // Función para actualizar inmediatamente (para cuando termine de dibujar)
  const updateImmediately = useCallback(() => {
    if (updateRequestRef.current) {
      cancelAnimationFrame(updateRequestRef.current);
      updateRequestRef.current = null;
    }
    updateCompositeCanvas();
  }, [updateCompositeCanvas]);

  // Funciones de dibujo básicas (deben definirse antes de los manejadores)
  const startDrawing = useCallback((e) => {
    if (!drawingCanvasRef.current || !containerRef.current) return;
    
    setIsDrawing(true);
    const coords = transformMouseCoords(e.clientX, e.clientY);
    
    const ctx = drawingCanvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  }, [transformMouseCoords]);

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
    
    // Actualizar el composite canvas en tiempo real para ver el dibujo
    requestCompositeUpdate();
  }, [isDrawing, transformMouseCoords, tool, brushColor, brushSize, requestCompositeUpdate]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext('2d');
      ctx.beginPath();
    }
    
    // Actualizar inmediatamente al terminar de dibujar para asegurar el estado final
    updateImmediately();
  }, [isDrawing, updateImmediately]);

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
      // Configurar tamaños
      [backgroundCanvasRef.current, drawingCanvasRef.current, compositeCanvasRef.current].forEach(canvas => {
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
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
        const tempCtx = tempCanvas.getContext('2d');
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

  const clearCanvas = () => {
    if (!drawingCanvasRef.current) return;
    
    const ctx = drawingCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    updateImmediately();
  };

  const printCanvas = () => {
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
  };

  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    clearCanvas,
    printCanvas,
    getCanvas: () => compositeCanvasRef.current
  }));

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
          cursor: isPanning ? 'grabbing' : (tool === 'brush' ? 'crosshair' : 'pointer'),
          overflow: 'hidden',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
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