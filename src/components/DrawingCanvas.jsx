import { useRef, useEffect, useState } from 'react';
import '../styles/DrawingCanvas.css';

const DrawingCanvas = ({ 
  brushSize = 5, 
  brushColor = '#000000', 
  tool = 'brush',
  backgroundImage = null,
  onCanvasChange
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Set initial canvas background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setContext(ctx);
  }, []);

  useEffect(() => {
    if (context && backgroundImage) {
      const img = new Image();
      img.onload = () => {
        // Clear canvas
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        // Fill with white background
        context.fillStyle = 'white';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        // Draw the background image
        context.drawImage(img, 0, 0, context.canvas.width, context.canvas.height);
      };
      img.src = backgroundImage;
    }
  }, [backgroundImage, context]);

  const startDrawing = (e) => {
    if (!context) return;
    
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === 'brush') {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = brushColor;
      context.lineWidth = brushSize;
      context.lineCap = 'round';
      context.lineJoin = 'round';
    } else if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
      context.lineWidth = brushSize * 2;
      context.lineCap = 'round';
    }
    
    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
    
    if (onCanvasChange) {
      onCanvasChange(canvasRef.current.toDataURL());
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (context) {
      context.beginPath();
    }
  };

  const clearCanvas = () => {
    if (!context) return;
    
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.fillStyle = 'white';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.drawImage(img, 0, 0, context.canvas.width, context.canvas.height);
      };
      img.src = backgroundImage;
    } else {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      context.fillStyle = 'white';
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
    
    if (onCanvasChange) {
      onCanvasChange(canvasRef.current.toDataURL());
    }
  };

  const printCanvas = () => {
    const canvas = canvasRef.current;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>ColorWorld Drawing</title>
          <style>
            body { margin: 0; padding: 20px; text-align: center; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <h1>My ColorWorld Creation</h1>
          <img src="${canvas.toDataURL()}" alt="My Drawing" />
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  // Expose methods to parent component
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.clearCanvas = clearCanvas;
      canvas.printCanvas = printCanvas;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, backgroundImage]);

  return (
    <div className="drawing-canvas-container">
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
          });
          canvasRef.current.dispatchEvent(mouseEvent);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
          });
          canvasRef.current.dispatchEvent(mouseEvent);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          const mouseEvent = new MouseEvent('mouseup', {});
          canvasRef.current.dispatchEvent(mouseEvent);
        }}
      />
    </div>
  );
};

export default DrawingCanvas;