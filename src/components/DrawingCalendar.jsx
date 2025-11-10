import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import staticImageService from '../services/staticImageService';
import Logger from '../utils/logger';
import '../styles/DrawingCalendar.css';

const DrawingCalendar = () => {
  const [imagesByMonth, setImagesByMonth] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  useEffect(() => {
    loadAllImages();
  }, []);

  const loadAllImages = async () => {
    try {
      setIsLoading(true);
      const index = await staticImageService.loadImagesIndex();
      
      // Organizar imágenes por mes
      const organized = {};
      
      Object.entries(index.images).forEach(([dateKey, images]) => {
        if (images && images.length > 0) {
          const date = new Date(dateKey);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!organized[monthKey]) {
            organized[monthKey] = [];
          }
          
          organized[monthKey].push({
            ...images[0],
            dateKey,
            date
          });
        }
      });

      // Ordenar imágenes dentro de cada mes
      Object.keys(organized).forEach(monthKey => {
        organized[monthKey].sort((a, b) => b.date - a.date);
      });

      setImagesByMonth(organized);
      
      // Seleccionar el mes más reciente por defecto
      const months = Object.keys(organized).sort().reverse();
      if (months.length > 0) {
        setSelectedMonth(months[0]);
      }
      
      setIsLoading(false);
    } catch (err) {
      Logger.error('Error cargando calendario:', err);
      setError('No se pudieron cargar los dibujos');
      setIsLoading(false);
    }
  };

  const getMonthName = (monthKey) => {
    const [year, month] = monthKey.split('-');
    return `${month}/${year}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short'
    });
  };

  if (isLoading) {
    return (
      <div className="calendar-container">
        <header className="calendar-header">
          <Link to="/" className="back-button">← Volver</Link>
          <img src="/Letras web.png" alt="ColorEveryday" className="calendar-logo" />
        </header>
        <div className="calendar-loading">
          <div className="loading-spinner"></div>
          <p>Cargando calendario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-container">
        <header className="calendar-header">
          <Link to="/" className="back-button">← Volver</Link>
          <img src="/Letras web.png" alt="ColorEveryday" className="calendar-logo" />
        </header>
        <div className="calendar-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const months = Object.keys(imagesByMonth).sort().reverse();
  const currentMonthImages = selectedMonth ? imagesByMonth[selectedMonth] : [];

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <Link to="/" className="back-button">← Volver</Link>
        <img src="/Letras web.png" alt="ColorEveryday" className="calendar-logo" />
      </header>

      <div className="calendar-content">
        {/* Selector de meses */}
        <div className="month-selector">
          {months.map(monthKey => (
            <button
              key={monthKey}
              className={`month-button ${selectedMonth === monthKey ? 'active' : ''}`}
              onClick={() => setSelectedMonth(monthKey)}
            >
              {getMonthName(monthKey)}
              <span className="month-count">{imagesByMonth[monthKey].length}</span>
            </button>
          ))}
        </div>

        {/* Grid de imágenes */}
        <div className="images-grid">
          {currentMonthImages.length === 0 ? (
            <p className="no-images">No hay dibujos disponibles para este mes</p>
          ) : (
            currentMonthImages.map((image, index) => (
              <Link 
                key={`${image.dateKey}-${index}`} 
                to={`/?date=${image.dateKey}`}
                className="image-card"
              >
                <div className="image-wrapper">
                  <img 
                    src={image.url} 
                    alt={`${image.theme} - ${formatDate(image.dateKey)}`}
                    className="calendar-image"
                    loading="lazy"
                  />
                </div>
                <div className="image-info">
                  <p className="image-theme">{image.theme}</p>
                  <p className="image-date">{formatDate(image.dateKey)}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawingCalendar;
