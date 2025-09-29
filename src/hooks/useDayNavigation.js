import { useState, useCallback, useEffect } from 'react';
import drawingService from '../services/drawingService';

export const useDayNavigation = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayImageStatus, setDayImageStatus] = useState(null);

  const navigateToDay = useCallback((direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  }, [selectedDate]);

  const loadDayImage = useCallback(async (canvasRef) => {
    try {
      setDayImageStatus('loading');
      const dateKey = selectedDate.toISOString().split('T')[0];
      const dayImage = await drawingService.getDailyImage(dateKey);
      
      if (dayImage && canvasRef.current) {
        await canvasRef.current.loadBackgroundImage(dayImage.blobUrl);
        setDayImageStatus('available');
        console.log('✅ Imagen cargada para el día:', dateKey);
      } else {
        setDayImageStatus('empty');
        console.log('📭 No hay imagen para el día:', dateKey);
      }
    } catch (error) {
      console.error('❌ Error cargando imagen del día:', error);
      setDayImageStatus('empty');
    }
  }, [selectedDate]);

  const goToPreviousDay = useCallback(() => {
    navigateToDay(-1);
  }, [navigateToDay]);

  const goToNextDay = useCallback(() => {
    // ❌ NO PERMITIR IR AL FUTURO - Solo días pasados desde hoy
    const today = new Date();
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Solo permitir si la siguiente fecha no es futura
    if (nextDate <= today) {
      navigateToDay(1);
    } else {
      console.log('🚫 No se puede navegar al futuro desde hoy');
    }
  }, [navigateToDay, selectedDate]);

  // ✅ CARGAR IMAGEN DEL DÍA ACTUAL AL INICIO
  useEffect(() => {
    console.log('🎯 Hook montado - fecha inicial:', selectedDate.toISOString().split('T')[0]);
    // El useEffect de App.jsx se encargará de cargar la imagen automáticamente
  }, [selectedDate]); // Observar cambios en selectedDate

  return {
    selectedDate,
    setSelectedDate,
    dayImageStatus,
    setDayImageStatus,
    loadDayImage,
    goToPreviousDay,
    goToNextDay
  };
};