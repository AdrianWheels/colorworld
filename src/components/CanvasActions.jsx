import React from 'react';
import '../styles/CanvasActions.css';

const CanvasActions = ({ 
  onSave, 
  onGenerate, 
  onShowHelp, 
  canSave = true, 
  isGenerating = false 
}) => {
  return (
    <div className="canvas-actions">
      <button 
        onClick={onSave}
        className="action-btn save-btn"
        disabled={!canSave}
        title="Guardar dibujo coloreado"
      >
        💾 Guardar Dibujo
      </button>
      
      <button 
        onClick={onGenerate}
        className="action-btn generate-btn"
        disabled={isGenerating}
        title="Generar nuevo dibujo"
      >
        {isGenerating ? '🔄 Generando...' : '🎲 Nuevo Dibujo'}
      </button>
      
      <button 
        onClick={onShowHelp}
        className="action-btn help-btn"
        title="Ver controles y ayuda"
      >
        ❓ Ayuda
      </button>
    </div>
  );
};

export default CanvasActions;