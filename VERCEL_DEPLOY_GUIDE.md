# 🚀 Guía de Deploy en Vercel - ColorEveryday

## 📋 Resumen

Esta guía te explica cómo subir tu proyecto **ColorEveryday** a Vercel y cómo funciona el sistema de backend/frontend.

## 🏗️ Arquitectura del Proyecto

### **Frontend (React + Vite)**
- **Ubicación**: Toda la carpeta `src/`
- **Build**: Se compila a `dist/` con `npm run build`
- **Hosting**: Vercel servirá estos archivos estáticos
- **Función**: Interfaz de usuario para colorear

### **Backend/API (Express.js)**
- **Ubicación**: `server.js` 
- **Función**: Guardar/servir imágenes generadas
- **Almacenamiento**: `public/generated-images/`
- **Puerto**: 3001 en desarrollo

### **GitHub Actions (Automatización)**
- **Ubicación**: `.github/workflows/daily-image-generation.yml`
- **Función**: Genera imagen diaria automáticamente
- **Horario**: 6:00 AM UTC todos los días
- **Resultado**: Guarda en `public/generated-images/`

## 🌐 Opciones de Deploy

### **Opción 1: Solo Frontend en Vercel (Recomendada)**

#### **Ventajas:**
- ✅ **Completamente gratuito**
- ✅ **CDN global automático**
- ✅ **Deploy automático desde GitHub**
- ✅ **GitHub Actions sigue funcionando**
- ✅ **Las imágenes se guardan en el repositorio**

#### **Limitaciones:**
- ❌ No hay servidor API en vivo (pero no es necesario)
- ❌ Las imágenes se almacenan en GitHub (límites del repo)

#### **Configuración:**

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login en Vercel
vercel login

# 3. Deploy
vercel --prod

# 4. Configurar variables de entorno en Vercel dashboard
# VITE_GEMINI_API_KEY = tu_api_key
```

### **Opción 2: Full-Stack en Railway**

Si necesitas el backend activo, usa Railway (ver AUTOMATION_README.md).

## 📊 Límites de Almacenamiento

### **En GitHub (Repositorio)**
- **Límite total**: 1 GB por repositorio
- **Límite por archivo**: 100 MB
- **Límite por commit**: 50 archivos grandes

### **Cálculo de Imágenes:**
```
Imagen promedio: 150 KB (PNG optimizado para colorear)
Imágenes por año: 365
Tamaño total anual: 365 × 150 KB = ~55 MB/año

Capacidad: ~18 años de imágenes diarias (1 GB ÷ 55 MB)
```

### **En Vercel (Frontend)**
- **Límite de build**: 500 MB
- **Funciones**: Sin servidor backend
- **Bandwidth**: 100 GB/mes (plan gratuito)

## 🔧 Configuración Paso a Paso

### **1. Preparar el Proyecto**

```bash
# Asegurar que todo funciona localmente
npm run test-prompt
npm run build

# Verificar que no hay errores
npm run preview
```

### **2. Configurar GitHub Secrets**

1. Ve a tu repositorio en GitHub
2. Settings > Secrets and Variables > Actions
3. Añadir secret:
   - `GEMINI_API_KEY`: Tu API key de Gemini

### **3. Deploy en Vercel**

#### **Método A: Desde CLI**
```bash
vercel --prod
```

#### **Método B: Desde Dashboard**
1. Ve a [vercel.com](https://vercel.com)
2. "Import Git Repository"
3. Selecciona tu repo `colorworld`
4. Configure:
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### **4. Variables de Entorno en Vercel**

En el dashboard de Vercel:
1. Tu proyecto > Settings > Environment Variables
2. Añadir:
   ```
   VITE_GEMINI_API_KEY = tu_api_key_de_gemini
   ```

### **5. Configurar Dominio (Opcional)**

1. Vercel Dashboard > Tu proyecto > Domains
2. Añadir tu dominio personalizado
3. Configurar DNS según las instrucciones

## ⚙️ Cómo Funciona el Sistema

### **Flujo Diario Automatizado:**

```
06:00 UTC - GitHub Action se ejecuta
    ↓
Selecciona prompt del día (365 prompts únicos)
    ↓
Genera imagen con Gemini AI
    ↓
Guarda en public/generated-images/YYYY-MM/
    ↓
Commit y push automático al repo
    ↓
Vercel detecta cambios y redeploya automáticamente
    ↓
¡Nueva imagen disponible en la web!
```

### **Acceso a Imágenes:**
- **Desarrollo**: `http://localhost:3001/generated-images/`
- **Producción**: `https://tu-app.vercel.app/generated-images/`

## 🗂️ Estructura de Archivos en Vercel

```
public/
├── generated-images/          # Imágenes generadas diariamente
│   ├── 2025-09/
│   │   ├── 2025-09-29_MandalaFrutasVerano_123456.png
│   │   ├── 2025-09-29_MandalaFrutasVerano_123456.json
│   │   └── ...
│   └── 2025-10/
└── vite.svg                   # Assets estáticos

dist/                          # Build de producción (auto-generado)
├── index.html
├── assets/
└── ...
```

## 🔍 Monitoreo y Logs

### **GitHub Actions:**
- Repositorio > Actions
- Ver logs de generación diaria
- Verificar errores

### **Vercel:**
- Dashboard > Tu proyecto > Functions
- Ver logs de deploy
- Monitorear tráfico

### **Verificar Generación Local:**
```bash
# Probar generación manual
npm run generate-today

# Ver archivos generados
ls -la public/generated-images/$(date +%Y-%m)/
```

## 🚨 Solución de Problemas

### **GitHub Action falla:**
```bash
# Verificar API key en secrets
# GitHub repo > Settings > Secrets > GEMINI_API_KEY

# Verificar cuota de Gemini
# https://makersuite.google.com/app/quota
```

### **Vercel no actualiza imágenes:**
```bash
# Forzar redeploy
vercel --prod --force

# Verificar que GitHub Actions hizo commit
git log --oneline
```

### **Imágenes no cargan:**
```bash
# Verificar ruta en browser
https://tu-app.vercel.app/generated-images/2025-09/imagen.png

# Verificar que existe en GitHub
github.com/tu-usuario/colorworld/tree/main/public/generated-images
```

### **Límite de repositorio:**
```bash
# Limpiar imágenes antiguas (>1 año)
find public/generated-images -name "2023-*" -delete
git add . && git commit -m "🧹 Limpiar imágenes antiguas"
```

## 📈 Optimizaciones

### **Reducir Tamaño de Imágenes:**
- Las imágenes se generan optimizadas (~150KB)
- Formato PNG para mejor calidad de líneas
- Compresión automática por Gemini

### **Backup Automático:**
```bash
# Script para backup periódico (opcional)
# Comprimir y subir a Google Drive/Dropbox
tar -czf backup-$(date +%Y%m).tar.gz public/generated-images/
```

### **Limpieza Automática:**
El sistema incluye limpieza automática de localStorage y archivos antiguos.

## ✅ Checklist Final

- [ ] ✅ Build local funciona: `npm run build`
- [ ] ✅ GitHub Secret configurado: `GEMINI_API_KEY`
- [ ] ✅ Vercel project creado y conectado
- [ ] ✅ Variables de entorno en Vercel configuradas
- [ ] ✅ GitHub Action se ejecuta correctamente
- [ ] ✅ Primera imagen generada automáticamente
- [ ] ✅ Web accesible desde URL de Vercel
- [ ] ✅ Dominio personalizado configurado (opcional)

## 🎯 Resultado Final

Con esta configuración tendrás:

- 🌐 **Web pública** en Vercel con tu dominio
- 🤖 **Generación automática** diaria de imágenes
- 📱 **Responsive** y optimizado para móviles
- 🔄 **Deploy automático** cuando hagas cambios
- 💰 **Completamente gratuito** (Vercel + GitHub)
- 📊 **365 prompts únicos** para todo el año

¡Tu proyecto estará funcionando 24/7 sin intervención manual!