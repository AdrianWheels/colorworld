import { useState, useRef, useCallback, useEffect } from 'react';
import DrawingCanvasSimple from './components/DrawingCanvasSimple';
import ToolBarHorizontal from './components/ToolBarHorizontal';
import DrawingHistory from './components/DrawingHistory';
import { useDrawing } from './hooks/useDrawing';
import drawingService from './services/drawingService';
import './App.css';

function App() {
  const [currentTool, setCurrentTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [canvasData, setCanvasData] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isGeneratingWithGemini, setIsGeneratingWithGemini] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const canvasRef = useRef(null);
  const { 
    isLoading, 
    error, 
    coloredDrawings, 
    saveColoredDrawing, 
    generateNewDrawing 
  } = useDrawing();

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

  const updateUndoRedoState = useCallback(() => {
    if (canvasRef.current) {
      const canUndo = canvasRef.current.canUndo ? canvasRef.current.canUndo() : false;
      const canRedo = canvasRef.current.canRedo ? canvasRef.current.canRedo() : false;
      
      setCanUndo(canUndo);
      setCanRedo(canRedo);
    }
  }, []);

  const handleUndo = useCallback(() => {
    if (canvasRef.current && canvasRef.current.undo) {
      canvasRef.current.undo();
      updateUndoRedoState();
    }
  }, [updateUndoRedoState]);

  const handleRedo = useCallback(() => {
    if (canvasRef.current && canvasRef.current.redo) {
      canvasRef.current.redo();
      updateUndoRedoState();
    }
  }, [updateUndoRedoState]);

  const handleCanvasChangeWithUndoUpdate = useCallback((dataUrl) => {
    setCanvasData(dataUrl);
    setTimeout(() => {
      if (canvasRef.current) {
        const canUndo = canvasRef.current.canUndo ? canvasRef.current.canUndo() : false;
        const canRedo = canvasRef.current.canRedo ? canvasRef.current.canRedo() : false;
        
        setCanUndo(canUndo);
        setCanRedo(canRedo);
      }
    }, 200);
  }, []);

  const handleColorPicked = useCallback((color) => {
    setBrushColor(color);
    setCurrentTool('brush');
  }, []);

  // Función para generar imagen con Gemini usando prompts aleatorios
  const handleGenerateWithGemini = useCallback(async () => {
    try {
      setIsGeneratingWithGemini(true);
      console.log('🎨 Generando imagen aleatoria...');
      
      const result = await drawingService.generateImageWithGemini();
      
      if (result && canvasRef.current && canvasRef.current.loadBackgroundImage) {
        await canvasRef.current.loadBackgroundImage(result.imageUrl);
        alert(`¡Nueva imagen de ${result.animal || 'animal'} lista para colorear! 🎨`);
      } else {
        alert('No se pudo generar la imagen. Inténtalo de nuevo. 😔');
      }
      
    } catch (error) {
      console.error('❌ Error al generar:', error);
      alert('Error al generar la imagen. 😔');
    } finally {
      setIsGeneratingWithGemini(false);
    }
  }, []);

  // Funciones para navegación por días
  const getCurrentDate = useCallback(() => {
    const selected = selectedDate;
    return selected.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }, [selectedDate]);

  const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
  };

  const isToday = useCallback(() => {
    const today = new Date();
    return isSameDay(today, selectedDate);
  }, [selectedDate]);

  const navigateToDay = useCallback((direction) => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + direction);
      return newDate;
    });
  }, []);

  const goToPreviousDay = useCallback(() => {
    navigateToDay(-1);
  }, [navigateToDay]);

  const goToNextDay = useCallback(() => {
    navigateToDay(1);
  }, [navigateToDay]);

  // Agregar atajos de teclado para undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  if (isLoading) {
    return (
      <div className="app">
        <header className="app-header">
          <h1 className="coloreveryday-title">COLOREVERYDAY</h1>
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
      </header>
      
      {/* Navegación por días */}
      <section className="day-navigation-section">
        <div className="day-info">
          <h2 className="day-title">Dibujo del Día</h2>
          <div className="date-display">
            <button className="nav-date-btn prev" onClick={goToPreviousDay} title="Día anterior">❮</button>
            <div className="current-date-info">
              <span className="date-text">{getCurrentDate()}</span>
              <span className="day-indicator">{isToday() ? 'Hoy' : 'Día seleccionado'}</span>
            </div>
            <button className="nav-date-btn next" onClick={goToNextDay} title="Día siguiente">❯</button>
          </div>
        </div>
      </section>

      <main className="app-main">
        <div className="drawing-section">
          <div className="canvas-and-tools">
            <ToolBarHorizontal
              onToolChange={setCurrentTool}
              onBrushSizeChange={setBrushSize}
              onColorChange={setBrushColor}
              onClearCanvas={handleClearCanvas}
              onPrintCanvas={handlePrintCanvas}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
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
                  onCanvasChange={handleCanvasChangeWithUndoUpdate}
                  onColorPicked={handleColorPicked}
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
              
              {/* Botón simplificado para generar con Gemini */}
              <button 
                onClick={handleGenerateWithGemini}
                className="gemini-btn-simple"
                title="Generar animal para colorear con IA"
                disabled={isGeneratingWithGemini}
              >
                {isGeneratingWithGemini ? '🔄 Generando...' : '🎨 Generar Animal para Colorear'}
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