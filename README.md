# 🎨 ColorWorld

Una aplicación web interactiva de React donde los usuarios pueden colorear dibujos generados diariamente por inteligencia artificial. Cada día presenta un nuevo dibujo en formato de libro de colorear que los usuarios pueden pintar usando herramientas digitales.

![ColorWorld Screenshot](https://via.placeholder.com/800x400/667eea/white?text=ColorWorld+-+Dibuja%2C+Colorea+y+Crea)

## ✨ Características

### 🖌️ Herramientas de Dibujo
- **Pincel**: Pintar con diferentes tamaños y colores
- **Paleta de colores**: Amplia selección de colores predefinidos + selector personalizado
- **Goma de borrar**: Borrar partes del dibujo
- **Limpiar lienzo**: Reiniciar el dibujo completamente
- **Imprimir**: Imprimir el dibujo coloreado

### 🎲 Generación de Dibujos
- **Dibujo diario**: Un nuevo dibujo cada día
- **IA integrada**: Preparado para integración con Gemini 2.5 Flash
- **Temas variados**: Diferentes categorías de dibujos (animales, paisajes, objetos, etc.)
- **Formato libro de colorear**: Dibujos optimizados para colorear

### 📱 Experiencia de Usuario
- **Responsive**: Funciona en móviles, tablets y desktop
- **Touch support**: Soporte para pantallas táctiles
- **Historial**: Ver dibujos coloreados anteriormente
- **Guardado local**: Los dibujos se guardan automáticamente
- **Descarga**: Descargar dibujos en formato PNG

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/AdrianWheels/colorworld.git
cd colorworld
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

4. **Construir para producción**
```bash
npm run build
```

5. **Previsualizar build de producción**
```bash
npm run preview
```

## 🏗️ Estructura del Proyecto

```
colorworld/
├── public/                 # Archivos estáticos
├── src/
│   ├── components/        # Componentes React
│   │   ├── DrawingCanvas.jsx    # Lienzo de dibujo
│   │   ├── ToolBar.jsx          # Barra de herramientas
│   │   └── DrawingHistory.jsx   # Historial de dibujos
│   ├── hooks/            # Custom hooks
│   │   └── useDrawing.js        # Hook para manejo de dibujos
│   ├── services/         # Servicios y APIs
│   │   └── drawingService.js    # Servicio de generación de dibujos
│   ├── styles/           # Archivos CSS
│   │   ├── DrawingCanvas.css
│   │   ├── ToolBar.css
│   │   └── DrawingHistory.css
│   ├── utils/            # Utilidades
│   ├── App.jsx           # Componente principal
│   ├── App.css           # Estilos principales
│   ├── main.jsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── package.json
├── vite.config.js        # Configuración de Vite
└── README.md
```

## 🎯 Uso de la Aplicación

### Colorear un Dibujo

1. **Seleccionar herramienta**: Elige entre pincel o goma de borrar
2. **Elegir color**: Usa la paleta predefinida o el selector personalizado
3. **Ajustar tamaño**: Selecciona el tamaño del pincel
4. **Dibujar**: Haz clic y arrastra en el lienzo para colorear
5. **Guardar**: Usa el botón "Guardar Dibujo" para guardarlo en tu historial

### Herramientas Disponibles

| Herramienta | Descripción | Atajos |
|-------------|-------------|---------|
| 🖌️ Pincel | Pintar con el color seleccionado | Click + Arrastrar |
| 🧹 Goma | Borrar partes del dibujo | Click + Arrastrar |
| 🎨 Colores | Paleta de 15 colores + personalizado | Click en color |
| 📏 Tamaño | 6 tamaños diferentes (2-30px) | Click en tamaño |
| 🗑️ Limpiar | Reiniciar el dibujo | Click en botón |
| 🖨️ Imprimir | Imprimir el dibujo | Click en botón |

## 🤖 Integración con IA (Gemini)

La aplicación está preparada para integrar con Google Gemini 2.5 Flash para la generación de dibujos. Actualmente usa dibujos mock para demostración.

### Para integrar con Gemini:

1. **Obtener API Key de Google AI Studio**
2. **Configurar la clave en el servicio**:
```javascript
import drawingService from './services/drawingService';
drawingService.setApiKey('tu-api-key-aqui');
```

3. **El servicio ya incluye el método `generateWithGemini()`** para la integración real.

## 📦 Dependencias Principales

- **React 19.1.1**: Framework principal
- **Vite**: Build tool y dev server
- **Fabric.js**: Manipulación de canvas (preparado)
- **html2canvas**: Captura de canvas para imprimir
- **@google/generative-ai**: SDK de Google Gemini (preparado)

## 🎨 Personalización

### Agregar Nuevos Colores
Edita el array `colors` en `src/components/ToolBar.jsx`:

```javascript
const colors = [
  '#000000', '#FFFFFF', '#FF0000', // ... más colores
];
```

### Modificar Temas de Dibujos
Edita el array `themes` en `src/services/drawingService.js`:

```javascript
const themes = [
  'Un gato adorable jugando...',
  'Una casa de campo con jardín...',
  // ... más temas
];
```

### Cambiar Tamaños de Pincel
Modifica el array `brushSizes` en `src/components/ToolBar.jsx`:

```javascript
const brushSizes = [2, 5, 10, 15, 20, 30];
```

## 📱 Características Responsive

- **Desktop**: Layout de dos columnas con herramientas a la izquierda
- **Tablet**: Layout adaptativo con herramientas arriba
- **Móvil**: Layout vertical optimizado para touch
- **Touch Events**: Soporte completo para pantallas táctiles

## 💾 Almacenamiento

- **LocalStorage**: Los dibujos se guardan automáticamente en el navegador
- **Persistencia**: Los dibujos persisten entre sesiones
- **Historial**: Acceso a todos los dibujos coloreados anteriormente
- **Caché de dibujos**: Los dibujos diarios se cachean para evitar regeneración

## 🔧 Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build para producción
npm run preview    # Preview del build
npm run lint       # Linting con ESLint
```

## 🚀 Características Futuras

- [ ] Integración completa con Gemini 2.5 Flash
- [ ] Más herramientas de dibujo (formas, texto, stickers)
- [ ] Compartir dibujos en redes sociales
- [ ] Modo colaborativo
- [ ] Exportar en diferentes formatos
- [ ] Temas oscuro/claro
- [ ] Animaciones y efectos

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Adrian Wheels**
- GitHub: [@AdrianWheels](https://github.com/AdrianWheels)

## 🙏 Agradecimientos

- React team por el framework
- Vite por la herramienta de build
- Google por Gemini AI
- Comunidad open source

---

¡Disfruta creando y coloreando en ColorWorld! 🎨✨
