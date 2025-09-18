import { useState } from 'react';
import '../styles/ToolBar.css';

const ToolBar = ({ 
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

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#90EE90', '#FFB6C1'
  ];

  const brushSizes = [2, 5, 10, 15, 20, 30];

  const handleToolChange = (tool) => {
    onToolChange(tool);
  };

  const handleColorChange = (color) => {
    onColorChange(color);
    setShowColorPicker(false);
  };

  const handleBrushSizeChange = (size) => {
    onBrushSizeChange(size);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Herramientas</h3>
        <div className="tools">
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
            🧹
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Tamaño del Pincel</h3>
        <div className="brush-sizes">
          {brushSizes.map(size => (
            <button
              key={size}
              className={`size-btn ${currentBrushSize === size ? 'active' : ''}`}
              onClick={() => handleBrushSizeChange(size)}
              title={`Tamaño ${size}`}
            >
              <div 
                className="size-indicator" 
                style={{ 
                  width: `${Math.min(size, 20)}px`, 
                  height: `${Math.min(size, 20)}px` 
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Colores</h3>
        <div className="color-section">
          <button 
            className="current-color-btn"
            onClick={() => setShowColorPicker(!showColorPicker)}
            style={{ backgroundColor: currentColor }}
            title="Selector de color"
          />
          
          {showColorPicker && (
            <div className="color-picker">
              <div className="color-grid">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`color-btn ${currentColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    title={color}
                  />
                ))}
              </div>
              <input
                type="color"
                value={currentColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="custom-color-input"
                title="Color personalizado"
              />
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Acciones</h3>
        <div className="actions">
          <button 
            className="action-btn clear-btn"
            onClick={onClearCanvas}
            title="Limpiar lienzo"
          >
            🗑️ Limpiar
          </button>
          <button 
            className="action-btn print-btn"
            onClick={onPrintCanvas}
            title="Imprimir dibujo"
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolBar;