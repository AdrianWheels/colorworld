import Logger from './logger.js';
import { getColorAtPosition } from './canvasUtils.js';
import { floodFill, calculateDynamicTolerance } from './floodFillUtils.js';

/**
 * ToolHandler - Utilidad unificada para manejo de herramientas de dibujo
 * 
 * Esta utilidad implementa el patrón "Guardar Antes" consistentemente para todas las herramientas,
 * permitiendo fácil extensibilidad y mantenimiento del sistema de undo/redo.
 */
export class ToolHandler {
  constructor({
    drawingCanvasRef,
    backgroundCanvasRef,
    compositeCanvasRef,
    updateImmediately,
    executeWithUndo
  }) {
    this.drawingCanvasRef = drawingCanvasRef;
    this.backgroundCanvasRef = backgroundCanvasRef;
    this.compositeCanvasRef = compositeCanvasRef;
    this.updateImmediately = updateImmediately;
    this.executeWithUndo = executeWithUndo;
    
    // Estado interno para tracking de dibujo
    this.isDrawing = false;
    this.hasDrawnInStroke = false;
  }

  /**
   * Inicia el uso de una herramienta en las coordenadas especificadas
   */
  startTool(tool, coords, options = {}) {
    const { brushColor, onColorPicked } = options;

    Logger.log(`🔧 INICIANDO HERRAMIENTA: ${tool}`, coords);

    switch (tool) {
      case 'eyedropper':
        return this._handleEyedropper(coords, onColorPicked);
      
      case 'bucket':
        return this._handleBucket(coords, brushColor);
      
      case 'brush':
      case 'eraser':
        return this._handleBrushStart(tool, coords);
      
      default:
        Logger.warn(`⚠️ Herramienta desconocida: ${tool}`);
        return false;
    }
  }

  /**
   * Continúa el dibujo (para herramientas de trazo como brush/eraser)
   */
  continueTool(tool, coords, options = {}) {
    if (!this.isDrawing) return false;

    const { brushColor, brushSize } = options;

    switch (tool) {
      case 'brush':
      case 'eraser':
        return this._handleBrushContinue(tool, coords, brushColor, brushSize);
      
      default:
        return false;
    }
  }

  /**
   * Finaliza el uso de la herramienta
   */
  endTool(tool) {
    if (!this.isDrawing) return;

    Logger.log(`🛑 FINALIZANDO HERRAMIENTA: ${tool}`);
    
    this.isDrawing = false;
    this.hasDrawnInStroke = false;
    
    if (this.drawingCanvasRef.current) {
      const ctx = this.drawingCanvasRef.current.getContext('2d');
      ctx.beginPath();
    }
    
    this.updateImmediately();
  }

  // Métodos privados para cada herramienta

  _handleEyedropper(coords, onColorPicked) {
    const pickedColor = getColorAtPosition(this.compositeCanvasRef, coords.x, coords.y);
    if (pickedColor && onColorPicked) {
      Logger.log('🎨 COLOR SELECCIONADO:', pickedColor);
      onColorPicked(pickedColor);
      return true;
    }
    return false;
  }

  _handleBucket(coords, brushColor) {
    return this.executeWithUndo(() => {
      const dynamicTolerance = calculateDynamicTolerance(this.compositeCanvasRef, coords.x, coords.y);
      
      const floodFillOptions = {
        connectivity: 4,
        tolerance: dynamicTolerance,
        enableLogs: typeof window !== 'undefined' && window.location.hostname === 'localhost'
      };
      
      const success = floodFill(
        coords.x, 
        coords.y, 
        brushColor, 
        this.backgroundCanvasRef,
        this.drawingCanvasRef,
        this.compositeCanvasRef,
        this.updateImmediately,
        floodFillOptions
      );
      
      if (success) {
        Logger.log('✅ Bucket fill completado');
      }
      
      return success;
    });
  }

  _handleBrushStart(tool, coords) {
    if (!this.drawingCanvasRef.current) return false;

    // USAR EJECUTEWITHUNDO PARA CONSISTENCIA TOTAL
    return this.executeWithUndo(() => {
      this.isDrawing = true;
      this.hasDrawnInStroke = false;
      
      const ctx = this.drawingCanvasRef.current.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      
      Logger.log(`✅ ${tool} iniciado con undo habilitado`);
      return true;
    });
  }

  _handleBrushContinue(tool, coords, brushColor, brushSize) {
    if (!this.drawingCanvasRef.current) return false;
    
    const ctx = this.drawingCanvasRef.current.getContext('2d');
    
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
    
    if (!this.hasDrawnInStroke) {
      Logger.log(`✏️ Primer trazo detectado en ${tool}`);
      this.hasDrawnInStroke = true;
    }
    
    return true;
  }

  /**
   * Método para agregar nuevas herramientas fácilmente
   */
  addCustomTool(toolName, toolHandler) {
    this[`_handle${toolName.charAt(0).toUpperCase() + toolName.slice(1)}`] = toolHandler;
    Logger.log(`🔧 Nueva herramienta registrada: ${toolName}`);
  }

  // Getters para estado
  get isToolActive() {
    return this.isDrawing;
  }

  get hasDrawn() {
    return this.hasDrawnInStroke;
  }
}

export default ToolHandler;