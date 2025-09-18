import { useState, useCallback, useRef } from 'react';

const useLayers = () => {
  const [layers, setLayers] = useState(() => [
    {
      id: 'background',
      name: 'Fondo',
      type: 'background',
      visible: true,
      opacity: 1,
      canvas: null
    },
    {
      id: 'drawing',
      name: 'Dibujo',
      type: 'drawing',
      visible: true,
      opacity: 1,
      canvas: null
    }
  ]);
  
  const [activeLayerId, setActiveLayerId] = useState('drawing');
  const canvasRefs = useRef({});

  // Obtener la capa activa
  const getActiveLayer = useCallback(() => {
    return layers.find(layer => layer.id === activeLayerId);
  }, [layers, activeLayerId]);

  // Agregar nueva capa
  const addLayer = useCallback(() => {
    const newLayerId = `layer_${Date.now()}`;
    const newLayer = {
      id: newLayerId,
      name: `Capa ${layers.length}`,
      type: 'drawing',
      visible: true,
      opacity: 1,
      canvas: null
    };
    
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayerId);
    
    return newLayerId;
  }, [layers.length]);

  // Eliminar capa
  const removeLayer = useCallback((layerId) => {
    if (layers.length <= 1) return false;
    
    const layer = layers.find(l => l.id === layerId);
    if (layer && layer.type === 'background') return false;
    
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
    
    // Si eliminamos la capa activa, seleccionar otra
    if (activeLayerId === layerId) {
      const remainingLayers = layers.filter(layer => layer.id !== layerId);
      setActiveLayerId(remainingLayers[remainingLayers.length - 1].id);
    }
    
    // Limpiar referencia del canvas
    if (canvasRefs.current[layerId]) {
      delete canvasRefs.current[layerId];
    }
    
    return true;
  }, [layers, activeLayerId]);

  // Cambiar visibilidad de capa
  const toggleLayerVisibility = useCallback((layerId) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
  }, []);

  // Cambiar opacidad de capa
  const changeLayerOpacity = useCallback((layerId, opacity) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, opacity: parseFloat(opacity) }
        : layer
    ));
  }, []);

  // Cambiar capa activa
  const setActiveLayer = useCallback((layerId) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      setActiveLayerId(layerId);
    }
  }, [layers]);

  // Registrar canvas de una capa
  const registerLayerCanvas = useCallback((layerId, canvas) => {
    canvasRefs.current[layerId] = canvas;
    
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, canvas }
        : layer
    ));
  }, []);

  // Obtener canvas de una capa
  const getLayerCanvas = useCallback((layerId) => {
    return canvasRefs.current[layerId];
  }, []);

  // Limpiar capa activa
  const clearActiveLayer = useCallback(() => {
    const activeLayer = getActiveLayer();
    if (activeLayer && activeLayer.canvas) {
      const ctx = activeLayer.canvas.getContext('2d');
      if (activeLayer.type === 'background') {
        // Para la capa de fondo, llenar con blanco
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
      } else {
        // Para otras capas, limpiar completamente
        ctx.clearRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
      }
    }
  }, [getActiveLayer]);

  // Combinar todas las capas visibles en un solo canvas
  const mergeVisibleLayers = useCallback((outputCanvas) => {
    if (!outputCanvas) return;
    
    const ctx = outputCanvas.getContext('2d');
    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    
    // Dibujar capas en orden, respetando visibilidad y opacidad
    layers.forEach(layer => {
      if (layer.visible && layer.canvas) {
        ctx.globalAlpha = layer.opacity;
        ctx.drawImage(layer.canvas, 0, 0);
      }
    });
    
    ctx.globalAlpha = 1; // Restaurar opacidad
  }, [layers]);

  // Obtener datos de todas las capas para exportar
  const getLayersData = useCallback(() => {
    return layers.map(layer => ({
      id: layer.id,
      name: layer.name,
      type: layer.type,
      visible: layer.visible,
      opacity: layer.opacity,
      imageData: layer.canvas ? layer.canvas.toDataURL() : null
    }));
  }, [layers]);

  return {
    layers,
    activeLayerId,
    getActiveLayer,
    addLayer,
    removeLayer,
    toggleLayerVisibility,
    changeLayerOpacity,
    setActiveLayer,
    registerLayerCanvas,
    getLayerCanvas,
    clearActiveLayer,
    mergeVisibleLayers,
    getLayersData
  };
};

export default useLayers;