import { useState } from 'react';
import '../styles/LayerManager.css';

const LayerManager = ({ layers, activeLayer, onLayerChange, onAddLayer, onRemoveLayer, onToggleLayerVisibility }) => {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div className="layer-manager">
      <button 
        className="layer-toggle-btn"
        onClick={() => setShowPanel(!showPanel)}
        title="Gestionar capas"
      >
        🎨 Capas ({layers.length})
      </button>
      
      {showPanel && (
        <div className="layer-panel">
          <div className="layer-panel-header">
            <h3>Capas</h3>
            <button 
              className="close-panel-btn"
              onClick={() => setShowPanel(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="layer-controls">
            <button 
              className="add-layer-btn"
              onClick={onAddLayer}
              title="Agregar nueva capa"
            >
              ➕ Nueva Capa
            </button>
          </div>
          
          <div className="layer-list">
            {layers.map((layer, index) => (
              <div 
                key={layer.id}
                className={`layer-item ${activeLayer === layer.id ? 'active' : ''}`}
                onClick={() => onLayerChange(layer.id)}
              >
                <div className="layer-info">
                  <button
                    className="layer-visibility-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLayerVisibility(layer.id);
                    }}
                    title={layer.visible ? 'Ocultar capa' : 'Mostrar capa'}
                  >
                    {layer.visible ? '👁️' : '🙈'}
                  </button>
                  
                  <div className="layer-details">
                    <span className="layer-name">{layer.name}</span>
                    <span className="layer-type">{layer.type}</span>
                  </div>
                  
                  <div className="layer-actions">
                    <span className="layer-opacity">
                      {Math.round(layer.opacity * 100)}%
                    </span>
                    {layers.length > 1 && layer.type !== 'background' && (
                      <button
                        className="remove-layer-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveLayer(layer.id);
                        }}
                        title="Eliminar capa"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
                
                {activeLayer === layer.id && (
                  <div className="layer-opacity-control">
                    <label>Opacidad:</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={layer.opacity}
                      onChange={(e) => {
                        // TODO: Implementar cambio de opacidad
                        console.log('Cambiar opacidad:', e.target.value);
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="layer-tips">
            <small>💡 Click en una capa para seleccionarla</small>
            <small>👁️ Click en el ojo para mostrar/ocultar</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayerManager;