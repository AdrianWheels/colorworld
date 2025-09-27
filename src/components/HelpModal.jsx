import React from 'react';
import '../styles/HelpModal.css';

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="help-modal-overlay" onClick={handleOverlayClick}>
      <div className="help-modal-content">
        <div className="help-modal-header">
          <h2 className="help-modal-title">🎮 Controles de ColorEveryday</h2>
          <button className="help-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="help-modal-body">
          <div className="help-section">
            <h3 className="help-section-title">🖱️ Controles del Mouse</h3>
            <div className="help-controls-grid">
              <div className="help-control-item">
                <div className="help-control-icon primary">🖱️</div>
                <div className="help-control-info">
                  <strong>Clic Primario</strong>
                  <p>Pintar en el canvas</p>
                </div>
              </div>
              
              <div className="help-control-item">
                <div className="help-control-icon secondary">🖱️</div>
                <div className="help-control-info">
                  <strong>Clic Secundario</strong>
                  <p>Mover y desplazar el canvas</p>
                </div>
              </div>
              
              <div className="help-control-item">
                <div className="help-control-icon scroll">🎡</div>
                <div className="help-control-info">
                  <strong>Rueda del Mouse</strong>
                  <p>Zoom in/out en el canvas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="help-section">
            <h3 className="help-section-title">⌨️ Atajos de Teclado</h3>
            <div className="help-shortcuts-grid">
              <div className="help-shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>Z</kbd>
                <span>Deshacer</span>
              </div>
              <div className="help-shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>Y</kbd>
                <span>Rehacer</span>
              </div>
              <div className="help-shortcut-item">
                <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd>
                <span>Rehacer (alternativo)</span>
              </div>
            </div>
          </div>

          <div className="help-section">
            <h3 className="help-section-title">🎨 Herramientas Disponibles</h3>
            <div className="help-tools-list">
              <div className="help-tool-item">
                <span className="tool-icon">🖌️</span>
                <strong>Pincel:</strong> Para dibujar líneas suaves
              </div>
              <div className="help-tool-item">
                <span className="tool-icon">✏️</span>
                <strong>Lápiz:</strong> Para líneas más precisas
              </div>
              <div className="help-tool-item">
                <span className="tool-icon">🧽</span>
                <strong>Borrador:</strong> Para eliminar trazos
              </div>
              <div className="help-tool-item">
                <span className="tool-icon">🎨</span>
                <strong>Selector de Color:</strong> Elige colores del canvas
              </div>
            </div>
          </div>
        </div>

        <div className="help-modal-footer">
          <p className="help-footer-text">
            💡 <strong>Consejo:</strong> Usa diferentes tamaños de pincel para crear efectos únicos
          </p>
          <button className="help-close-btn" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;