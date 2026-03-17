import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const MAX_CHARS = 150;

export default function ProPromptModal({ isOpen, onClose, onGenerate, isGenerating }) {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;
    onGenerate(prompt.trim());
  };

  const handleClose = () => {
    if (!isGenerating) setPrompt('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
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
              maxWidth: '440px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
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
                {t('app.proPrompt.title')}
              </h2>
            </div>

            {/* Textarea */}
            <div style={{ marginBottom: '0.5rem', position: 'relative' }}>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value.slice(0, MAX_CHARS))}
                placeholder={t('app.proPrompt.placeholder')}
                disabled={isGenerating}
                rows={4}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '0.75rem', borderRadius: '0.75rem',
                  border: '2px solid #e5e7eb', fontSize: '0.95rem',
                  resize: 'none', outline: 'none', fontFamily: 'inherit',
                  color: '#374151', lineHeight: 1.5,
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#f59e0b')}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>

            {/* Char counter */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '1rem',
            }}>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                {t('app.proPrompt.hint')}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: prompt.length >= MAX_CHARS ? '#dc2626' : '#9ca3af',
                flexShrink: 0, marginLeft: '0.5rem',
              }}>
                {t('app.proPrompt.charCount', { count: prompt.length })}
              </span>
            </div>

            {/* Loading state */}
            {isGenerating && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: '#fef3c7', borderRadius: '0.75rem',
                padding: '0.75rem', marginBottom: '1rem',
              }}>
                <div style={{
                  width: '20px', height: '20px', border: '2px solid #f59e0b',
                  borderTopColor: 'transparent', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite', flexShrink: 0,
                }} />
                <span style={{ fontSize: '0.9rem', color: '#92400e' }}>
                  {t('app.proPrompt.generatingOverlay')}
                </span>
              </div>
            )}

            {/* Buttons */}
            {isGenerating ? (
              <button
                onClick={handleClose}
                style={{
                  width: '100%', padding: '0.875rem',
                  background: '#f3f4f6', color: '#374151',
                  border: 'none', borderRadius: '0.75rem',
                  fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
                }}
              >
                {t('app.proPrompt.cancel')}
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                style={{
                  width: '100%', padding: '0.875rem',
                  background: prompt.trim()
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : '#e5e7eb',
                  color: prompt.trim() ? '#fff' : '#9ca3af',
                  border: 'none', borderRadius: '0.75rem',
                  fontSize: '1rem', fontWeight: 700,
                  cursor: prompt.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >
                {t('app.proPrompt.cta')}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
