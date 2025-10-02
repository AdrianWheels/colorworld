import { useState, useCallback, useEffect } from 'react';
import drawingService from '../services/drawingService';
import Logger from '../utils/logger.js';

export const useDayNavigation = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayImageStatus, setDayImageStatus] = useState(null);

  const navigateToDay = useCallback((direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    setSelectedDate(newDate);
  }, [selectedDate]);

  const loadDayImage = useCallback(async (canvasRef) => {
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 100; // 100ms entre reintentos
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        setDayImageStatus('loading');
        const dateKey = selectedDate.toISOString().split('T')[0];
        
        Logger.log(`🎯 Intento ${attempt}/${MAX_RETRIES} - Cargando imagen para: ${dateKey}`);
        const dayImage = await drawingService.getDailyImage(dateKey);
        
        Logger.log('🔍 DEBUG - dayImage recibido:', dayImage);
        Logger.log('🔍 DEBUG - canvasRef.current:', !!canvasRef.current);
        Logger.log('🔍 DEBUG - dayImage.blobUrl:', dayImage?.blobUrl);
        
        if (dayImage && dayImage.blobUrl) {
          if (canvasRef.current) {
            Logger.log('🖼️ Intentando cargar imagen:', dayImage.blobUrl);
            await canvasRef.current.loadBackgroundImage(dayImage.blobUrl);
            setDayImageStatus('available');
            Logger.log('✅ Imagen cargada para el día:', dateKey);
            return; // Éxito, salir del loop
          } else {
            Logger.log(`⏳ Intento ${attempt}/${MAX_RETRIES} - Canvas no está listo, reintentando en ${RETRY_DELAY}ms...`);
            if (attempt < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
              continue; // Reintentar
            }
          }
        } else {
          Logger.log('📭 No hay imagen disponible para el día:', dateKey);
          setDayImageStatus('empty');
          return;
        }
      } catch (error) {
        Logger.error(`❌ Error en intento ${attempt}/${MAX_RETRIES}:`, error);
        if (attempt === MAX_RETRIES) {
          setDayImageStatus('empty');
          return;
        }
      }
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    Logger.log('❌ Todos los intentos fallaron - Canvas no se inicializó correctamente');
    setDayImageStatus('empty');
  }, [selectedDate]);

  const goToPreviousDay = useCallback(() => {
    // ❌ NO PERMITIR IR ANTES DEL 1 DE OCTUBRE DE 2025 (LANZAMIENTO)
    const launchDate = new Date('2025-10-01');
    const previousDate = new Date(selectedDate);
    previousDate.setDate(previousDate.getDate() - 1);
    
    // Solo permitir si la fecha anterior no es antes del lanzamiento
    if (previousDate >= launchDate) {
      navigateToDay(-1);
    } else {
      Logger.log('🚫 No se puede navegar antes del día de lanzamiento (1 oct 2025)');
    }
  }, [navigateToDay, selectedDate]);

  const goToNextDay = useCallback(() => {
    // ❌ NO PERMITIR IR AL FUTURO - Solo días pasados desde hoy
    const today = new Date();
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Solo permitir si la siguiente fecha no es futura
    if (nextDate <= today) {
      navigateToDay(1);
    } else {
      Logger.log('🚫 No se puede navegar al futuro desde hoy');
    }
  }, [navigateToDay, selectedDate]);

  // ✅ CARGAR IMAGEN DEL DÍA ACTUAL AL INICIO
  useEffect(() => {
    Logger.log('🎯 Hook montado - fecha inicial:', selectedDate.toISOString().split('T')[0]);
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
