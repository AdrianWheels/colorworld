import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import supabase from '../services/supabaseClient';

export default function ProSuccess() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [refreshed, setRefreshed] = useState(false);

  useEffect(() => {
    // Refrescar la sesión para que isPro se actualice en AuthContext
    supabase.auth.refreshSession().finally(() => {
      setRefreshed(true);
    });
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #fef9c3, #fde68a, #fcd34d)',
      padding: '1rem',
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        style={{
          background: '#fff', borderRadius: '2rem', padding: '3rem 2rem',
          maxWidth: '480px', width: '100%', textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{ fontSize: '4rem', marginBottom: '1rem' }}
        >
          🎉
        </motion.div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111', margin: '0 0 0.5rem' }}>
          {t('app.proSuccess.title')}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: 1.6 }}>
          {t('app.proSuccess.subtitle')}
        </p>

        <ul style={{
          listStyle: 'none', padding: 0, margin: '0 0 2rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          textAlign: 'left',
        }}>
          {t('app.proSuccess.features', { returnObjects: true }).map((item, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#374151' }}>
              {item}
            </li>
          ))}
        </ul>

        <button
          onClick={() => navigate('/')}
          disabled={!refreshed}
          style={{
            width: '100%', padding: '0.875rem',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#fff', border: 'none', borderRadius: '0.75rem',
            fontSize: '1rem', fontWeight: 700,
            cursor: refreshed ? 'pointer' : 'not-allowed',
            opacity: refreshed ? 1 : 0.7,
          }}
        >
          {refreshed ? t('app.proSuccess.cta') : t('app.proSuccess.ctaLoading')}
        </button>
      </motion.div>
    </div>
  );
}
