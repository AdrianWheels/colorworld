
# 🎨 ColorEveryday - Automatización Diaria

## 📋 Resumen del Proyecto

Tu proyecto **ColorEveryday** ahora cuenta con un sistema completamente automatizado que genera una imagen para colorear diferente cada día del año, usando los 365 prompts de tu CSV.

### ✅ Lo que ya funciona:
- ✅ **365 prompts únicos**: Integrados desde tu CSV, uno para cada día del año
- ✅ **Generación con Gemini 2.5**: Sistema optimizado para crear imágenes para colorear
- ✅ **Almacenamiento automático**: Imágenes y metadata organizados por mes
- ✅ **Interfaz web**: React + Vite para mostrar las imágenes generadas
- ✅ **Servidor Express**: API para guardar y servir imágenes

### 🔧 Lo que hemos añadido:

#### 1. **Sistema de Prompts Diarios**
```
src/data/daily-prompts.js     - 364 prompts del CSV
src/services/promptsManager.js - Lógica para seleccionar prompt por fecha
```

#### 2. **GitHub Actions para Automatización**
```
.github/workflows/daily-image-generation.yml - Workflow diario
scripts/generate-daily-image.js             - Script de generación
scripts/test-prompt.js                       - Testing del sistema
```

## 🚀 Configuración Inicial

### 1. **Variables de Entorno**
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env y añade tu API key de Gemini
VITE_GEMINI_API_KEY=tu_api_key_real_aqui
```

### 2. **GitHub Secrets**
En tu repositorio de GitHub, ve a Settings > Secrets and variables > Actions y añade:
- `GEMINI_API_KEY`: Tu API key de Gemini

### 3. **Instalación**
```bash
npm install
npm run parse-csv      # Parsear CSV (ya hecho)
npm run test-prompt    # Probar sistema de prompts
```

## 📅 Cómo Funciona la Automatización

### **GitHub Actions (Generación Diaria)**
- **Horario**: Todos los días a las 6:00 AM UTC
- **Proceso**:
  1. Calcula el día del año (1-365)
  2. Selecciona el prompt correspondiente del CSV
  3. Genera imagen con Gemini 2.5
  4. Guarda en `public/generated-images/YYYY-MM/`
  5. Commit y push automático

### **Estructura de Archivos**
```
public/generated-images/
├── 2025-01/
│   ├── 2025-01-01_Calabaza_1234567890.png
│   ├── 2025-01-01_Calabaza_1234567890.json
│   └── ...
├── 2025-02/
└── ...
```

## 🌐 Opciones de Hosting

### **Opción 1: Vercel (Recomendada para Frontend)**
```bash
# Deploy automático
npm run build
vercel --prod

# Ventajas:
✅ Deploy automático desde GitHub
✅ CDN global
✅ SSL gratuito
❌ No ejecuta GitHub Actions (solo sirve contenido estático)
```

### **Opción 2: Railway (Recomendada para Full Stack)**
```bash
# Conecta GitHub repo en railway.app
# Ventajas:
✅ Ejecuta GitHub Actions
✅ Base de datos PostgreSQL incluida
✅ Deploy automático
✅ Variables de entorno seguras
💰 ~$5/mes después de plan gratuito
```

### **Opción 3: Netlify + GitHub Pages**
```bash
# Netlify para frontend, GitHub Actions para generación
# Ventajas:
✅ Frontend gratuito en Netlify
✅ GitHub Actions gratuito (2000 minutos/mes)
✅ Completamente automatizado
❌ Requiere configuración de ambas plataformas
```

## 🔧 Scripts de Desarrollo

```bash
# Desarrollo local
npm run dev:full       # Frontend + Backend
npm run dev           # Solo frontend
npm run server        # Solo backend

# Generación manual
npm run generate-today # Generar imagen de hoy
npm run test-prompt   # Probar sistema de prompts

# Utilidades
npm run parse-csv     # Parsear CSV de prompts
npm run build        # Build para producción
```

## 📊 Monitoreo y Logs

### **Ver GitHub Actions**
- Ve a tu repositorio > Actions
- Verifica que se ejecute diariamente
- Revisa logs de errores

### **Verificar Generación Local**
```bash
# Probar generación local
npm run generate-today

# Ver estructura de archivos
ls -la public/generated-images/$(date +%Y-%m)/
```

## 🔄 Flujo Diario Automatizado

```
06:00 UTC - GitHub Action se ejecuta
    ↓
Calcula día del año (ej: día 273)
    ↓
Selecciona prompt del CSV (ej: "MandalaFrutasVerano")
    ↓
Genera imagen con Gemini 2.5
    ↓
Guarda en public/generated-images/2025-09/
    ↓
Commit y push automático
    ↓
Deploy automático (si usas Vercel/Railway)
    ↓
¡Nueva imagen disponible en la web!
```

## 🚨 Solución de Problemas

### **GitHub Action falla**
```bash
# Verifica secrets
# Settings > Secrets > GEMINI_API_KEY debe existir

# Verifica cuota de Gemini
# https://makersuite.google.com/app/quota
```

### **Imagen no se genera**
```bash
# Ejecuta localmente para debug
npm run generate-today

# Verifica API key
echo $VITE_GEMINI_API_KEY
```

### **Frontend no muestra imágenes**
```bash
# Verifica servidor API
npm run server  # http://localhost:3001

# Verifica archivos
ls public/generated-images/
```

## 📈 Siguientes Pasos

1. **Deploy en hosting elegido**
2. **Configurar dominio personalizado**
3. **Monitorear generación diaria**
4. **Añadir analytics (opcional)**
5. **Backup automático de imágenes (opcional)**

---

## 🎯 **Resultado Final**

Tu web ahora tendrá **una imagen nueva cada día** de forma completamente automática, usando los 365 prompts únicos de tu CSV. ¡Los usuarios siempre tendrán contenido fresco para colorear!