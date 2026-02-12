import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tiles } from './Tiles';
import '../styles/NotFound.css';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="notfound-container">
      <Tiles rows={40} cols={30} tileSize="lg" />
      <div className="notfound-content">
        <img
          src="/Cosmo.png"
          alt={t('notfound.alt')}
          className="cosmo-404"
        />
        <h1 className="notfound-title">{t('notfound.title')}</h1>
        <p className="notfound-message">
          {t('notfound.message')}
        </p>
        <div className="notfound-error">404</div>
        <Link to="/" className="notfound-button">
          {t('notfound.button')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
