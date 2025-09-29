#!/usr/bin/env node

// Script de deployment para ColorEveryday

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const deployOptions = {
  vercel: {
    name: 'Vercel',
    description: 'Frontend estático con CDN global',
    commands: [
      'npm run build',
      'npx vercel --prod'
    ],
    requirements: [
      'Instalar Vercel CLI: npm i -g vercel',
      'Autenticar: vercel login',
      'Conectar proyecto: vercel link'
    ]
  },
  railway: {
    name: 'Railway',
    description: 'Full-stack con GitHub Actions',
    commands: [
      'railway login',
      'railway link',
      'railway up'
    ],
    requirements: [
      'Instalar Railway CLI: npm i -g @railway/cli',
      'Crear cuenta en railway.app',
      'Conectar repositorio de GitHub'
    ]
  },
  netlify: {
    name: 'Netlify',
    description: 'Frontend con build automático',
    commands: [
      'npm run build',
      'npx netlify deploy --prod --dir=dist'
    ],
    requirements: [
      'Instalar Netlify CLI: npm i -g netlify-cli',
      'Autenticar: netlify login',
      'Conectar proyecto: netlify init'
    ]
  }
};

function printBanner() {
  console.log('\n🎨 ColorEveryday - Deploy Assistant');
  console.log('====================================\n');
}

function printOptions() {
  console.log('📦 Opciones de deployment disponibles:\n');
  
  Object.entries(deployOptions).forEach(([key, option], index) => {
    console.log(`${index + 1}. ${option.name}`);
    console.log(`   ${option.description}`);
    console.log(`   Comandos: ${option.commands.join(' && ')}\n`);
  });
}

function printRequirements(platform) {
  const option = deployOptions[platform];
  console.log(`\n📋 Requisitos para ${option.name}:`);
  option.requirements.forEach((req, index) => {
    console.log(`   ${index + 1}. ${req}`);
  });
  console.log('');
}

function printDeploymentGuide() {
  console.log('\n🚀 Guía de Deployment Completa:\n');
  
  console.log('1️⃣ PREPARACIÓN:');
  console.log('   - Asegúrate de tener .env con VITE_GEMINI_API_KEY');
  console.log('   - Ejecuta: npm run build');
  console.log('   - Verifica que no hay errores\n');
  
  console.log('2️⃣ GITHUB SECRETS:');
  console.log('   - Ve a tu repo > Settings > Secrets and Variables > Actions');
  console.log('   - Añade: GEMINI_API_KEY (tu API key de Gemini)');
  console.log('   - Esto permite que GitHub Actions genere imágenes diariamente\n');
  
  console.log('3️⃣ HOSTING RECOMENDADO:');
  console.log('   🥇 Railway: Full-stack + GitHub Actions (RECOMENDADO)');
  console.log('      - Ejecuta GitHub Actions automáticamente');
  console.log('      - Incluye base de datos si la necesitas');
  console.log('      - $5/mes después del plan gratuito');
  console.log('');
  console.log('   🥈 Vercel + GitHub Actions: Frontend + Generación automática');
  console.log('      - Vercel para el frontend (gratis)');
  console.log('      - GitHub Actions para generar imágenes (gratis)');
  console.log('      - Requiere configurar ambos');
  console.log('');
  console.log('   🥉 Netlify: Similar a Vercel');
  console.log('      - Frontend gratuito');
  console.log('      - GitHub Actions separado\n');
  
  console.log('4️⃣ VERIFICACIÓN POST-DEPLOY:');
  console.log('   - ✅ Web funciona correctamente');
  console.log('   - ✅ GitHub Action se ejecuta diariamente');
  console.log('   - ✅ Imágenes se generan automáticamente');
  console.log('   - ✅ Archivos se guardan en public/generated-images/\n');
}

async function checkPrerequisites() {
  console.log('🔍 Verificando prerrequisitos...\n');
  
  try {
    // Check if build works
    await execAsync('npm run build');
    console.log('✅ Build funciona correctamente');
  } catch (error) {
    console.log('❌ Error en build:', error.message);
    return false;
  }
  
  // Check if .env exists
  try {
    await execAsync('test -f .env');
    console.log('✅ Archivo .env encontrado');
  } catch {
    console.log('⚠️ Archivo .env no encontrado');
    console.log('   Copia .env.example a .env y añade tu GEMINI_API_KEY');
  }
  
  console.log('');
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  printBanner();
  
  if (command === 'check') {
    await checkPrerequisites();
    return;
  }
  
  if (command && deployOptions[command]) {
    printRequirements(command);
    console.log(`💡 Para deployar con ${deployOptions[command].name}:`);
    deployOptions[command].commands.forEach(cmd => {
      console.log(`   ${cmd}`);
    });
    console.log('');
    return;
  }
  
  if (command === 'guide') {
    printDeploymentGuide();
    return;
  }
  
  // Default: show options
  printOptions();
  console.log('💡 Uso:');
  console.log('   npm run deploy check     - Verificar prerrequisitos');
  console.log('   npm run deploy guide     - Guía completa de deployment');
  console.log('   npm run deploy vercel    - Instrucciones para Vercel');
  console.log('   npm run deploy railway   - Instrucciones para Railway');
  console.log('   npm run deploy netlify   - Instrucciones para Netlify\n');
}

main().catch(console.error);