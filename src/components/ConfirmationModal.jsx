import React from 'react';
import '../styles/ConfirmationModal.css';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmar acción',
  message = '¿Estás seguro de que quieres continuar?',
  confirmText = 'Sí, continuar',
  cancelText = 'Cancelar',
  type = 'warning' // 'warning', 'danger', 'info'
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'warning':
      default:
        return '❓';
    }
  };

  return (
    <div className="confirmation-modal-overlay" onClick={handleBackdropClick}>
      <div className={`confirmation-modal ${type}`}>
        <div className="modal-header">
          <div className="modal-icon">{getIcon()}</div>
          <h3 className="modal-title">{title}</h3>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-footer">
          <button 
            className="modal-btn cancel-btn"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`modal-btn confirm-btn ${type}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;