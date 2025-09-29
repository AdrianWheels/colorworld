import { useState, useRef, useCallback, useEffect } from 'react';
import DrawingCanvasSimple from './components/DrawingCanvasSimple';
import ToolBarHorizontal from './components/ToolBarHorizontal';
import DrawingHistory from './components/DrawingHistory';
import ControlsModal from './components/ControlsModal';
import DayNavigation from './components/DayNavigation';
import CanvasActions from './components/CanvasActions';
import ToastContainer from './components/ToastContainer';
import { useDrawing } from './hooks/useDrawing';
import { useDayNavigation } from './hooks/useDayNavigation';
import { useCanvasActions } from './hooks/useCanvasActions';
import { useToast } from './hooks/useToast';
import drawingService from './services/drawingService';
import promptsManager from './services/promptsManager';
import './App.css';

function App() {
  const [currentTool, setCurrentTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [isControlsModalOpen, setIsControlsModalOpen] = useState(false);
  const [todayTheme, setTodayTheme] = useState('');
  
  const canvasRef = useRef(null);
  
  // Hook para notificaciones
  const { toasts, showSuccess, showError, removeToast } = useToast();
  
  // Hooks modulares
  const { 
    isLoading, 
    error, 
    coloredDrawings, 
    saveColoredDrawing 
  } = useDrawing();
  
  const {
    selectedDate,
    dayImageStatus,
    loadDayImage,
    goToPreviousDay,
    goToNextDay
  } = useDayNavigation();
  
  const {
    canvasData,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    handleClearCanvas,
    handleCanvasChangeWithUndoUpdate,
    handleSaveDrawing
  } = useCanvasActions(canvasRef, saveColoredDrawing);

  const handleColorPicked = useCallback((color) => {
    setBrushColor(color);
    // Cambiar automáticamente a pincel después de seleccionar color
    setCurrentTool('brush');
  }, []);

  const onSaveDrawing = useCallback(() => {
    const result = handleSaveDrawing();
    if (result.success) {
      showSuccess(result.message);
    } else {
      showError(result.message);
    }
  }, [handleSaveDrawing, showSuccess, showError]);

  // Obtener la temática del día actual
  useEffect(() => {
    const todayPrompt = promptsManager.getPromptForToday();
    setTodayTheme(todayPrompt.tematica || 'something magical');
  }, []);

  // Effect para cargar imagen cuando cambia la fecha seleccionada
  useEffect(() => {
    loadDayImage(canvasRef);
    
    // Limpiar localStorage obsoleto al cambiar de día
    drawingService.cleanupLocalStorage();
  }, [loadDayImage, canvasRef]);

  // Agregar atajos de teclado para undo/redo
  useEffect(() => {
    // Limpiar localStorage obsoleto al iniciar la app
    drawingService.cleanupLocalStorage();
    
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
        </header>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="coloreveryday-title">COLOREVERYDAY</h1>
        
        <DayNavigation
          selectedDate={selectedDate}
          onPreviousDay={goToPreviousDay}
          onNextDay={goToNextDay}
          dayImageStatus={dayImageStatus}
        />
      </header>

      <main className="app-main">
        <div className="drawing-section">
          <div className="canvas-and-tools">
            <ToolBarHorizontal
              onToolChange={setCurrentTool}
              onBrushSizeChange={setBrushSize}
              onColorChange={setBrushColor}
              onClearCanvas={handleClearCanvas}
              onShowControls={() => setIsControlsModalOpen(true)}
              onSave={onSaveDrawing}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              canSave={!!canvasData}
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
            
            <CanvasActions
              onSave={onSaveDrawing}
              canSave={!!canvasData}
            />
          </div>
        </div>

        <aside className="history-section" style={{ display: 'none' }}>
          <DrawingHistory coloredDrawings={coloredDrawings} />
        </aside>
      </main>

      <footer className="app-footer">
        <p className="footer-text">
          <strong>Dreaming about {todayTheme}!</strong>
        </p>
        <p className="footer-share">Share it on social media #coloreveryday</p>
      </footer>
      
      {/* Modal de controles */}
      <ControlsModal 
        isOpen={isControlsModalOpen}
        onClose={() => setIsControlsModalOpen(false)}
      />
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

export default App;
