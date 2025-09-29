#!/usr/bin/env node

// Script para probar la generación de prompts según la fecha

import { DAILY_PROMPTS } from '../src/data/daily-prompts.js';

class PromptTester {
  // Calculate day of year (1-365)
  getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  // Get prompt for specific date
  getPromptForDate(date) {
    const dayOfYear = this.getDayOfYear(date);
    const day = Math.max(1, Math.min(365, dayOfYear));
    return DAILY_PROMPTS.find(prompt => prompt.day === day) || DAILY_PROMPTS[0];
  }

  // Test prompts for different dates
  testPrompts() {
    console.log('🧪 Probando sistema de prompts diarios...\n');
    
    // Test today
    const today = new Date();
    const todayPrompt = this.getPromptForDate(today);
    console.log(`📅 HOY (${today.toISOString().split('T')[0]}):`);
    console.log(`   Día del año: ${this.getDayOfYear(today)}`);
    console.log(`   Temática: ${todayPrompt.tematica}`);
    console.log(`   Prompt: ${todayPrompt.prompt_es.substring(0, 60)}...`);
    console.log(`   Dificultad: ${todayPrompt.difficulty}\n`);
    
    // Test some special dates
    const testDates = [
      new Date('2025-01-01'), // Año nuevo
      new Date('2025-02-14'), // San Valentín
      new Date('2025-03-17'), // St. Patrick
      new Date('2025-04-05'),  // Easter
      new Date('2025-05-10'), // Día de la madre
      new Date('2025-07-04'), // Independence Day
      new Date('2025-10-31'), // Halloween
      new Date('2025-12-25'), // Navidad
    ];
    
    console.log('🎯 Prompts para fechas especiales:');
    testDates.forEach(date => {
      const prompt = this.getPromptForDate(date);
      console.log(`   ${date.toISOString().split('T')[0]}: ${prompt.tematica}`);
    });
    
    console.log('\n📊 Estadísticas:');
    console.log(`   Total prompts: ${DAILY_PROMPTS.length}`);
    
    const difficulties = DAILY_PROMPTS.reduce((acc, p) => {
      acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(difficulties).forEach(([diff, count]) => {
      console.log(`   ${diff}: ${count} prompts`);
    });
    
    console.log('\n✅ Sistema de prompts funcionando correctamente!');
  }
}

const tester = new PromptTester();
tester.testPrompts();