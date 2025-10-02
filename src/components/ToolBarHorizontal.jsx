import { useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/ToolBarHorizontal.css';

const ToolBarHorizontal = ({ 
  onToolChange, 
  onBrushSizeChange, 
  onColorChange, 
  onClearCanvas, 
  onShowControls,
  onSave,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  canSave = false,
  currentTool = 'brush',
  currentColor = '#000000',
  currentBrushSize = 5
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [previewColor, setPreviewColor] = useState(null);

  const colors = [
    '#000000', // Negro clásico
    '#FF6600', // Naranja calabaza
    '#8B0000', // Rojo sangre
    '#4B0082', // Índigo oscuro
    '#FF8C00', // Naranja oscuro
    '#800080', // Púrpura
    '#228B22', // Verde bosque
    '#FFD700', // Dorado
    '#8B4513', // Marrón saddle
    '#2F4F4F', // Gris pizarra oscuro
    '#DC143C', // Carmesí
    '#9932CC', // Violeta oscuro
    '#B8860B', // Dorado oscuro
    '#556B2F', // Verde oliva oscuro
    '#FFFFFF'  // Blanco fantasma
  ];

  const handleToolChange = (tool) => {
    onToolChange(tool);
  };

  const handleColorChange = (color) => {
    onColorChange(color);
    setShowColorPicker(false);
    setPreviewColor(null);
  };

  const handleColorPreview = (color) => {
    setPreviewColor(color);
  };

  const handleColorConfirm = (color) => {
    handleColorChange(color);
  };

  const handleColorPickerClose = () => {
    setShowColorPicker(false);
    setPreviewColor(null);
  };

  const handleBrushSizeChange = (size) => {
    onBrushSizeChange(parseInt(size));
  };

  return (
    <div className="toolbar-horizontal">
      {/* Herramientas principales */}
      <div className="toolbar-section tools-section">
        <button 
          className={`tool-btn ${currentTool === 'brush' ? 'active' : ''}`}
          onClick={() => handleToolChange('brush')}
          title="Pincel"
        >
          🖌️
        </button>
        <button 
          className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
          onClick={() => handleToolChange('eraser')}
          title="Goma de borrar"
        >
          🧽
        </button>
        <button 
          className={`tool-btn ${currentTool === 'eyedropper' ? 'active' : ''}`}
          onClick={() => handleToolChange('eyedropper')}
          title="Cuenta gotas - Seleccionar color del lienzo"
        >
          💧
        </button>
      </div>

      {/* Botones de undo/redo */}
      <div className="toolbar-section undo-redo-section">
        <button 
          className={`tool-btn ${!canUndo ? 'disabled' : ''}`}
          onClick={onUndo}
          disabled={!canUndo}
          title="Deshacer"
        >
          ↶
        </button>
        <button 
          className={`tool-btn ${!canRedo ? 'disabled' : ''}`}
          onClick={onRedo}
          disabled={!canRedo}
          title="Rehacer"
        >
          ↷
        </button>
      </div>

      {/* Tamaño del pincel */}
      <div className="toolbar-section size-section">
        <span className="section-label">Grosor:</span>
        <div className="brush-size-slider">
          <input
            type="range"
            min="1"
            max="50"
            value={currentBrushSize}
            onChange={(e) => handleBrushSizeChange(e.target.value)}
            className="size-slider"
          />
          <span className="size-value">{currentBrushSize}px</span>
        </div>
      </div>

      {/* Selector de color */}
      <div className="toolbar-section color-section">
        <span className="section-label">Color:</span>
        <div className="color-picker-container">
          <button 
            className={`current-color-btn ${previewColor ? 'preview' : ''}`}
            style={{ backgroundColor: previewColor || currentColor }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Seleccionar color"
          />
          
          {showColorPicker && createPortal(
            <>
              <div 
                className="color-palette-overlay" 
                onClick={handleColorPickerClose}
              />
              <div className="color-palette">
                <div className="color-palette-header">
                  <span>Seleccionar Color</span>
                  <button 
                    className="close-palette-btn"
                    onClick={handleColorPickerClose}
                  >
                    ✕
                  </button>
                </div>
                <div className="color-palette-info">
                  <small>Pasa el mouse para previsualizar, haz clic para seleccionar</small>
                </div>
                {colors.map(color => (
                  <button
                    key={color}
                    className={`color-btn ${currentColor === color ? 'selected' : ''} ${previewColor === color ? 'preview' : ''}`}
                    style={{ backgroundColor: color }}
                    onMouseEnter={() => handleColorPreview(color)}
                    onMouseLeave={() => setPreviewColor(null)}
                    onClick={() => handleColorConfirm(color)}
                    title={`Color ${color}`}
                  />
                ))}
                <div className="custom-color-section">
                  <label htmlFor="custom-color" className="custom-color-label">
                    🎨 ¡Crea tu color!
                  </label>
                  <input
                    id="custom-color"
                    type="color"
                    value={previewColor || currentColor}
                    onChange={(e) => {
                      handleColorPreview(e.target.value);
                    }}
                    onBlur={(e) => {
                      handleColorConfirm(e.target.value);
                    }}
                    className="custom-color-input"
                    title="Selecciona cualquier color personalizado"
                  />
                </div>
              </div>
            </>,
            document.body
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="toolbar-section actions-section">
        <button 
          className={`action-btn save-btn ${!canSave ? 'disabled' : ''}`}
          onClick={onSave}
          disabled={!canSave}
          title="Guardar dibujo coloreado"
        >
          💾
        </button>
        <button 
          className="action-btn clear-btn"
          onClick={onClearCanvas}
          title="Limpiar lienzo"
        >
          🗑️
        </button>
        <button 
          className="action-btn controls-btn"
          onClick={onShowControls}
          title="Ver controles y configuración"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
};

export default ToolBarHorizontal;