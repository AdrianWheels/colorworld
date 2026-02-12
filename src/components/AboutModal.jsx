import { useTranslation } from 'react-i18next';
import './AboutModal.css';

const AboutModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-header">
          <h2>{t('app.about.title')}</h2>
          <button className="close-button" onClick={onClose} aria-label={t('app.about.close')}>×</button>
        </div>

        <div className="about-content">
          <div className="about-section">
            <h3>{t('app.about.whatIs.title')}</h3>
            <p>
              {t('app.about.whatIs.description')}
            </p>
          </div>

          <div className="about-section">
            <h3>{t('app.about.tech.title')}</h3>
            <p>
              {t('app.about.tech.description')}
            </p>
          </div>

          <div className="about-section">
            <h3>{t('app.about.features.title')}</h3>
            <ul>
              <li><strong>{t('app.about.features.daily').split(':')[0]}:</strong>{t('app.about.features.daily').split(':')[1]}</li>
              <li><strong>{t('app.about.features.free').split(':')[0]}:</strong>{t('app.about.features.free').split(':')[1]}</li>
              <li><strong>{t('app.about.features.multi').split(':')[0]}:</strong>{t('app.about.features.multi').split(':')[1]}</li>
              <li><strong>{t('app.about.features.save').split(':')[0]}:</strong>{t('app.about.features.save').split(':')[1]}</li>
              <li><strong>{t('app.about.features.tools').split(':')[0]}:</strong>{t('app.about.features.tools').split(':')[1]}</li>
            </ul>
          </div>

          <div className="about-section">
            <h3>{t('app.about.mission.title')}</h3>
            <p>
              {t('app.about.mission.description')}
            </p>
          </div>

          <div className="about-section about-footer">
            <p>
              <strong>{t('main.loading').split(' ')[1].replace('...', '')}Everyday</strong> - {t('app.about.footer.tagline')}
            </p>
            <p className="about-date">{t('app.about.footer.copyright')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;