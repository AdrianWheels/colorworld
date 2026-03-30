/**
 * Vercel Serverless Function — Stripe Checkout Session
 *
 * POST /api/create-checkout-session
 * Headers: Authorization: Bearer <supabase-jwt>
 * Returns: { url: string } — Stripe Hosted Checkout URL
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!STRIPE_SECRET_KEY || !STRIPE_PRO_PRICE_ID) {
    return res.status(500).json({ error: 'Stripe not configured on server' });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Supabase not configured on server' });
  }

  // Verify auth — use the JWT to get the real user instead of trusting the body
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authorization required' });

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  // Use the authenticated user's ID instead of trusting the body
  const userId = user.id;
  const userEmail = user.email;

  try {
    const stripe = new Stripe(STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: STRIPE_PRO_PRICE_ID, quantity: 1 }],
      customer_email: userEmail || undefined,
      client_reference_id: userId,
      allow_promotion_codes: true,
      success_url: `${ALLOWED_ORIGINS.includes(origin) ? origin : 'https://coloreveryday.vercel.app'}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${ALLOWED_ORIGINS.includes(origin) ? origin : 'https://coloreveryday.vercel.app'}/`,
    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('[create-checkout-session] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
