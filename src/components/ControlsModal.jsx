import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/ControlsModal.css';

const ControlsModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
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
          <h2>{t('app.controls.title')}</h2>
          <button className="close-button" onClick={onClose} aria-label={t('app.controls.close')}>✕</button>
        </div>

        <div className="modal-body">
          {isMobile ? (
            // Controles para móviles
            <>
              <div className="control-section">
                <h3>{t('app.controls.mobile.title')}</h3>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.mobile.oneFinger')}</span>
                  <span className="control-desc">{t('app.controls.mobile.draw')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.mobile.twoFingers')}</span>
                  <span className="control-desc">{t('app.controls.mobile.zoom')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.mobile.dragTwo')}</span>
                  <span className="control-desc">{t('app.controls.mobile.move')}</span>
                </div>
              </div>

              <div className="control-section">
                <h3>{t('app.controls.tools.title')}</h3>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.tools.brush')}</span>
                  <span className="control-desc">{t('app.controls.tools.brushDescMobile')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.tools.bucket')}</span>
                  <span className="control-desc">{t('app.controls.tools.bucketDescMobile')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.tools.eraser')}</span>
                  <span className="control-desc">{t('app.controls.tools.eraserDesc')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.tools.eyedropper')}</span>
                  <span className="control-desc">{t('app.controls.tools.eyedropperDescMobile')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.tools.colors')}</span>
                  <span className="control-desc">{t('app.controls.tools.colorsDescMobile')}</span>
                </div>
              </div>

              <div className="control-section">
                <h3>{t('app.controls.actions.title')}</h3>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.actions.undo')}</span>
                  <span className="control-desc">{t('app.controls.actions.undoDesc')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.actions.redo')}</span>
                  <span className="control-desc">{t('app.controls.actions.redoDesc')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.actions.clear')}</span>
                  <span className="control-desc">{t('app.controls.actions.clearDesc')}</span>
                </div>
              </div>
            </>
          ) : (
            // Controles para desktop
            <>
              <div className="control-section">
                <h3>{t('app.controls.desktop.title')}</h3>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.desktop.leftClick')}</span>
                  <span className="control-desc">{t('app.controls.mobile.draw')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.desktop.rightClickPlusDrag')}</span>
                  <span className="control-desc">{t('app.controls.mobile.move')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.desktop.wheel')}</span>
                  <span className="control-desc">{t('app.controls.desktop.zoomInOut')}</span>
                </div>
              </div>

              <div className="control-section">
                <h3>{t('app.controls.shortcuts.title')}</h3>
                <div className="control-item">
                  <span className="control-key">Ctrl + Z</span>
                  <span className="control-desc">{t('app.controls.shortcuts.undo')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">Ctrl + Y</span>
                  <span className="control-desc">{t('app.controls.shortcuts.redo')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">← →</span>
                  <span className="control-desc">{t('app.controls.shortcuts.navigate')}</span>
                </div>
              </div>

              <div className="control-section">
                <h3>{t('app.controls.tools.title')}</h3>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.tools.brush')}</span>
                  <span className="control-desc">{t('app.controls.tools.brushDesc')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.tools.bucket')}</span>
                  <span className="control-desc">{t('app.controls.tools.bucketDesc')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.tools.eraser')}</span>
                  <span className="control-desc">{t('app.controls.tools.eraserDesc')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.tools.eyedropper')}</span>
                  <span className="control-desc">{t('app.controls.tools.eyedropperDesc')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.tools.colors')}</span>
                  <span className="control-desc">{t('app.controls.tools.colorsDesc')}</span>
                </div>
              </div>

              <div className="control-section">
                <h3>{t('app.controls.actions.title')}</h3>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.actions.clear')}</span>
                  <span className="control-desc">{t('app.controls.actions.clearDesc')}</span>
                </div>
                <div className="control-item">
                  <span className="control-key">{t('app.controls.actions.save')}</span>
                  <span className="control-desc">{t('app.controls.actions.saveDesc')}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <p className="modal-tip">
            💡 <strong>{t('app.controls.footer.tip')}</strong> {t('app.controls.footer.message')}
            {isMobile && t('app.controls.footer.mobileQuality')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ControlsModal;