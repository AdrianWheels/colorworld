import { Link } from 'react-router-dom';
import '../styles/NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <img 
          src="/Cosmo.png" 
          alt="Cosmo - Mascota de ColorEveryday" 
          className="cosmo-404"
        />
        <h1 className="notfound-title">¡Ups! Página no encontrada</h1>
        <p className="notfound-message">
          Cosmo no pudo encontrar lo que buscas. 
          Parece que esta página se ha ido a colorear otro lugar.
        </p>
        <div className="notfound-error">404</div>
        <Link to="/" className="notfound-button">
          🏠 Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
