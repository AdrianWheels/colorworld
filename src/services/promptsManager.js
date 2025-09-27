// Utility functions for handling CSV data and prompts

export class PromptsManager {
  constructor() {
    this.prompts = [
      {
        id: 1,
        animal: 'conejo',
        prompt_es: 'Un conejo adorable sentado en un jardín con flores, estilo libro para colorear, solo líneas negras, viñeta simple',
        prompt_en: 'An adorable rabbit sitting in a garden with flowers, coloring book style, black lines only, simple vignette',
        difficulty: 'easy'
      },
      {
        id: 2,
        animal: 'gatito',
        prompt_es: 'Un gatito juguetón con una pelota de estambre, líneas gruesas para colorear, fondo con elementos simples',
        prompt_en: 'A playful kitten with a ball of yarn, thick lines for coloring, background with simple elements',
        difficulty: 'easy'
      },
      {
        id: 3,
        animal: 'elefante',
        prompt_es: 'Un elefante bebé jugando con agua, contornos claros, estilo viñeta para libro de colorear',
        prompt_en: 'A baby elephant playing with water, clear outlines, vignette style for coloring book',
        difficulty: 'medium'
      },
      {
        id: 4,
        animal: 'mariposa',
        prompt_es: 'Una mariposa grande con alas detalladas volando entre flores simples, solo contornos negros',
        prompt_en: 'A large butterfly with detailed wings flying among simple flowers, black outlines only',
        difficulty: 'medium'
      },
      {
        id: 5,
        animal: 'tortuga',
        prompt_es: 'Una tortuga amigable con caparazón decorativo en un paisaje simple, líneas definidas para colorear',
        prompt_en: 'A friendly turtle with decorative shell in simple landscape, defined lines for coloring',
        difficulty: 'easy'
      },
      {
        id: 6,
        animal: 'perro',
        prompt_es: 'Un perrito alegre corriendo por el parque, líneas simples y claras, perfecto para colorear',
        prompt_en: 'A happy puppy running in the park, simple and clear lines, perfect for coloring',
        difficulty: 'easy'
      },
      {
        id: 7,
        animal: 'pato',
        prompt_es: 'Un patito nadando en un estanque con nenúfares, contornos gruesos, viñeta para colorear',
        prompt_en: 'A duckling swimming in a pond with water lilies, thick outlines, coloring vignette',
        difficulty: 'easy'
      },
      {
        id: 8,
        animal: 'oso',
        prompt_es: 'Un oso panda bebé comiendo bambú, estilo kawaii, líneas negras sobre fondo blanco',
        prompt_en: 'A baby panda bear eating bamboo, kawaii style, black lines on white background',
        difficulty: 'medium'
      }
    ];
    
    this.lastUsedPrompts = new Set();
  }

  // Get a random prompt ensuring variety
  getRandomPrompt() {
    // Reset if we've used all prompts
    if (this.lastUsedPrompts.size >= this.prompts.length - 1) {
      this.lastUsedPrompts.clear();
    }

    // Get available prompts
    const availablePrompts = this.prompts.filter(prompt => 
      !this.lastUsedPrompts.has(prompt.id)
    );

    // Select random prompt
    const randomIndex = Math.floor(Math.random() * availablePrompts.length);
    const selectedPrompt = availablePrompts[randomIndex];

    // Mark as used
    this.lastUsedPrompts.add(selectedPrompt.id);

    return selectedPrompt;
  }

  // Get prompt by animal type
  getPromptByAnimal(animalName) {
    return this.prompts.find(prompt => 
      prompt.animal.toLowerCase() === animalName.toLowerCase()
    );
  }

  // Get prompts by difficulty
  getPromptsByDifficulty(difficulty) {
    return this.prompts.filter(prompt => prompt.difficulty === difficulty);
  }

  // Build enhanced prompt for AI generation
  buildEnhancedPrompt(promptData, language = 'es') {
    const basePrompt = language === 'es' ? promptData.prompt_es : promptData.prompt_en;
    
    return `
      Crea una imagen de libro para colorear de: ${basePrompt}
      
      REQUISITOS ESPECÍFICOS:
      - SOLO líneas negras gruesas (stroke 3-5px) sobre fondo completamente blanco
      - Sin colores, sin grises, sin sombras, sin degradados
      - Estilo viñeta: elementos contenidos en un marco visual claro
      - Formas simples y claras, perfectas para colorear
      - Espacios amplios entre líneas para facilitar el coloreado
      - Contornos bien definidos y cerrados
      - Estilo cartoon amigable para niños
      - El animal debe ser el elemento principal y estar centrado
      - Elementos decorativos simples alrededor (flores, hojas, etc.)
      - Imagen cuadrada, composición equilibrada
      
      La imagen debe parecer sacada directamente de un libro para colorear tradicional.
      Animal: ${promptData.animal}
      Dificultad: ${promptData.difficulty}
    `;
  }

  // Get all available animals
  getAllAnimals() {
    return this.prompts.map(prompt => prompt.animal);
  }

  // Get prompt statistics
  getStats() {
    return {
      total: this.prompts.length,
      easy: this.prompts.filter(p => p.difficulty === 'easy').length,
      medium: this.prompts.filter(p => p.difficulty === 'medium').length,
      hard: this.prompts.filter(p => p.difficulty === 'hard').length,
      used: this.lastUsedPrompts.size
    };
  }
}

export default new PromptsManager();