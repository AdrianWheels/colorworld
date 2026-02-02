#!/usr/bin/env node

// Script de prueba para verificar qué modelo de imágenes funciona

import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ VITE_GEMINI_API_KEY no encontrada');
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Modelos a probar
const modelsToTest = [
    { name: 'gemini-2.5-flash-image', type: 'gemini' },
    { name: 'gemini-2.5-flash-image-preview', type: 'gemini' },
    { name: 'imagen-4.0-generate-001', type: 'imagen' },
    { name: 'imagen-4.0-flash-generate', type: 'imagen' },
];

async function testGeminiModel(modelName) {
    try {
        console.log(`\n🔄 Probando ${modelName}...`);
        const response = await ai.models.generateContent({
            model: modelName,
            contents: 'Generate a simple black and white line drawing of a star',
            config: { responseModalities: ['IMAGE'] }
        });

        if (response.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
            console.log(`✅ ${modelName} - FUNCIONA!`);
            return true;
        } else {
            console.log(`⚠️ ${modelName} - Respuesta sin imagen`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${modelName} - Error: ${error.status || error.message}`);
        return false;
    }
}

async function testImagenModel(modelName) {
    try {
        console.log(`\n🔄 Probando ${modelName}...`);
        const response = await ai.models.generateImages({
            model: modelName,
            prompt: 'A simple black and white line drawing of a star',
            config: { numberOfImages: 1 }
        });

        if (response.generatedImages?.length > 0) {
            console.log(`✅ ${modelName} - FUNCIONA!`);
            return true;
        } else {
            console.log(`⚠️ ${modelName} - Sin imágenes generadas`);
            return false;
        }
    } catch (error) {
        console.log(`❌ ${modelName} - Error: ${error.status || error.message}`);
        return false;
    }
}

async function main() {
    console.log('🧪 Probando modelos de generación de imágenes...\n');
    console.log('API Key:', apiKey ? '✅ Configurada' : '❌ No encontrada');

    for (const model of modelsToTest) {
        if (model.type === 'gemini') {
            await testGeminiModel(model.name);
        } else {
            await testImagenModel(model.name);
        }
        // Pequeña pausa entre pruebas para evitar rate limiting
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log('\n✅ Pruebas completadas');
}

main();
