// Utility functions for handling CSV data and prompts
import { DAILY_PROMPTS } from '../data/daily-prompts.js';

export class PromptsManager {
  constructor() {
    this.prompts = DAILY_PROMPTS;
    this.lastUsedPrompts = new Set();
  }

  // Get prompt for specific day of year (1-365)
  getPromptForDay(dayOfYear) {
    // Ensure day is within range
    const day = Math.max(1, Math.min(365, dayOfYear));
    return this.prompts.find(prompt => prompt.day === day) || this.prompts[0];
  }

  // Get prompt for current date
  getPromptForToday() {
    const today = new Date();
    const dayOfYear = this.getDayOfYear(today);
    return this.getPromptForDay(dayOfYear);
  }

  // Get prompt for specific date
  getPromptForDate(date) {
    const dayOfYear = this.getDayOfYear(date);
    return this.getPromptForDay(dayOfYear);
  }

  // Calculate day of year (1-365/366) handling leap years
  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    // Handle leap years - if after Feb 29 in leap year, subtract 1 to map to 365-day system
    const isLeapYear = ((date.getFullYear() % 4 === 0) && (date.getFullYear() % 100 !== 0)) || (date.getFullYear() % 400 === 0);
    
    if (isLeapYear && dayOfYear > 59) { // After Feb 29 (day 59)
      return Math.min(365, dayOfYear - 1); // Map to 365-day system
    }
    
    return Math.min(365, dayOfYear);
  }

  // Get a random prompt ensuring variety
  getRandomPrompt() {
    // Use today's prompt as default
    return this.getPromptForToday();
  }

  // Get prompt by theme/tematica
  getPromptByTheme(theme) {
    return this.prompts.find(prompt => 
      prompt.tematica.toLowerCase() === theme.toLowerCase()
    );
  }

  // Get prompt by animal type (legacy support)
  getPromptByAnimal(animalName) {
    return this.prompts.find(prompt => 
      prompt.tematica.toLowerCase().includes(animalName.toLowerCase()) ||
      prompt.prompt_es.toLowerCase().includes(animalName.toLowerCase())
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
      - El elemento principal debe estar centrado
      - Elementos decorativos simples alrededor (flores, hojas, etc.)
      - Imagen cuadrada, composición equilibrada
      
      La imagen debe parecer sacada directamente de un libro para colorear tradicional.
      Temática: ${promptData.tematica}
      Dificultad: ${promptData.difficulty}
    `;
  }

  // Get all available themes
  getAllThemes() {
    return this.prompts.map(prompt => prompt.tematica);
  }

  // Get prompt statistics
  getStats() {
    return {
      total: this.prompts.length,
      facil: this.prompts.filter(p => p.difficulty === 'Fácil').length,
      medio: this.prompts.filter(p => p.difficulty === 'Medio').length,
      dificil: this.prompts.filter(p => p.difficulty === 'Difícil').length,
      used: this.lastUsedPrompts.size
    };
  }
}

export default new PromptsManager();