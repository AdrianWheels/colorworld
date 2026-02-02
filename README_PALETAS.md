# 🎨 Sistema de Paletas de Colores - ColorEveryday

Sistema automatizado de paletas de colores que sugiere 10 colores para cada día del año usando IA, con soporte para 6 colores personalizados adicionales.

## ✅ Estado: IMPLEMENTADO Y ACTIVO

El sistema de paletas está completamente integrado en la aplicación:
- ✅ **365 paletas generadas** (10 colores por día)
- ✅ **Archivo consolidado** en `src/data/daily-palettes.js`
- ✅ **Integración con UI** - Grid 4x4 (16 colores totales)
- ✅ **Colores personalizados** - 6 slots adicionales para el usuario
- ✅ **Sincronización automática** con navegación de días

## 🎯 Características

### Paleta Diaria (10 colores)
- **Colores obligatorios**: Negro (#000000) y Blanco (#FFFFFF)
- **8 colores temáticos** adaptados al dibujo del día
- **Sincronización automática** al cambiar de día
- **Diseño visual** con borde sólido morado

### Colores Personalizados (6 slots)
- **Espacios adicionales** para colores del usuario
- **Selector de color** personalizado
- **Persistencia** de colores durante la sesión
- **Diseño visual** con borde punteado turquesa

## � Estructura de Archivos

## 📁 Estructura de Archivos

```
colorworld/
├── src/
│   ├── data/
│   │   └── daily-palettes.js          # ✅ Archivo consolidado (365 paletas)
│   └── components/
│       └── ToolBarHorizontal.jsx      # ✅ UI de paleta integrada
├── data/
│   └── palettes/                       # ✅ Paletas por mes (fuente)
│       ├── palettes-month-01.json
│       ├── palettes-month-02.json
│       └── ... hasta month-12.json
├── scripts/
│   ├── merge-daily-palettes.js        # ✅ Script de consolidación
│   ├── validate-palettes.js           # Validación de formato
│   └── prepare-all-months.js          # Generación de datos iniciales
└── README_PALETAS.md                  # Esta documentación
```

## 🎨 Uso en la Aplicación

### Para Desarrolladores

```javascript
// Importar las paletas
import { getPaletteForDay, getPaletteInfoForDay } from './data/daily-palettes';

// Obtener paleta de un día específico (1-365)
const colors = getPaletteForDay(150); // Array de 10 colores

// Obtener información completa
const paletteInfo = getPaletteInfoForDay(150);
// { day: 150, tematica: "...", colorPalette: [...] }
```

### Para Usuarios

1. **Abre el selector de colores** (botón de color en la barra de herramientas)
2. **Paleta del día**: Los primeros 10 colores con borde sólido morado
3. **Colores personalizados**: 6 slots adicionales con borde punteado turquesa
4. **Agregar color personalizado**: Usa el selector de color en la parte inferior
5. **Cambio automático**: Al navegar a otro día, la paleta se actualiza

## 🔧 Scripts de Mantenimiento

## 🔧 Scripts de Mantenimiento

### `merge-daily-palettes.js` ✅ (PRINCIPAL)
Consolida todos los archivos mensuales en el archivo principal usado por la app.
```bash
node scripts/merge-daily-palettes.js
```
**Cuándo usar**: Después de actualizar/regenerar algún archivo mensual.

### `validate-palettes.js`
Valida que los archivos de paletas cumplan todos los requisitos.
```bash
node scripts/validate-palettes.js --month=1   # Un mes
node scripts/validate-palettes.js --all       # Todos
```

### `prepare-all-months.js`
Regenera los archivos de entrada para todos los meses (solo si necesitas cambiar la estructura).
```bash
node scripts/prepare-all-months.js
```

## 📊 Progreso Original (Todos Completados ✅)

- [x] Enero (mes 1) ✅
- [x] Febrero (mes 2) ✅
- [x] Marzo (mes 3) ✅
- [x] Abril (mes 4) ✅
- [x] Mayo (mes 5) ✅
- [x] Junio (mes 6) ✅
- [x] Julio (mes 7) ✅
- [x] Agosto (mes 8) ✅
- [x] Septiembre (mes 9) ✅
- [x] Octubre (mes 10) ✅
- [x] Noviembre (mes 11) ✅
- [x] Diciembre (mes 12) ✅

**Total**: 365 paletas generadas y consolidadas

## 🎯 Formato de Paleta (Referencia)

## 🎯 Formato de Paleta (Referencia)

```json
{
  "day": 1,
  "tematica": "Números2026",
  "colorPalette": [
    "#FFD700",  // Color 1
    "#FF6600",  // Color 2
    "#DC143C",  // Color 3
    "#4B0082",  // Color 4
    "#228B22",  // Color 5
    "#C0C0C0",  // Color 6
    "#FFA500",  // Color 7
    "#4169E1",  // Color 8
    "#000000",  // Negro (obligatorio)
    "#FFFFFF"   // Blanco (obligatorio)
  ]
}
```

## 🎨 Criterios de Selección de Colores (Referencia IA)

### Por Estación
- **Enero-Marzo** (Invierno): Blancos, azules, grises, colores fríos
- **Abril-Junio** (Primavera): Pasteles, verdes claros, rosas, amarillos suaves
- **Julio-Septiembre** (Verano): Brillantes, amarillos, naranjas, azules vibrantes
- **Octubre-Diciembre** (Otoño/Invierno): Naranjas, marrones, rojos, blancos

### Por Temática
Los 8 colores variables se adaptan al contexto específico del dibujo:
- **Naturaleza**: Verdes, marrones, azules
- **Festividades**: Colores vibrantes y festivos
- **Animales**: Según especie y entorno
- **Objetos**: Según materiales y contexto

## 🚨 Solución de Problemas

### La paleta no cambia al navegar entre días
1. Verifica que el archivo `src/data/daily-palettes.js` existe
2. Revisa la consola del navegador para errores
3. Asegúrate de que `currentDay` se está pasando correctamente al componente

### Falta un color en la paleta
1. Verifica el archivo fuente en `data/palettes/palettes-month-XX.json`
2. Ejecuta el validador: `node scripts/validate-palettes.js --month=XX`
3. Regenera el archivo consolidado: `node scripts/merge-daily-palettes.js`

### Los colores personalizados no se guardan
Los colores personalizados solo persisten durante la sesión actual. Son intencionales para mantener la app sin base de datos.

## 📝 Notas de Implementación

- **Grid 4x4**: 16 espacios totales (10 predefinidos + 6 personalizables)
- **Actualización automática**: La paleta se sincroniza automáticamente con `selectedDate`
- **Día del año**: Se calcula usando `promptsManager.getDayOfYear()`
- **Sin localStorage**: Los colores personalizados se resetean en cada sesión
- **Responsive**: El modal de paleta se centra y adapta a móviles

## 🎉 Próximos Pasos Opcionales

- [ ] Persistir colores personalizados en localStorage
- [ ] Exportar/importar paletas personalizadas
- [ ] Agregar previsualización de paletas de otros días
- [ ] Sistema de paletas favoritas
- [ ] Sugerencias de combinaciones de colores

---

**Última actualización**: Sistema implementado y funcionando ✅  
**Fecha**: Noviembre 2025
