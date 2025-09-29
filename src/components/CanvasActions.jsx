import React from 'react';
import '../styles/CanvasActions.css';

const CanvasActions = ({ 
  onSave, 
  canSave = true
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
    </div>
  );
};

export default CanvasActions;