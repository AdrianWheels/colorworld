/**
 * Vercel Serverless Function — Stripe Webhook
 *
 * POST /api/stripe-webhook
 * Handles: checkout.session.completed → activa PRO en Supabase
 *          customer.subscription.deleted → desactiva PRO
 *
 * IMPORTANTE: requiere el raw body para verificar la firma de Stripe.
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Leer raw body (necesario para stripe.webhooks.constructEvent)
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const rawBody = Buffer.concat(chunks);

  const sig = req.headers['stripe-signature'];
  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Supabase admin not configured' });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const customerId = session.customer;

    if (userId) {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        app_metadata: { is_pro: true, stripe_customer_id: customerId },
      });
      if (error) {
        console.error('[stripe-webhook] Error activating PRO:', error);
        return res.status(500).json({ error: 'Failed to activate PRO' });
      }
      console.log(`[stripe-webhook] PRO activated for user ${userId}`);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const customerId = event.data.object.customer;

    // Buscar usuario por stripe_customer_id en app_metadata
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (error) {
      console.error('[stripe-webhook] Error listing users:', error);
      return res.status(500).json({ error: 'Failed to find user' });
    }

    const user = data?.users?.find(u => u.app_metadata?.stripe_customer_id === customerId);
    if (user) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        app_metadata: { is_pro: false },
      });
      if (updateError) {
        console.error('[stripe-webhook] Error deactivating PRO:', updateError);
      } else {
        console.log(`[stripe-webhook] PRO deactivated for user ${user.id}`);
      }
    }
  }

  return res.status(200).json({ received: true });
}
