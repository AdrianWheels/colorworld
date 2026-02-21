import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { getPaletteForDay, getPaletteInfoForDay } from '../data/daily-palettes';
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
  currentBrushSize = 5,
  currentDay = 1, // Día del año (1-365)
  onSaveToCloud,    // new: save to Supabase (or prompt login)
  isLoggedIn = false, // new: to show lock icon vs cloud icon
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [previewColor, setPreviewColor] = useState(null);
  const [customColors, setCustomColors] = useState([]);

  // Obtener la paleta del día actual (10 colores predefinidos)
  const dailyPalette = useMemo(() => {
    return getPaletteForDay(currentDay) || [];
  }, [currentDay]);

  const paletteTheme = useMemo(() => {
    return getPaletteInfoForDay(currentDay)?.tematica || null;
  }, [currentDay]);

  // Combinar: 10 colores del día + 6 slots personalizables = 16 colores total (grid 4x4)
  const colors = useMemo(() => {
    const palette = [...dailyPalette];

    // Agregar colores personalizados hasta completar 6 slots
    const customSlots = 6;
    const currentCustom = customColors.slice(0, customSlots);

    // Rellenar con slots vacíos si no hay suficientes colores personalizados
    while (currentCustom.length < customSlots) {
      currentCustom.push(null); // null = slot vacío
    }

    return [...palette, ...currentCustom];
  }, [dailyPalette, customColors]);

  const handleToolChange = (tool) => {
    onToolChange(tool);
  };

  const handleColorChange = (color) => {
    onColorChange(color);
    setShowColorPicker(false);
    setPreviewColor(null);
  };

  const handleCustomColorSelected = (color) => {
    // Solo agregar si no está ya en la paleta diaria
    if (!dailyPalette.includes(color.toUpperCase())) {
      setCustomColors(prev => {
        // Evitar duplicados
        const filtered = prev.filter(c => c !== color.toUpperCase());
        // Agregar al inicio y mantener máximo 6
        return [color.toUpperCase(), ...filtered].slice(0, 6);
      });
    }
    handleColorChange(color);
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
          <img src="/Icons/web/pincel.png" alt="Pincel" />
        </button>
        <button
          className={`tool-btn ${currentTool === 'spray' ? 'active' : ''}`}
          onClick={() => handleToolChange('spray')}
          title="Spray - Efecto aerosol"
        >
          <img src="/Icons/web/spray.png" alt="Spray" />
        </button>
        <button
          className={`tool-btn ${currentTool === 'bucket' ? 'active' : ''}`}
          onClick={() => handleToolChange('bucket')}
          title="Balde de pintura - Llenar área cerrada"
        >
          <img src="/Icons/web/bucket.png" alt="Balde" />
        </button>
        <button
          className={`tool-btn ${currentTool === 'eraser' ? 'active' : ''}`}
          onClick={() => handleToolChange('eraser')}
          title="Goma de borrar"
        >
          <img src="/Icons/web/eraser.png" alt="Borrador" />
        </button>
        <button
          className={`tool-btn ${currentTool === 'eyedropper' ? 'active' : ''}`}
          onClick={() => handleToolChange('eyedropper')}
          title="Cuenta gotas - Seleccionar color del lienzo"
        >
          <img src="/Icons/web/colorpicker.png" alt="Cuentagotas" />
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
                  <span>Paleta del Día{paletteTheme ? ` · ${paletteTheme}` : ''}</span>
                  <button
                    className="close-palette-btn"
                    onClick={handleColorPickerClose}
                  >
                    ✕
                  </button>
                </div>
                <div className="color-palette-info">
                  <small>10 colores sugeridos + 6 espacios para tus colores personalizados</small>
                </div>
                <div className="color-palette-grid">
                  {colors.map((color, index) => {
                    const isEmpty = color === null;
                    const isDaily = index < 10;

                    if (isEmpty) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="color-btn empty-slot"
                          title="Slot vacío - Usa el selector de color personalizado para agregar"
                        >
                          <span className="empty-slot-icon">+</span>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={`${color}-${index}`}
                        className={`color-btn ${currentColor === color ? 'selected' : ''} ${previewColor === color ? 'preview' : ''} ${isDaily ? 'daily-color' : 'custom-color'}`}
                        style={{ backgroundColor: color }}
                        onMouseEnter={() => handleColorPreview(color)}
                        onMouseLeave={() => setPreviewColor(null)}
                        onClick={() => handleColorConfirm(color)}
                        title={isDaily ? `Color del día: ${color}` : `Tu color: ${color}`}
                      />
                    );
                  })}
                </div>
                <div className="custom-color-section">
                  <label htmlFor="custom-color" className="custom-color-label">
                    🎨 Crea tu color personalizado
                  </label>
                  <input
                    id="custom-color"
                    type="color"
                    value={previewColor || currentColor}
                    onChange={(e) => {
                      handleColorPreview(e.target.value);
                    }}
                    onBlur={(e) => {
                      handleCustomColorSelected(e.target.value);
                    }}
                    className="custom-color-input"
                    title="Selecciona cualquier color - se guardará en los slots personalizados"
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
          className={`tool-btn save-btn ${!canSave ? 'disabled' : ''}`}
          onClick={onSave}
          disabled={!canSave}
          title="Guardar dibujo coloreado"
        >
          <img src="/Icons/web/save.png" alt="Guardar" />
        </button>
        {onSaveToCloud && (
          <button
            className="tool-btn cloud-save-btn"
            onClick={onSaveToCloud}
            title={isLoggedIn ? 'Guardar en mi cuenta' : 'Inicia sesión para guardar en tu cuenta'}
          >
            {isLoggedIn ? '☁️' : '🔒'}
          </button>
        )}
        <button
          className="tool-btn clear-btn"
          onClick={onClearCanvas}
          title="Limpiar lienzo"
        >
          <img src="/Icons/web/trash.png" alt="Limpiar" />
        </button>
        <button
          className="tool-btn controls-btn"
          onClick={onShowControls}
          title="Ver controles y configuración"
        >
          <img src="/Icons/web/options.png" alt="Configuración" />
        </button>
      </div>
    </div>
  );
};

export default ToolBarHorizontal;