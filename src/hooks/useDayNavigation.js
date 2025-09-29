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
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 100; // 100ms entre reintentos
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        setDayImageStatus('loading');
        const dateKey = selectedDate.toISOString().split('T')[0];
        
        console.log(`🎯 Intento ${attempt}/${MAX_RETRIES} - Cargando imagen para: ${dateKey}`);
        const dayImage = await drawingService.getDailyImage(dateKey);
        
        console.log('🔍 DEBUG - dayImage recibido:', dayImage);
        console.log('🔍 DEBUG - canvasRef.current:', !!canvasRef.current);
        console.log('🔍 DEBUG - dayImage.blobUrl:', dayImage?.blobUrl);
        
        if (dayImage && dayImage.blobUrl) {
          if (canvasRef.current) {
            console.log('🖼️ Intentando cargar imagen:', dayImage.blobUrl);
            await canvasRef.current.loadBackgroundImage(dayImage.blobUrl);
            setDayImageStatus('available');
            console.log('✅ Imagen cargada para el día:', dateKey);
            return; // Éxito, salir del loop
          } else {
            console.log(`⏳ Intento ${attempt}/${MAX_RETRIES} - Canvas no está listo, reintentando en ${RETRY_DELAY}ms...`);
            if (attempt < MAX_RETRIES) {
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
              continue; // Reintentar
            }
          }
        } else {
          console.log('📭 No hay imagen disponible para el día:', dateKey);
          setDayImageStatus('empty');
          return;
        }
      } catch (error) {
        console.error(`❌ Error en intento ${attempt}/${MAX_RETRIES}:`, error);
        if (attempt === MAX_RETRIES) {
          setDayImageStatus('empty');
          return;
        }
      }
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    console.log('❌ Todos los intentos fallaron - Canvas no se inicializó correctamente');
    setDayImageStatus('empty');
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