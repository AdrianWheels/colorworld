import React from 'react';
import '../styles/DayNavigation.css';

const DayNavigation = ({ 
  selectedDate, 
  onPreviousDay, 
  onNextDay, 
  dayImageStatus 
}) => {
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Verificar si se puede ir al día siguiente (no futuro)
  const canGoToNextDay = () => {
    const today = new Date();
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate <= today;
  };

  const getStatusIcon = () => {
    switch (dayImageStatus) {
      case 'loading': return '⏳';
      case 'available': return '🎨';
      case 'empty': return '📝';
      default: return '📅';
    }
  };

  const getStatusText = () => {
    switch (dayImageStatus) {
      case 'loading': return 'Cargando...';
      case 'available': return 'Imagen disponible';
      case 'empty': return 'Sin imagen';
      default: return 'Selecciona un día';
    }
  };

  return (
    <div className="day-navigation">
      <button 
        onClick={onPreviousDay}
        className="nav-btn prev-btn"
        title="Día anterior"
      >
        ← Anterior
      </button>
      
      <div className="current-day">
        <div className="day-status">
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text">{getStatusText()}</span>
        </div>
        <div className="day-date">
          {formatDate(selectedDate)}
        </div>
      </div>
      
      <button 
        onClick={onNextDay}
        className={`nav-btn next-btn ${!canGoToNextDay() ? 'disabled' : ''}`}
        disabled={!canGoToNextDay()}
        title={canGoToNextDay() ? "Día siguiente" : "No se puede ir al futuro"}
      >
        Siguiente →
      </button>
    </div>
  );
};

export default DayNavigation;