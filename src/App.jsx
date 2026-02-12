import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import DrawingCanvasSimple from './components/DrawingCanvasSimple';
import ToolBarHorizontal from './components/ToolBarHorizontal';
import DrawingHistory from './components/DrawingHistory';
import ControlsModal from './components/ControlsModal';
import DayNavigation from './components/DayNavigation';
import { Tiles } from './components/Tiles';

import ToastContainer from './components/ToastContainer';
import StructuredData from './components/StructuredData';
import SEOHead from './components/SEOHead';
import AboutModal from './components/AboutModal';
import ConfirmationModal from './components/ConfirmationModal';
import { useDrawing } from './hooks/useDrawing';
import { useDayNavigation } from './hooks/useDayNavigation';
import { useCanvasActions } from './hooks/useCanvasActions';
import { useToast } from './hooks/useToast';
import drawingService from './services/drawingService';
import promptsManager from './services/promptsManager';
import staticImageService from './services/staticImageService';
import Logger from './utils/logger.js';
import './App.css';

function App() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const dateFromUrl = searchParams.get('date');

  const [currentTool, setCurrentTool] = useState('brush');
  const [previousTool, setPreviousTool] = useState('brush'); // Track de herramienta anterior
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [isControlsModalOpen, setIsControlsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false); // Estado para footer colapsable - oculto por defecto
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
    setSelectedDate,
    dayImageStatus,
    loadDayImage,
    goToPreviousDay,
    goToNextDay,
    showDayChangeConfirmation,
    confirmDayChange,
    cancelDayChange
  } = useDayNavigation(canvasRef);

  const {
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    handleClearCanvas,
    handleCanvasChangeWithUndoUpdate,
    handleSaveDrawing,
    showClearConfirmation,
    handleConfirmClear,
    handleCancelClear
  } = useCanvasActions(canvasRef, saveColoredDrawing);

  // Handler para cambio de herramienta con tracking
  const handleToolChange = useCallback((newTool) => {
    // Si no es cuentagotas, guardar como herramienta anterior
    if (currentTool !== 'eyedropper') {
      setPreviousTool(currentTool);
    }
    setCurrentTool(newTool);
  }, [currentTool]);

  const handleColorPicked = useCallback((color) => {
    setBrushColor(color);
    // Volver a la herramienta anterior en lugar de pincel
    const toolToReturn = previousTool === 'eyedropper' ? 'brush' : previousTool;
    setCurrentTool(toolToReturn);
  }, [previousTool]);

  const handleCanvasReady = useCallback(() => {
    Logger.log('🎯 Canvas listo, cargando imagen del día');
    loadDayImage(canvasRef);
  }, [loadDayImage]);

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

  // Calcular el día del año para la fecha seleccionada
  const currentDayOfYear = promptsManager.getDayOfYear(selectedDate);

  // Effect para procesar fecha desde URL (cuando se hace clic en el calendario)
  useEffect(() => {
    if (dateFromUrl) {
      try {
        const urlDate = new Date(dateFromUrl);
        // Validar que la fecha es válida
        if (!isNaN(urlDate.getTime())) {
          Logger.log('📅 Navegando a fecha desde URL:', dateFromUrl);
          setSelectedDate(urlDate);
        }
      } catch (error) {
        Logger.error('❌ Error parseando fecha desde URL:', error);
      }
    }
  }, [dateFromUrl, setSelectedDate]);

  // Effect para limpiar localStorage cuando cambia la fecha
  useEffect(() => {
    // Limpiar localStorage obsoleto al cambiar de día
    drawingService.cleanupLocalStorage();
  }, [selectedDate]);

  // Effect para cargar nueva imagen cuando cambia la fecha seleccionada
  useEffect(() => {
    // Solo cargar si el canvas ya está inicializado
    if (canvasRef.current) {
      Logger.log('📅 Fecha cambiada, recargando imagen...');
      loadDayImage(canvasRef);
    }
  }, [selectedDate, loadDayImage]);

  // Agregar atajos de teclado para undo/redo
  useEffect(() => {
    // Limpiar localStorage obsoleto al iniciar la app
    drawingService.cleanupLocalStorage();

    // Forzar recarga del índice al iniciar la app para evitar problemas de caché
    staticImageService.forceReloadIndex().catch(error => {
      Logger.warn('⚠️ No se pudo forzar la recarga del índice:', error);
    });

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
        <Tiles rows={40} cols={30} tileSize="lg" />
        <header className="app-header">
          <img src="/Letras web.png" alt="ColorEveryday" className="coloreveryday-logo" />
          <p>{t('app.loading')}</p>
        </header>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('app.generating')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Tiles rows={40} cols={30} tileSize="lg" />
        <header className="app-header">
          <img src="/Letras web.png" alt="ColorEveryday" className="coloreveryday-logo" />
          <p className="error-message">{error}</p>
        </header>
      </div>
    );
  }

  return (
    <div className="app">
      <Tiles rows={40} cols={30} tileSize="lg" />
      {/* Structured Data para SEO - invisible al usuario */}
      <StructuredData
        todayTheme={todayTheme}
        selectedDate={selectedDate}
        dayImageStatus={dayImageStatus}
      />

      {/* SEO Head dinámico */}
      <SEOHead
        currentTheme={todayTheme}
        currentDate={selectedDate}
      />

      <Header>
        <DayNavigation
          selectedDate={selectedDate}
          onPreviousDay={goToPreviousDay}
          onNextDay={goToNextDay}
        />
      </Header>

      <motion.main
        className="app-main"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="drawing-section">
          <div className="canvas-and-tools">
            <ToolBarHorizontal
              onToolChange={handleToolChange}
              onBrushSizeChange={setBrushSize}
              onColorChange={setBrushColor}
              onClearCanvas={handleClearCanvas}
              onShowControls={() => setIsControlsModalOpen(true)}
              onSave={onSaveDrawing}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              canSave={true}
              currentTool={currentTool}
              currentColor={brushColor}
              currentBrushSize={brushSize}
              currentDay={currentDayOfYear}
            />

            <div className="comic-panels">
              <div className="comic-panel">
                <DrawingCanvasSimple
                  ref={canvasRef}
                  brushSize={brushSize}
                  brushColor={brushColor}
                  tool={currentTool}
                  backgroundImage="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='100%25' height='100%25' fill='%23ffffff'/%3E%3C/svg%3E"
                  onCanvasChange={handleCanvasChangeWithUndoUpdate}
                  onColorPicked={handleColorPicked}
                  onCanvasReady={handleCanvasReady}
                />
              </div>
            </div>


          </div>
        </div>

        <aside className="history-section" style={{ display: 'none' }}>
          <DrawingHistory coloredDrawings={coloredDrawings} />
        </aside>
      </motion.main>

      {/* Botón para mostrar/ocultar footer */}
      <button
        className="footer-toggle-btn"
        onClick={() => setIsFooterVisible(!isFooterVisible)}
        title={isFooterVisible ? t('app.footer.hideInfo') : t('app.footer.showInfo')}
      >
        {isFooterVisible ? '⬇️' : '⬆️'} {todayTheme}
      </button>

      {/* Footer colapsable */}
      <footer className={`app-footer ${isFooterVisible ? 'visible' : 'hidden'}`}>
        <p className="footer-text">
          <strong>{t('app.footer.dreaming', { theme: todayTheme })}</strong>
        </p>
        <p className="footer-share">
          {t('app.footer.share')}
          <a
            href="https://www.instagram.com/coloreverydayapp/"
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-link"
            aria-label={t('app.footer.instagram')}
            title={t('app.footer.instagram')}
          >
            <img
              src="/Icons/web/information.png"
              alt={t('app.footer.instagram')}
              style={{ width: '70px', height: '70px', objectFit: 'contain' }}
            />
          </a>
          <a
            href="https://es.pinterest.com/ColorEveryDay"
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-link"
            aria-label="Pinterest"
            title="Pinterest"
          >
            <img
              src="/Icons/web/pinterest.png"
              alt="Pinterest"
              style={{ width: '70px', height: '70px', objectFit: 'contain' }}
            />
          </a>
          <button
            className="about-link"
            onClick={() => setIsAboutModalOpen(true)}
            aria-label={t('app.footer.about')}
            title={t('app.footer.about')}
          >
            <img
              src="/Icons/web/information.png"
              alt={t('app.footer.about')}
              style={{ width: '70px', height: '70px', objectFit: 'contain' }}
            />
          </button>
          <Link
            to="/privacidad"
            className="about-link"
            aria-label={t('app.footer.privacy')}
            title={t('app.footer.privacy')}
          >
            <img src="/Icons/web/privacy.png" alt={t('app.footer.privacy')} style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
          </Link>
        </p>
      </footer>

      {/* Modal de controles */}
      <ControlsModal
        isOpen={isControlsModalOpen}
        onClose={() => setIsControlsModalOpen(false)}
      />

      {/* Modal About Us */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Confirmation modal for clearing canvas */}
      <ConfirmationModal
        isOpen={showClearConfirmation}
        onClose={handleCancelClear}
        onConfirm={handleConfirmClear}
        title={t('app.confirmation.clear.title')}
        message={t('app.confirmation.clear.message')}
        confirmText={t('app.confirmation.clear.confirm')}
        cancelText={t('app.confirmation.clear.cancel')}
        type="danger"
      />

      {/* Confirmation modal for day change */}
      <ConfirmationModal
        isOpen={showDayChangeConfirmation}
        onClose={cancelDayChange}
        onConfirm={confirmDayChange}
        title={t('app.confirmation.dayChange.title')}
        message={t('app.confirmation.dayChange.message')}
        confirmText={t('app.confirmation.dayChange.confirm')}
        cancelText={t('app.confirmation.dayChange.cancel')}
        type="warning"
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}

export default App;
