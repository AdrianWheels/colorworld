import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import { Tiles } from './Tiles';
import staticImageService from '../services/staticImageService';
import Logger from '../utils/logger';
import { formatImageTitle } from '../utils/textUtils';
import '../styles/DrawingCalendar.css';

const DrawingCalendar = () => {
  const { t, i18n } = useTranslation();
  const [imagesByMonth, setImagesByMonth] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const ITEMS_PER_PAGE = 24;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadAllImages();
  }, []);

  // Reset page when month changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth]);

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
      setError(t('calendar.error'));
      setIsLoading(false);
    }
  };

  const getMonthName = (monthKey) => {
    const [year, month] = monthKey.split('-');
    return `${parseInt(month)}/${year}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'es' ? 'es-ES' : 'en-US', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  if (isLoading) {
    return (
      <div className="calendar-container">
        <Tiles rows={100} cols={40} tileSize="lg" />
        <Header />
        <div className="calendar-loading">
          <div className="loading-spinner"></div>
          <p>{t('calendar.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar-container">
        <Tiles rows={100} cols={40} tileSize="lg" />
        <Header />
        <div className="calendar-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const months = Object.keys(imagesByMonth).sort().reverse();
  const currentMonthImages = selectedMonth ? imagesByMonth[selectedMonth] : [];

  // Pagination logic
  const totalPages = Math.ceil(currentMonthImages.length / ITEMS_PER_PAGE);
  const displayedImages = currentMonthImages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="calendar-container">
      <Tiles rows={100} cols={40} tileSize="lg" />
      <Header />


      <motion.div
        className="calendar-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
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
        <div className="images-grid compact-grid">
          {displayedImages.length === 0 ? (
            <p className="no-images">{t('calendar.noImages')}</p>
          ) : (
            displayedImages.map((image, index) => (
              <Link
                key={`${image.dateKey}-${index}`}
                to={`/?date=${image.dateKey}`}
                className="image-card compact-card"
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
                  <p className="image-theme">{formatImageTitle(image.theme)}</p>
                  <p className="image-date">{formatDate(image.dateKey)}</p>
                </div>
              </Link>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="gallery-pagination">
            <button
              disabled={currentPage === 1}
              onClick={handlePrevPage}
              className="pagination-btn"
            >
              {t('calendar.pagination.prev')}
            </button>
            <span className="pagination-info">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
              className="pagination-btn"
            >
              {t('calendar.pagination.next')}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DrawingCalendar;
