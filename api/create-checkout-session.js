/**
 * Vercel Serverless Function — Stripe Checkout Session
 *
 * POST /api/create-checkout-session
 * Body: { userId: string, userEmail: string }
 * Returns: { url: string } — Stripe Hosted Checkout URL
 */

import Stripe from 'stripe';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://coloreveryday.vercel.app',
];

async function parseBody(req) {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString());
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID } = process.env;
  if (!STRIPE_SECRET_KEY || !STRIPE_PRO_PRICE_ID) {
    return res.status(500).json({ error: 'Stripe not configured on server' });
  }

  let body;
  try {
    body = await parseBody(req);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const { userId, userEmail } = body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: STRIPE_PRO_PRICE_ID, quantity: 1 }],
      customer_email: userEmail || undefined,
      client_reference_id: userId,
      allow_promotion_codes: true,
      success_url: `${origin}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('[create-checkout-session] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
