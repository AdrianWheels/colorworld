# ColorEveryday - Configuración

## Variables de Entorno

Para que la aplicación funcione correctamente, necesitas configurar las siguientes variables de entorno:

### Archivo .env

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```bash
# Gemini API Configuration
VITE_GEMINI_API_KEY=tu_api_key_aqui

# Development Configuration
VITE_APP_NAME=ColorEveryday
VITE_APP_VERSION=1.0.0

# Future Database Configuration
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=
# VITE_GOOGLE_DRIVE_API_KEY=
```

### Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Crea una nueva API key
4. Copia la API key y pégala en el archivo `.env`

### Características de Gemini 2.5 Flash Image Preview

- **Generación real de imágenes**: La aplicación ahora genera imágenes reales usando IA
- **Optimizado para colorear**: Las imágenes se generan específicamente como libros para colorear
- **Solo líneas negras**: Perfecto para colorear, sin colores ni sombras
- **Guardado local**: Las imágenes se guardan automáticamente en el navegador
- **Limpieza automática**: Se mantienen solo las últimas 20 imágenes generadas

## Funcionalidades Implementadas

### 🎨 Generación con IA
- Botón "IA Gemini" para activar la generación
- Input personalizado para describir lo que quieres dibujar
- Botón "Sorpréndeme" para generar algo aleatorio

### 💾 Guardado de Imágenes
- Almacenamiento local en el navegador
- Persistencia entre sesiones
- Limpieza automática de imágenes antiguas
- Lista de imágenes generadas disponible

### 🔒 Seguridad
- API key en variables de entorno
- No exposición de credenciales en el código
- Archivo .env excluido del repositorio

## Uso de la Aplicación

1. **Instalación**:
   ```bash
   npm install
   ```

2. **Configuración**:
   - Crea el archivo `.env` con tu API key
   
3. **Desarrollo**:
   ```bash
   npm run dev
   ```

4. **Producción**:
   ```bash
   npm run build
   ```

## Estructura del Proyecto

```
src/
├── components/
│   ├── DrawingCanvasSimple.jsx     # Canvas principal optimizado
│   ├── ToolBarHorizontal.jsx       # Herramientas de dibujo
│   └── DrawingHistory.jsx          # Historial (futuro)
├── services/
│   └── drawingService.js           # Servicio de Gemini 2.5
├── hooks/
│   └── useDrawing.js               # Hook de dibujo
└── styles/                         # Estilos CSS

legacy/                             # Archivos no utilizados
public/generated-images/            # Imágenes generadas (futuro)
```

## Próximas Mejoras

- [ ] Integración con Supabase para almacenamiento en la nube
- [ ] Sincronización con Google Drive
- [ ] Galería de imágenes generadas
- [ ] Compartir creaciones en redes sociales
- [ ] Sistema de usuarios y favoritos