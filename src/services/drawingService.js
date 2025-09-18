// AI Drawing Service
// This service handles generating daily drawings using AI

class DrawingService {
  constructor() {
    this.apiKey = null; // To be set by user
    this.cache = new Map(); // Cache for generated drawings
  }

  // Set the Gemini API key
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  // Get today's date as a string (YYYY-MM-DD)
  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  // Get cached drawing for today
  getTodayDrawing() {
    const todayKey = this.getTodayKey();
    const cached = localStorage.getItem(`drawing_${todayKey}`);
    return cached ? JSON.parse(cached) : null;
  }

  // Save drawing to cache
  saveDrawing(drawing) {
    const todayKey = this.getTodayKey();
    localStorage.setItem(`drawing_${todayKey}`, JSON.stringify(drawing));
  }

  // Get list of all saved drawings
  getAllDrawings() {
    const drawings = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('drawing_')) {
        const date = key.replace('drawing_', '');
        const drawing = JSON.parse(localStorage.getItem(key));
        drawings.push({ date, ...drawing });
      }
    }
    return drawings.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // Generate drawing prompts for coloring book style
  getColoringPrompts() {
    const themes = [
      'Un gato adorable jugando con una pelota de estambre',
      'Una casa de campo con jardín lleno de flores',
      'Un árbol mágico con frutas de diferentes formas',
      'Un robot amigable en un parque',
      'Una princesa en un castillo encantado',
      'Un barco pirata navegando por el océano',
      'Una familia de búhos en un bosque',
      'Un dragón bebé durmiendo en una cueva',
      'Una bicicleta decorada con flores',
      'Un helado gigante con muchos sabores',
      'Una mariposa volando entre flores',
      'Un cohete espacial viajando a las estrellas',
      'Una sirena nadando con peces coloridos',
      'Un elefante bebé jugando en el agua',
      'Una ciudad futurista con edificios cristal'
    ];

    const today = new Date();
    const dayIndex = today.getDate() % themes.length;
    return themes[dayIndex];
  }

  // Mock function to simulate AI-generated drawing
  // In production, this would call the Gemini API
  async generateMockDrawing() {
    const prompt = this.getColoringPrompts();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create a simple SVG drawing as a placeholder
    const svgContent = this.createSimpleSVG(prompt);
    
    return {
      prompt,
      svgContent,
      imageUrl: this.svgToDataUrl(svgContent),
      generatedAt: new Date().toISOString()
    };
  }

  // Create a simple SVG based on the prompt
  createSimpleSVG(prompt = '') {
    const svgs = {
      'gato': `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="180" r="80" fill="none" stroke="black" stroke-width="3"/>
        <circle cx="170" cy="160" r="8" fill="black"/>
        <circle cx="230" cy="160" r="8" fill="black"/>
        <path d="M 180 190 Q 200 210 220 190" fill="none" stroke="black" stroke-width="2"/>
        <polygon points="150,120 160,80 140,90" fill="none" stroke="black" stroke-width="3"/>
        <polygon points="250,120 260,80 240,90" fill="none" stroke="black" stroke-width="3"/>
        <circle cx="200" cy="280" r="60" fill="none" stroke="black" stroke-width="3"/>
        <circle cx="120" cy="300" r="30" fill="none" stroke="black" stroke-width="3"/>
        <circle cx="280" cy="300" r="30" fill="none" stroke="black" stroke-width="3"/>
        <text x="200" y="380" text-anchor="middle" font-family="Arial" font-size="16">¡Coloréame!</text>
      </svg>`,
      'casa': `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <polygon points="200,80 120,160 280,160" fill="none" stroke="black" stroke-width="3"/>
        <rect x="140" y="160" width="120" height="100" fill="none" stroke="black" stroke-width="3"/>
        <rect x="170" y="190" width="30" height="40" fill="none" stroke="black" stroke-width="2"/>
        <rect x="210" y="180" width="25" height="25" fill="none" stroke="black" stroke-width="2"/>
        <circle cx="100" cy="300" r="20" fill="none" stroke="black" stroke-width="2"/>
        <circle cx="300" cy="300" r="20" fill="none" stroke="black" stroke-width="2"/>
        <circle cx="130" cy="320" r="15" fill="none" stroke="black" stroke-width="2"/>
        <circle cx="270" cy="320" r="15" fill="none" stroke="black" stroke-width="2"/>
        <text x="200" y="380" text-anchor="middle" font-family="Arial" font-size="16">¡Coloréame!</text>
      </svg>`,
      'default': `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="150" r="80" fill="none" stroke="black" stroke-width="3"/>
        <circle cx="180" cy="130" r="10" fill="black"/>
        <circle cx="220" cy="130" r="10" fill="black"/>
        <path d="M 170 170 Q 200 190 230 170" fill="none" stroke="black" stroke-width="3"/>
        <rect x="160" y="230" width="80" height="100" fill="none" stroke="black" stroke-width="3"/>
        <circle cx="120" cy="350" r="25" fill="none" stroke="black" stroke-width="3"/>
        <circle cx="280" cy="350" r="25" fill="none" stroke="black" stroke-width="3"/>
        <text x="200" y="390" text-anchor="middle" font-family="Arial" font-size="16">¡Coloréame!</text>
      </svg>`
    };

    if (prompt.includes('gato')) return svgs.gato;
    if (prompt.includes('casa')) return svgs.casa;
    return svgs.default;
  }

  // Convert SVG to data URL
  svgToDataUrl(svgContent) {
    const encoded = encodeURIComponent(svgContent);
    return `data:image/svg+xml,${encoded}`;
  }

  // Future: Integrate with Gemini API
  async generateWithGemini() {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    // This would integrate with Google's Gemini API
    // For now, we'll use the mock function
    return this.generateMockDrawing();
  }

  // Get or generate today's drawing
  async getTodayDrawingOrGenerate() {
    let todayDrawing = this.getTodayDrawing();
    
    if (!todayDrawing) {
      try {
        todayDrawing = await this.generateMockDrawing();
        this.saveDrawing(todayDrawing);
      } catch (error) {
        console.error('Error generating drawing:', error);
        // Fallback to a default drawing
        todayDrawing = {
          prompt: 'Dibujo del día - ¡Usa tu imaginación!',
          svgContent: this.createSimpleSVG('default'),
          imageUrl: this.svgToDataUrl(this.createSimpleSVG('default')),
          generatedAt: new Date().toISOString()
        };
      }
    }
    
    return todayDrawing;
  }
}

export default new DrawingService();