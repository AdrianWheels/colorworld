import React, { useState, useEffect } from 'react';
import '../styles/ControlsModal.css';

const ControlsModal = ({ isOpen, onClose }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                             ('ontouchstart' in window) || 
                             (window.innerWidth <= 768);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎨 Controles del Canvas</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          {isMobile ? (
            // Controles para móviles
            <>
              <div className="control-section">
                <h3>📱 Controles Táctiles</h3>
                <div className="control-item">
                  <span className="control-key">Un Dedo</span>
                  <span className="control-desc">Dibujar/Colorear</span>
                </div>
                <div className="control-item">
                  <span className="control-key">Dos Dedos</span>
                  <span className="control-desc">Pellizcar para Zoom</span>
                </div>
                <div className="control-item">
                  <span className="control-key">Arrastrar (2 dedos)</span>
                  <span className="control-desc">Mover el canvas</span>
                </div>
              </div>

              <div className="control-section">
                <h3>🎯 Herramientas</h3>
                <div className="control-item">
                  <span className="control-key">Pincel �️</span>
                  <span className="control-desc">Toca para seleccionar y colorear</span>
                </div>
                <div className="control-item">
                  <span className="control-key">Borrador 🧽</span>
                  <span className="control-desc">Elimina tus trazos</span>
                </div>
                <div className="control-item">
                  <span className="control-key">Colores 🎨</span>
                  <span className="control-desc">Toca el círculo de color para cambiar</span>
                </div>
              </div>

              <div className="control-section">
                <h3>🔄 Acciones</h3>
                <div className="control-item">
                  <span className="control-key">Deshacer ↶</span>
                  <span className="control-desc">Toca el botón de deshacer</span>
                </div>
                <div className="control-item">
                  <span className="control-key">Rehacer ↷</span>
                  <span className="control-desc">Toca el botón de rehacer</span>
                </div>
              </div>
            </>
          ) : (
            // Controles para desktop
            <>
              <div className="control-section">
                <h3>�🖱️ Controles del Ratón</h3>
                <div className="control-item">
                  <span className="control-key">Clic Izquierdo</span>
                  <span className="control-desc">Dibujar/Colorear</span>
                </div>
                <div className="control-item">
                  <span className="control-key">Clic Derecho + Arrastrar</span>
                  <span className="control-desc">Mover el canvas</span>
                </div>
                <div className="control-item">
                  <span className="control-key">Rueda del Ratón</span>
                  <span className="control-desc">Zoom In/Out</span>
                </div>
              </div>

              <div className="control-section">
                <h3>⌨️ Atajos de Teclado</h3>
                <div className="control-item">
                  <span className="control-key">Ctrl + Z</span>
                  <span className="control-desc">Deshacer</span>
                </div>
                <div className="control-item">
                  <span className="control-key">Ctrl + Y</span>
                  <span className="control-desc">Rehacer</span>
                </div>
                <div className="control-item">
                  <span className="control-key">← →</span>
                  <span className="control-desc">Navegar días</span>
                </div>
              </div>

              <div className="control-section">
                <h3>🎯 Herramientas</h3>
                <div className="control-item">
                  <span className="control-key">Pincel</span>
                  <span className="control-desc">Tamaño ajustable para colorear</span>
                </div>
                <div className="control-item">
                  <span className="control-key">Borrador</span>
                  <span className="control-desc">Eliminar trazos</span>
                </div>
                <div className="control-item">
                  <span className="control-key">Colores</span>
                  <span className="control-desc">Paleta completa disponible</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <p className="modal-tip">
            💡 <strong>Tip:</strong> Las líneas negras del dibujo no se pueden borrar - ¡son para guiarte! 
            {isMobile && ' El canvas mantiene su tamaño original para mejor calidad.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ControlsModal;