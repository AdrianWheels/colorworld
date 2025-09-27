# 🎨 ColorEveryday - Sistema de Persistencia Completo

## 🚀 Instalación y Uso

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Crear archivo `.env` en la raíz del proyecto:
```env
VITE_GEMINI_API_KEY=tu_api_key_aqui
```

### 3. Ejecutar el Sistema Completo

#### Opción A: Servidor + Cliente (Recomendado)
```bash
npm run dev:full
```
Esto ejecuta:
- Servidor API en `http://localhost:3001`
- Cliente React en `http://localhost:5173`

#### Opción B: Solo Cliente (Solo localStorage)
```bash
npm run dev
```

#### Opción C: Solo Servidor
```bash
npm run server
```

## 📁 Sistema de Almacenamiento

### Estructura de Archivos
```
public/
└── generated-images/
    ├── 2025-09/
    │   ├── 2025-09-27_conejo_1727447123456.png
    │   ├── 2025-09-27_conejo_1727447123456.json
    │   ├── 2025-09-28_mariposa_1727533523789.png
    │   └── 2025-09-28_mariposa_1727533523789.json
    └── 2025-10/
        └── ...
```

### Metadata JSON
```json
{
  "fileName": "2025-09-27_conejo_1727447123456.png",
  "dateKey": "2025-09-27",
  "prompt": "Un conejo adorable jugando en el jardín...",
  "animal": "conejo",
  "savedAt": "2025-09-27T10:30:00.000Z",
  "fileSize": 245760
}
```

## 🔧 Funcionalidades Implementadas

### ✅ Persistencia Dual
- **Servidor disponible**: Guarda en `/public/generated-images/` con metadata
- **Servidor no disponible**: Fallback automático a localStorage
- **Recuperación inteligente**: Regenera blob URLs desde localStorage

### ✅ Generación por Día Seleccionado
- Generar imagen para cualquier fecha usando navegación ← →
- Las imágenes se organizan por día específico
- Sistema de navegación temporal funcional

### ✅ Canvas Multicapa Corregido
- **Capa 1**: Fondo blanco
- **Capa 2**: Dibujo del usuario (debajo)
- **Capa 3**: Líneas negras (ENCIMA - intocables)

### ✅ API REST Completa
- `POST /api/save-image` - Guardar imagen con metadata
- `GET /api/images/:dateKey` - Obtener imágenes por día
- `GET /api/health` - Estado del servidor
- `GET /generated-images/...` - Servir archivos estáticos

## 🎯 Cómo Usar

### Generar Nueva Imagen
1. Navegar al día deseado con ← →
2. Clic en "🎨 Generar Animal para Colorear"
3. La imagen se guarda automáticamente para ese día
4. Colorear sin poder tocar las líneas negras

### Navegar por Días
1. Usar botones ← → en la sección "Dibujo del Día"
2. El sistema carga automáticamente la imagen del día (si existe)
3. Estados visibles:
   - ⏳ **Cargando...**: Buscando imagen
   - ✅ **Imagen disponible**: Lista para colorear
   - 📝 **Sin imagen**: Puede generar nueva
   - ❌ **Error**: Problema técnico

### Verificar Persistencia
1. Generar imagen para un día específico
2. Recargar la página (F5)
3. Navegar al mismo día
4. La imagen debe cargar automáticamente

## 🗂️ Estructura Técnica

### Frontend (React + Vite)
- **Canvas multicapa** con `DrawingCanvasSimple.jsx`
- **Navegación temporal** en `App.jsx`
- **Servicios**:
  - `drawingService.js` - Generación con Gemini
  - `persistentStorage.js` - Comunicación con API
  - `promptsManager.js` - Prompts CSV

### Backend (Express.js)
- **API REST** en `server.js`
- **Almacenamiento físico** en `/public/generated-images/`
- **Organización por mes** (`YYYY-MM/`)
- **Metadata JSON** por cada imagen

### Persistencia
- **Nivel 1**: Servidor con archivos físicos
- **Nivel 2**: localStorage con base64 completa
- **Nivel 3**: Blob URLs para visualización inmediata

## 🐛 Solución de Problemas

### Error "net::ERR_FILE_NOT_FOUND"
- ✅ **Solucionado**: Regeneración automática de blob URLs

### Imágenes no persisten al recargar
- ✅ **Solucionado**: Sistema de fallback localStorage

### No se puede pintar sobre imagen
- ✅ **Solucionado**: Orden de capas corregido

### Generar para día incorrecto
- ✅ **Solucionado**: Usa fecha seleccionada en UI

## 🚧 Próximos Pasos

1. **Docker**: Containerizar el servidor
2. **Supabase**: Migrar de archivos locales a base de datos
3. **Autenticación**: Sistema de usuarios
4. **Compartir**: Funcionalidad social
5. **Optimización**: Compresión de imágenes

## 📊 Métricas del Sistema

- ✅ **Persistencia**: 100% funcional (servidor + localStorage)
- ✅ **Canvas**: Capas corregidas, líneas intocables
- ✅ **Navegación**: Temporal por días
- ✅ **Generación**: Para día seleccionado
- ✅ **Recuperación**: Automática desde localStorage
- ✅ **Organización**: Por año-mes en carpetas