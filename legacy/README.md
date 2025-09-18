# Legacy Files

Esta carpeta contiene archivos del proyecto ColorWorld que no están siendo utilizados actualmente en la aplicación.

## Archivos movidos (18 de septiembre de 2025)

Los siguientes archivos fueron identificados como no utilizados y movidos aquí para mantener el proyecto limpio:

### Components
- `DrawingCanvas.jsx` - Canvas de dibujo original con funcionalidades complejas
- `DrawingCanvasWithLayers.jsx` - Canvas con sistema de capas (no implementado en la app actual)
- `LayerManager.jsx` - Componente para gestión de capas
- `ToolBar.jsx` - Barra de herramientas vertical (reemplazada por ToolBarHorizontal)

### Hooks
- `useLayers.js` - Hook para manejo de capas (no utilizado en la implementación actual)

### Styles
- `DrawingCanvas.css` - Estilos para el canvas original
- `LayerManager.css` - Estilos para el gestor de capas
- `ToolBar.css` - Estilos para la barra de herramientas vertical

## Archivos activos en la aplicación

La aplicación actualmente utiliza:
- `DrawingCanvasSimple.jsx` - Canvas simplificado
- `ToolBarHorizontal.jsx` - Barra de herramientas horizontal
- `DrawingHistory.jsx` - Historial de dibujos
- `useDrawing.js` - Hook principal para manejo de dibujos

## Notas

Estos archivos se mantienen aquí por si en el futuro se necesita implementar:
- Sistema de capas
- Funcionalidades avanzadas de dibujo
- Interfaz alternativa con barra de herramientas vertical

Para restaurar cualquiera de estos archivos, simplemente muévelos de vuelta a la carpeta `src` correspondiente.