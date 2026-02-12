import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/DayNavigation.css';

const DayNavigation = ({
  selectedDate,
  onPreviousDay,
  onNextDay
}) => {
  const { t } = useTranslation();
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

  return (
    <div className="day-navigation">
      <button
        onClick={onPreviousDay}
        className={`nav-btn prev-btn ${!canGoToPreviousDay() ? 'disabled' : ''}`}
        disabled={!canGoToPreviousDay()}
        title={canGoToPreviousDay() ? t('app.nav.prev') : t('app.nav.prevDisabled')}
      >
        {t('app.nav.previous')}
      </button>

      <div className="current-day">
        <div className="day-date">
          {formatDate(selectedDate)}
        </div>
      </div>

      <button
        onClick={onNextDay}
        className={`nav-btn next-btn ${!canGoToNextDay() ? 'disabled' : ''}`}
        disabled={!canGoToNextDay()}
        title={canGoToNextDay() ? t('app.nav.next') : t('app.nav.nextDisabled')}
      >
        {t('app.nav.nextLabel')}
      </button>
    </div>
  );
};

export default DayNavigation;
