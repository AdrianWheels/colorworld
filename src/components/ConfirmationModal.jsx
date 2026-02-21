import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/ConfirmationModal.css';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  onSecondaryAction,
  title,
  message,
  confirmText,
  cancelText,
  secondaryActionText,
  type = 'warning' // 'warning', 'danger', 'info'
}) => {
  const { t } = useTranslation();

  const displayTitle = title || t('app.confirmation.default.title');
  const displayMessage = message || t('app.confirmation.default.message');
  const displayConfirmText = confirmText || t('app.confirmation.default.confirm');
  const displayCancelText = cancelText || t('app.confirmation.default.cancel');

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
          <h3 className="modal-title">{displayTitle}</h3>
        </div>

        <div className="modal-body">
          <p className="modal-message">{displayMessage}</p>
        </div>

        <div className="modal-footer">
          <button
            className="modal-btn cancel-btn"
            onClick={onClose}
          >
            {displayCancelText}
          </button>
          {onSecondaryAction && secondaryActionText && (
            <button
              className="modal-btn secondary-btn"
              onClick={() => { onSecondaryAction(); onClose(); }}
            >
              {secondaryActionText}
            </button>
          )}
          <button
            className={`modal-btn confirm-btn ${type}`}
            onClick={handleConfirm}
          >
            {displayConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;