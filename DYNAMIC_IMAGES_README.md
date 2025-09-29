# Sistema de Índice Dinámico de Imágenes

## Resumen del Problema Solucionado

Anteriormente, el `staticImageService.js` tenía hardcodeados los nombres de archivo y URLs de las imágenes, lo que era insostenible cuando se agregaran nuevas imágenes generadas por GitHub Actions.

## Nueva Solución

### 1. Archivo de Índice Dinámico
- **Ubicación**: `/public/generated-images/images-index.json`
- **Estructura**:
```json
{
  "lastUpdated": "2025-09-29T15:48:29.031Z",
  "images": {
    "2025-09-29": [
      {
        "fileName": "2025-09-29_MandalaFrutasVerano_1759159699811.png",
        "url": "/generated-images/2025-09/2025-09-29_MandalaFrutasVerano_1759159699811.png",
        "theme": "MandalaFrutasVerano",
        "dateKey": "2025-09-29",
        "timestamp": 1759159699811,
        "extension": "png",
        "fileSize": 1625451,
        "lastModified": "2025-09-29T15:38:03.208Z"
      }
    ]
  },
  "daysByMonth": {
    "2025-09": ["2025-09-29"]
  },
  "totalImages": 1,
  "totalDays": 1
}
```

### 2. Script de Actualización
- **Ubicación**: `/scripts/update-images-index.js`
- **Función**: Escanea automáticamente la carpeta `/public/generated-images/` y actualiza el índice
- **Patrón de nombres**: `YYYY-MM-DD_TemaPrompt_timestamp.png`

### 3. Servicio Refactorizado
- **Archivo**: `/src/services/staticImageService.js`
- **Mejoras**:
  - ✅ Elimina hardcoding completamente
  - ✅ Carga dinámica desde el índice JSON
  - ✅ Caché con expiración de 5 minutos
  - ✅ Fallback graceful si falla la carga
  - ✅ Verificación de existencia de archivos

### 4. Integración con GitHub Actions
- **Archivo**: `/.github/workflows/update-images-index.yml`
- **Trigger**: Cuando se agreguen nuevas imágenes a `/public/generated-images/`
- **Acciones**:
  1. Ejecuta el script de actualización
  2. Hace commit del índice actualizado
  3. Deploya a Vercel

## Flujo de Trabajo

1. **GitHub Actions genera nueva imagen** → Guarda en `/public/generated-images/YYYY-MM/`
2. **Se ejecuta automáticamente** el workflow de actualización
3. **El script escanea** toda la carpeta y actualiza el índice
4. **Se hace commit** del índice actualizado
5. **Se despliega** a Vercel automáticamente
6. **La aplicación carga** las imágenes dinámicamente desde el índice

## Comandos Útiles

```bash
# Actualizar índice manualmente
node scripts/update-images-index.js

# Verificar el índice actual
cat public/generated-images/images-index.json

# Limpiar caché en desarrollo (desde el navegador)
// staticImageService.invalidateCache()
```

## Ventajas

- 🔄 **Totalmente automático**: No requiere intervención manual
- 📈 **Escalable**: Funciona con cualquier cantidad de imágenes
- 🚀 **Performante**: Caché inteligente para evitar llamadas innecesarias
- 🛡️ **Robusto**: Fallbacks en caso de errores
- 🔍 **Transparente**: Logs detallados para debugging

## Estructura de Archivos

```
public/
  generated-images/
    images-index.json          # ← Índice dinámico
    2025-09/
      2025-09-29_MandalaFrutasVerano_1759159699811.png
      2025-09-29_MandalaFrutasVerano_1759159699811.json
    2025-10/
      ...futuras imágenes...

scripts/
  update-images-index.js       # ← Script de actualización

.github/workflows/
  update-images-index.yml      # ← Automatización GitHub Actions

src/services/
  staticImageService.js        # ← Servicio refactorizado
```

Este sistema elimina completamente la necesidad de hardcodear archivos y URLs, haciendo que el sistema sea completamente dinámico y automantenible.