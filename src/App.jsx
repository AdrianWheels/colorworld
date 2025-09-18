import { useState, useRef } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import ToolBar from './components/ToolBar';
import DrawingHistory from './components/DrawingHistory';
import { useDrawing } from './hooks/useDrawing';
import './App.css';

function App() {
  const [currentTool, setCurrentTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [canvasData, setCanvasData] = useState(null);
  
  const canvasRef = useRef(null);
  const { 
    dailyDrawing, 
    isLoading, 
    error, 
    coloredDrawings, 
    saveColoredDrawing, 
    generateNewDrawing 
  } = useDrawing();

  const handleCanvasChange = (dataUrl) => {
    setCanvasData(dataUrl);
  };

  const handleClearCanvas = () => {
    if (canvasRef.current && canvasRef.current.clearCanvas) {
      canvasRef.current.clearCanvas();
    }
  };

  const handlePrintCanvas = () => {
    if (canvasRef.current && canvasRef.current.printCanvas) {
      canvasRef.current.printCanvas();
    }
  };

  const handleSaveDrawing = () => {
    if (canvasData) {
      const success = saveColoredDrawing(canvasData);
      if (success) {
        alert('¡Dibujo guardado exitosamente!');
      } else {
        alert('Error al guardar el dibujo');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🎨 ColorWorld</h1>
          <p>Cargando el dibujo del día...</p>
        </header>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Generando tu dibujo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🎨 ColorWorld</h1>
          <p className="error-message">{error}</p>
          <button onClick={generateNewDrawing} className="retry-btn">
            Intentar de nuevo
          </button>
        </header>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎨 ColorWorld</h1>
        <p className="app-subtitle">¡Colorea el dibujo del día!</p>
        {dailyDrawing && (
          <div className="daily-prompt">
            <h2>Hoy colorearemos:</h2>
            <p>"{dailyDrawing.prompt}"</p>
          </div>
        )}
      </header>

      <main className="app-main">
        <div className="drawing-section">
          <div className="canvas-and-tools">
            <ToolBar
              onToolChange={setCurrentTool}
              onBrushSizeChange={setBrushSize}
              onColorChange={setBrushColor}
              onClearCanvas={handleClearCanvas}
              onPrintCanvas={handlePrintCanvas}
              currentTool={currentTool}
              currentColor={brushColor}
              currentBrushSize={brushSize}
            />
            
            <div className="canvas-container">
              <DrawingCanvas
                ref={canvasRef}
                brushSize={brushSize}
                brushColor={brushColor}
                tool={currentTool}
                backgroundImage={dailyDrawing?.imageUrl}
                onCanvasChange={handleCanvasChange}
              />
              
              <div className="canvas-actions">
                <button 
                  onClick={handleSaveDrawing}
                  className="save-btn"
                  disabled={!canvasData}
                  title="Guardar dibujo coloreado"
                >
                  💾 Guardar Dibujo
                </button>
                <button 
                  onClick={generateNewDrawing}
                  className="new-drawing-btn"
                  title="Generar nuevo dibujo"
                >
                  🎲 Nuevo Dibujo
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="history-section">
          <DrawingHistory coloredDrawings={coloredDrawings} />
        </aside>
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 ColorWorld - Dibuja, colorea y crea</p>
      </footer>
    </div>
  );
}

export default App;
