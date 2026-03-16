import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const BENEFITS = [
  { icon: '🎨', text: 'Genera dibujos con tu propio prompt de IA' },
  { icon: '☁️', text: 'Sincroniza tus obras en todos tus dispositivos' },
  { icon: '🖼️', text: 'Exporta en alta resolución (4K)' },
  { icon: '⏱️', text: 'Exporta timelapse de tu proceso de pintado' },
  { icon: '🚫', text: 'Sin anuncios, nunca' },
];

export default function UpgradeModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, userEmail: user.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear la sesión de pago');

      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '1.5rem', padding: '2rem',
              maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              position: 'relative',
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.25rem', color: '#9ca3af', lineHeight: 1,
              }}
            >✕</button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✨</div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#111' }}>
                ColorEveryday PRO
              </h2>
              <p style={{ margin: '0.5rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                Lleva tu práctica artística al siguiente nivel
              </p>
            </div>

            {/* Benefits */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {BENEFITS.map((b, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{b.icon}</span>
                  <span style={{ fontSize: '0.9rem', color: '#374151' }}>{b.text}</span>
                </li>
              ))}
            </ul>

            {/* Price */}
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              borderRadius: '1rem', padding: '1rem', textAlign: 'center', marginBottom: '1.25rem',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#92400e' }}>€4,99<span style={{ fontSize: '1rem', fontWeight: 500 }}>/mes</span></div>
              <div style={{ fontSize: '0.8rem', color: '#78350f', marginTop: '0.25rem' }}>
                Cancela cuando quieras · Sin permanencia
              </div>
            </div>

            {error && (
              <p style={{ color: '#dc2626', fontSize: '0.85rem', textAlign: 'center', marginBottom: '0.75rem' }}>
                {error}
              </p>
            )}

            {/* CTA */}
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              style={{
                width: '100%', padding: '0.875rem',
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff', border: 'none', borderRadius: '0.75rem',
                fontSize: '1rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
              }}
            >
              {isLoading ? 'Redirigiendo a Stripe...' : 'Suscribirme por €4,99/mes'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem' }}>
              Pago seguro con Stripe · Puedes cancelar en cualquier momento
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
