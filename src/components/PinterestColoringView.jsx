import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Tiles } from './Tiles';
import DrawingCanvasSimple from './DrawingCanvasSimple';
import ToolBarHorizontal from './ToolBarHorizontal';

import ToastContainer from './ToastContainer';
import ConfirmationModal from './ConfirmationModal';
import AuthModal from './AuthModal';
import { useCanvasActions } from '../hooks/useCanvasActions';
import { useToast } from '../hooks/useToast';
import { useDrawing } from '../hooks/useDrawing';
import { useAuth } from '../context/AuthContext';
import pinterestService from '../services/pinterestService';
import promptsManager from '../services/promptsManager';
import supabase from '../services/supabaseClient';
import Logger from '../utils/logger.js';
import '../styles/PinterestColoringView.css';

function PinterestColoringView() {
    const { pinId } = useParams();
    const navigate = useNavigate();

    const [pinData, setPinData] = useState(null);
    const [boardData, setBoardData] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoadingPin, setIsLoadingPin] = useState(true);
    const [pinError, setPinError] = useState(null);

    const [currentTool, setCurrentTool] = useState('brush');
    const [previousTool, setPreviousTool] = useState('brush');
    const [brushSize, setBrushSize] = useState(5);
    const [brushColor, setBrushColor] = useState('#000000');

    const canvasRef = useRef(null);
    const currentDayOfYear = promptsManager.getDayOfYear(new Date());
    const { toasts, showSuccess, showError, removeToast } = useToast();
    const { user, isLoggedIn } = useAuth();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const { saveColoredDrawing } = useDrawing();
    const {
        canUndo, canRedo,
        handleUndo, handleRedo,
        handleClearCanvas,
        handleCanvasChangeWithUndoUpdate,
        handleSaveDrawing,
        showClearConfirmation,
        handleConfirmClear,
        handleCancelClear,
    } = useCanvasActions(canvasRef, saveColoredDrawing);

    // Load pin data
    useEffect(() => {
        let cancelled = false;

        async function loadPin() {
            setIsLoadingPin(true);
            setPinError(null);

            try {
                const result = await pinterestService.getPinById(pinId);
                if (cancelled) return;

                if (!result) {
                    setPinError('Dibujo no encontrado');
                    return;
                }

                setPinData(result.pin);
                setBoardData(result.board);

                // Get the proxied image URL for canvas (CORS-safe)
                const coloringUrl = pinterestService.getColoringImageUrl(result.pin);
                setImageUrl(coloringUrl);

                Logger.log('📌 Pin cargado:', result.pin.id, 'Board:', result.board.name);
            } catch (err) {
                if (!cancelled) {
                    setPinError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingPin(false);
                }
            }
        }

        loadPin();
        return () => { cancelled = true; };
    }, [pinId]);

    // Load image into canvas when ready
    const handleCanvasReady = useCallback(() => {
        if (!imageUrl || !canvasRef.current) return;

        Logger.log('🎨 Canvas listo, cargando imagen de Pinterest...');

        const canvas = canvasRef.current;
        if (canvas.loadBackgroundImage) {
            canvas.loadBackgroundImage(imageUrl);
        }
    }, [imageUrl]);

    // Tool change handlers
    const handleToolChange = useCallback((newTool) => {
        if (currentTool !== 'eyedropper') {
            setPreviousTool(currentTool);
        }
        setCurrentTool(newTool);
    }, [currentTool]);

    const handleColorPicked = useCallback((color) => {
        setBrushColor(color);
        const toolToReturn = previousTool === 'eyedropper' ? 'brush' : previousTool;
        setCurrentTool(toolToReturn);
    }, [previousTool]);

    const onSaveDrawing = useCallback(() => {
        const result = handleSaveDrawing();
        if (result.success) {
            showSuccess(result.message);
        } else {
            showError(result.message);
        }
    }, [handleSaveDrawing, showSuccess, showError]);

    const handleSaveToCloud = useCallback(async () => {
        if (!isLoggedIn) {
            setIsAuthOpen(true);
            return;
        }
        const dateKey = new Date().toISOString().split('T')[0];
        const { error } = await supabase.from('drawings').upsert({
            user_id: user.id,
            date_key: dateKey,
            prompt: pinData?.title || null,
            theme: boardData?.name || null,
            color_layer_url: null,
            brush_strokes: 0,
            time_spent_seconds: 0,
        }, { onConflict: 'user_id,date_key' });

        if (error) {
            showError('Error al guardar en tu cuenta');
        } else {
            showSuccess('¡Guardado en tu cuenta!');
        }
    }, [isLoggedIn, user, pinData, boardData, showSuccess, showError]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    handleUndo();
                } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                    e.preventDefault();
                    handleRedo();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    if (isLoadingPin) {
        return (
            <div className="coloring-page">
                <Tiles rows={100} cols={40} tileSize="lg" />
                <header className="coloring-header">
                    <Link to="/galeria" className="coloring-logo-link">
                        <img src="/Letras web.png" alt="ColorEveryday" className="coloring-logo" />
                    </Link>
                </header>
                <div className="coloring-loading">
                    <div className="coloring-spinner"></div>
                    <p>Cargando dibujo...</p>
                </div>
            </div>
        );
    }

    if (pinError || !pinData) {
        return (
            <div className="coloring-page">
                <Tiles rows={100} cols={40} tileSize="lg" />
                <header className="coloring-header">
                    <Link to="/galeria" className="coloring-logo-link">
                        <img src="/Letras web.png" alt="ColorEveryday" className="coloring-logo" />
                    </Link>
                </header>
                <div className="coloring-error">
                    <p>❌ {pinError || 'Dibujo no encontrado'}</p>
                    <button className="coloring-back-btn" onClick={() => navigate(-1)}>
                        ← Volver a la galería
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="coloring-page">
            <Tiles rows={100} cols={40} tileSize="lg" />
            <header className="coloring-header">
                <Link to="/galeria" className="coloring-logo-link">
                    <img src="/Letras web.png" alt="ColorEveryday" className="coloring-logo" />
                </Link>
                <div className="coloring-nav-bar">
                    <button className="coloring-nav-back" onClick={() => navigate(`/galeria/${boardData?.slug || ''}`)}>
                        ← {boardData?.name || 'Galería'}
                    </button>
                    {pinData.link && (
                        <a
                            href={pinData.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="coloring-pinterest-link"
                            title="Ver en Pinterest"
                        >
                            <img src="/Icons/web/pinterest.png" alt="Pinterest" style={{ width: '20px', height: '20px', objectFit: 'contain', marginRight: '5px' }} /> Pinterest
                        </a>
                    )}
                </div>
            </header>

            <main className="coloring-main">
                <div className="coloring-workspace">
                    <ToolBarHorizontal
                        onToolChange={handleToolChange}
                        onBrushSizeChange={setBrushSize}
                        onColorChange={setBrushColor}
                        onClearCanvas={handleClearCanvas}
                        onShowControls={() => { }}
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
                        onSaveToCloud={handleSaveToCloud}
                        isLoggedIn={isLoggedIn}
                    />

                    <div className="coloring-canvas-container">
                        <div className="coloring-canvas-panel">
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
            </main>

            {/* Clear confirmation */}
            <ConfirmationModal
                isOpen={showClearConfirmation}
                onClose={handleCancelClear}
                onConfirm={handleConfirmClear}
                title="Confirmar borrado"
                message="¿Estás seguro de que quieres borrar completamente tu dibujo? Esta acción no se puede deshacer."
                confirmText="Sí, borrar"
                cancelText="Cancelar"
                type="danger"
            />

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
    );
}

export default PinterestColoringView;
