/**
 * Vercel Serverless Function — Gemini image generation
 *
 * La API key de Gemini vive SOLO aquí (server-side).
 * El bundle del navegador nunca la ve.
 *
 * POST /api/generate-image
 * Body: { prompt: string }
 * Returns: { success: true, imageData: base64, mimeType: string }
 */

import { GoogleGenAI } from '@google/genai';

export const config = {
  maxDuration: 60,
};

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://coloreveryday.vercel.app',
];

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
  }

  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt (string) is required' });
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });

    const response = await genAI.models.generateContentStream({
      model: 'gemini-2.5-flash-image-preview',
      config: { responseModalities: ['IMAGE'] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    let imageData = null;

    for await (const chunk of response) {
      const inlineData = chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (inlineData) {
        imageData = { data: inlineData.data, mimeType: inlineData.mimeType || 'image/png' };
        break;
      }
    }

    if (!imageData) {
      return res.status(500).json({ error: 'Gemini did not return an image' });
    }

    return res.status(200).json({
      success: true,
      imageData: imageData.data,
      mimeType: imageData.mimeType,
    });

  } catch (error) {
    console.error('[generate-image] Error:', error);
    if (error.status === 429 || error.code === 429) {
      return res.status(429).json({ error: 'Gemini quota exceeded. Try later.' });
    }
    return res.status(500).json({ error: error.message || 'Generation failed' });
  }
}
