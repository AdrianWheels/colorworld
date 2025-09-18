import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import '../styles/DrawingCanvas.css';

const DrawingCanvas = forwardRef(({ 
  brushSize = 5, 
  brushColor = '#000000', 
  tool = 'brush',
  backgroundImage = null,
  onCanvasChange,
  layers = [],
  activeLayerId,
  onRegisterLayerCanvas
}, ref) => {
  const containerRef = useRef(null);
  const layerCanvasRefs = useRef({});
  const compositeCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Inicializar canvas para cada capa
  useEffect(() => {
    layers.forEach(layer => {
      if (!layerCanvasRefs.current[layer.id]) {
        const canvas = document.createElement('canvas');
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = layer.id === activeLayerId ? 'auto' : 'none';
        
        const ctx = canvas.getContext('2d');
        
        // Configurar la capa de fondo
        if (layer.type === 'background') {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        layerCanvasRefs.current[layer.id] = canvas;
        
        // Registrar el canvas con el hook de capas
        if (onRegisterLayerCanvas) {
          onRegisterLayerCanvas(layer.id, canvas);
        }
      }
    });
    
    // Limpiar canvas de capas eliminadas
    Object.keys(layerCanvasRefs.current).forEach(layerId => {
      if (!layers.find(l => l.id === layerId)) {
        delete layerCanvasRefs.current[layerId];
      }
    });
  }, [layers, canvasSize, activeLayerId, onRegisterLayerCanvas]);

  // Actualizar eventos de puntero para la capa activa
  useEffect(() => {
    Object.values(layerCanvasRefs.current).forEach(canvas => {
      canvas.style.pointerEvents = 'none';
    });
    
    if (layerCanvasRefs.current[activeLayerId]) {
      layerCanvasRefs.current[activeLayerId].style.pointerEvents = 'auto';
    }
  }, [activeLayerId]);

  // Cargar imagen de fondo en la capa de fondo
  useEffect(() => {
    const backgroundLayer = layers.find(l => l.type === 'background');
    if (backgroundLayer && backgroundImage && layerCanvasRefs.current[backgroundLayer.id]) {
      const canvas = layerCanvasRefs.current[backgroundLayer.id];
      const ctx = canvas.getContext('2d');
      
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        updateCompositeCanvas();
      };
      img.src = backgroundImage;
    }
  }, [backgroundImage, layers]);

  // Actualizar canvas compuesto
  const updateCompositeCanvas = () => {
    if (!compositeCanvasRef.current) return;
    
    const compositeCtx = compositeCanvasRef.current.getContext('2d');
    compositeCtx.clearRect(0, 0, compositeCanvasRef.current.width, compositeCanvasRef.current.height);
    
    layers.forEach(layer => {
      if (layer.visible && layerCanvasRefs.current[layer.id]) {
        compositeCtx.globalAlpha = layer.opacity;
        compositeCtx.drawImage(layerCanvasRefs.current[layer.id], 0, 0);
      }
    });
    
    compositeCtx.globalAlpha = 1;
    
    if (onCanvasChange) {
      onCanvasChange(compositeCanvasRef.current.toDataURL());
    }
  };

  // Actualizar cuando cambien las propiedades de las capas
  useEffect(() => {
    updateCompositeCanvas();
  }, [layers]);

  // Configurar canvas compuesto
  useEffect(() => {
    if (compositeCanvasRef.current && containerRef.current) {
      const canvas = compositeCanvasRef.current;
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      
      // Limpiar contenedor y agregar todos los canvas
      containerRef.current.innerHTML = '';
      
      // Agregar canvas de capas
      layers.forEach(layer => {
        if (layerCanvasRefs.current[layer.id]) {
          containerRef.current.appendChild(layerCanvasRefs.current[layer.id]);
        }
      });
      
      // El canvas compuesto es invisible, solo para exportar
      canvas.style.display = 'none';
      containerRef.current.appendChild(canvas);
      
      updateCompositeCanvas();
    }
  }, [layers, canvasSize]);

  const getActiveCanvas = () => {
    return layerCanvasRefs.current[activeLayerId];
  };

  const startDrawing = (e) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = getActiveCanvas();
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    
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
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    updateCompositeCanvas();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = getActiveCanvas();
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
    }
  };

  const clearActiveLayer = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const activeLayer = layers.find(l => l.id === activeLayerId);
    
    if (activeLayer?.type === 'background') {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Recargar imagen de fondo si existe
      if (backgroundImage) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          updateCompositeCanvas();
        };
        img.src = backgroundImage;
      }
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    updateCompositeCanvas();
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
    clearCanvas: clearActiveLayer,
    printCanvas,
    getCompositeCanvas: () => compositeCanvasRef.current,
    getLayerCanvas: (layerId) => layerCanvasRefs.current[layerId]
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
      <div 
        ref={containerRef}
        className="canvas-layers-container"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: canvasSize.width,
          height: canvasSize.height,
          border: '2px solid #333',
          borderRadius: '8px',
          cursor: tool === 'brush' ? 'crosshair' : 'pointer',
          overflow: 'hidden'
        }}
      >
        <canvas
          ref={compositeCanvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
        />
      </div>
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;