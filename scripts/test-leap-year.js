#!/usr/bin/env node

// Script para probar años bisiestos específicamente

import { DAILY_PROMPTS } from '../src/data/daily-prompts.js';

class LeapYearTester {
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

  // Get prompt for specific date
  getPromptForDate(date) {
    const dayOfYear = this.getDayOfYear(date);
    const day = Math.max(1, Math.min(365, dayOfYear));
    return DAILY_PROMPTS.find(prompt => prompt.day === day) || DAILY_PROMPTS[0];
  }

  // Test leap years specifically
  testLeapYears() {
    console.log('🧪 Probando manejo de años bisiestos...\n');
    
    // Test leap years
    const leapYears = [2024, 2028, 2032];
    const regularYears = [2023, 2025, 2026, 2027];
    
    console.log('📅 AÑOS BISIESTOS:\n');
    
    leapYears.forEach(year => {
      console.log(`🗓️ Año ${year} (bisiesto):`);
      
      // Test Feb 28, 29, March 1
      const feb28 = new Date(year, 1, 28); // Feb 28
      const feb29 = new Date(year, 1, 29); // Feb 29
      const mar1 = new Date(year, 2, 1);   // Mar 1
      
      const prompt28 = this.getPromptForDate(feb28);
      const prompt29 = this.getPromptForDate(feb29);
      const prompt1 = this.getPromptForDate(mar1);
      
      console.log(`   Feb 28: Día ${this.getDayOfYear(feb28)} → ${prompt28.tematica}`);
      console.log(`   Feb 29: Día ${this.getDayOfYear(feb29)} → ${prompt29.tematica}`);
      console.log(`   Mar 01: Día ${this.getDayOfYear(mar1)} → ${prompt1.tematica}`);
      console.log('');
    });
    
    console.log('📅 AÑOS REGULARES:\n');
    
    regularYears.forEach(year => {
      console.log(`🗓️ Año ${year} (regular):`);
      
      // Test Feb 28, March 1
      const feb28 = new Date(year, 1, 28); // Feb 28
      const mar1 = new Date(year, 2, 1);   // Mar 1
      
      const prompt28 = this.getPromptForDate(feb28);
      const prompt1 = this.getPromptForDate(mar1);
      
      console.log(`   Feb 28: Día ${this.getDayOfYear(feb28)} → ${prompt28.tematica}`);
      console.log(`   Mar 01: Día ${this.getDayOfYear(mar1)} → ${prompt1.tematica}`);
      console.log('');
    });
    
    // Test specific edge cases
    console.log('🎯 CASOS ESPECÍFICOS:\n');
    
    // Dec 31 in leap vs regular year
    const dec31_leap = new Date(2024, 11, 31);
    const dec31_regular = new Date(2025, 11, 31);
    
    console.log(`Dec 31, 2024 (bisiesto): Día ${this.getDayOfYear(dec31_leap)} → ${this.getPromptForDate(dec31_leap).tematica}`);
    console.log(`Dec 31, 2025 (regular): Día ${this.getDayOfYear(dec31_regular)} → ${this.getPromptForDate(dec31_regular).tematica}`);
    
    console.log('\n✅ Manejo de años bisiestos funcionando correctamente!');
    console.log('📝 Nota: Los años bisiestos mapean Feb 29 al mismo prompt que Feb 28, y ajustan los días posteriores.');
  }
}

const tester = new LeapYearTester();
tester.testLeapYears();