import { useState, useRef, useCallback } from 'react';
import DrawingCanvasSimple from './components/DrawingCanvasSimple';
import ToolBarHorizontal from './components/ToolBarHorizontal';
import DrawingHistory from './components/DrawingHistory';
import { useDrawing } from './hooks/useDrawing';
import './App.css';

function App() {
  const [currentTool, setCurrentTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [canvasData, setCanvasData] = useState(null);
  const [activeNavItem, setActiveNavItem] = useState('Home');
  
  const canvasRef = useRef(null);
  const { 
    dailyDrawing, 
    isLoading, 
    error, 
    coloredDrawings, 
    saveColoredDrawing, 
    generateNewDrawing 
  } = useDrawing();

  const navigationItems = ['About', 'Shop', 'Discount', 'Product', 'Home', 'Account'];

  const handleCanvasChange = useCallback((dataUrl) => {
    setCanvasData(dataUrl);
  }, []);

  const handleClearCanvas = useCallback(() => {
    if (canvasRef.current && canvasRef.current.clearCanvas) {
      canvasRef.current.clearCanvas();
    }
  }, []);

  const handlePrintCanvas = useCallback(() => {
    if (canvasRef.current && canvasRef.current.printCanvas) {
      canvasRef.current.printCanvas();
    }
  }, []);

  const handleSaveDrawing = useCallback(() => {
    if (canvasData) {
      const success = saveColoredDrawing(canvasData);
      if (success) {
        alert('¡Dibujo guardado exitosamente!');
      } else {
        alert('Error al guardar el dibujo');
      }
    }
  }, [canvasData, saveColoredDrawing]);

  const getCurrentDate = () => {
    const today = new Date();
    return `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear().toString().slice(-2)}`;
  };

  if (isLoading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1 className="coloreveryday-title">COLOREVERYDAY</h1>
          <nav className="main-navigation">
            {navigationItems.map(item => (
              <button 
                key={item}
                className={`nav-pill ${activeNavItem === item ? 'active' : ''}`}
                onClick={() => setActiveNavItem(item)}
              >
                {item}
              </button>
            ))}
          </nav>
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
          <h1 className="coloreveryday-title">COLOREVERYDAY</h1>
          <nav className="main-navigation">
            {navigationItems.map(item => (
              <button 
                key={item}
                className={`nav-pill ${activeNavItem === item ? 'active' : ''}`}
                onClick={() => setActiveNavItem(item)}
              >
                {item}
              </button>
            ))}
          </nav>
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
        <h1 className="coloreveryday-title">COLOREVERYDAY</h1>
        <nav className="main-navigation">
          {navigationItems.map(item => (
            <button 
              key={item}
              className={`nav-pill ${activeNavItem === item ? 'active' : ''}`}
              onClick={() => setActiveNavItem(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        
        <div className="drawing-of-day-section">
          <h2 className="drawing-title">Drawing of the day</h2>
          <div className="date-navigation">
            <button className="date-nav-btn">❮</button>
            <span className="current-date">{getCurrentDate()}</span>
            <button className="date-nav-btn">❯</button>
          </div>
          {dailyDrawing && (
            <div className="daily-prompt">
              <p>"{dailyDrawing.prompt}"</p>
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="drawing-section">
          <div className="side-buttons">
            <div className="side-button-container">
              <button className="side-action-btn print-btn">
                <div className="btn-icon">🖨️</div>
                <span>Print of the day</span>
              </button>
            </div>
          </div>

          <div className="canvas-and-tools">
            <ToolBarHorizontal
              onToolChange={setCurrentTool}
              onBrushSizeChange={setBrushSize}
              onColorChange={setBrushColor}
              onClearCanvas={handleClearCanvas}
              onPrintCanvas={handlePrintCanvas}
              currentTool={currentTool}
              currentColor={brushColor}
              currentBrushSize={brushSize}
            />
            
            <div className="comic-panels">
              <div className="comic-panel">
                <DrawingCanvasSimple
                  ref={canvasRef}
                  brushSize={brushSize}
                  brushColor={brushColor}
                  tool={currentTool}
                  backgroundImage="/conejoprueba.png"
                  onCanvasChange={handleCanvasChange}
                />
              </div>
            </div>
            
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

          <div className="side-buttons">
            <div className="side-button-container">
              <button className="side-action-btn palette-btn">
                <div className="btn-icon">🎨</div>
                <span>LET'S GO!</span>
                <small>Drawing palette</small>
              </button>
            </div>
          </div>
        </div>

        <aside className="history-section" style={{ display: 'none' }}>
          <DrawingHistory coloredDrawings={coloredDrawings} />
        </aside>
      </main>

      <footer className="app-footer">
        <p className="footer-text">
          <strong>¡UN DÍA CON MI CONEJO!</strong>
        </p>
        <p className="footer-share">Share it on social media #coloreveryday</p>
      </footer>
    </div>
  );
}

export default App;
