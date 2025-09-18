import { useState } from 'react';
import '../styles/ToolBarHorizontal.css';

const ToolBarHorizontal = ({ 
  onToolChange, 
  onBrushSizeChange, 
  onColorChange, 
  onClearCanvas, 
  onPrintCanvas,
  currentTool = 'brush',
  currentColor = '#000000',
  currentBrushSize = 5
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [previewColor, setPreviewColor] = useState(null);

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#90EE90', '#FFB6C1'
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
          
          {showColorPicker && (
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
                <input
                  type="color"
                  value={previewColor || currentColor}
                  onChange={(e) => {
                    handleColorPreview(e.target.value);
                  }}
                  onBlur={(e) => {
                    handleColorConfirm(e.target.value);
                  }}
                  className="custom-color-input"
                  title="Color personalizado"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="toolbar-section actions-section">
        <button 
          className="action-btn clear-btn"
          onClick={onClearCanvas}
          title="Limpiar lienzo"
        >
          🗑️
        </button>
        <button 
          className="action-btn save-btn"
          onClick={onPrintCanvas}
          title="Guardar/Imprimir"
        >
          �
        </button>
      </div>
    </div>
  );
};

export default ToolBarHorizontal;