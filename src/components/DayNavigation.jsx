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

  // Verificar si se puede ir al día anterior (no antes del 1 de octubre de 2025)
  const canGoToPreviousDay = () => {
    const launchDate = new Date('2025-10-01');
    const previousDate = new Date(selectedDate);
    previousDate.setDate(previousDate.getDate() - 1);
    return previousDate >= launchDate;
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
      case 'available': return ''; // Quitar texto, solo mostrar ícono
      case 'empty': return 'Sin imagen';
      default: return '';
    }
  };

  return (
    <div className="day-navigation">
      <button 
        onClick={onPreviousDay}
        className={`nav-btn prev-btn ${!canGoToPreviousDay() ? 'disabled' : ''}`}
        disabled={!canGoToPreviousDay()}
        title={canGoToPreviousDay() ? "Día anterior" : "No se puede ir antes del lanzamiento (1 oct 2025)"}
      >
        ← Anterior
      </button>
      
      <div className="current-day">
        <div className="day-status">
          <span className="status-icon">{getStatusIcon()}</span>
          {getStatusText() && <span className="status-text">{getStatusText()}</span>}
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