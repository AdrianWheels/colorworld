import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthModal.css';

export default function AuthModal({ isOpen, onClose }) {
  const [view, setView] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, user, isLoggedIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    const fn = view === 'login' ? signInWithEmail : signUpWithEmail;
    const { error } = await fn(email, password);

    setIsSubmitting(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(view === 'register' ? 'Revisa tu email para confirmar tu cuenta.' : '¡Bienvenido!');
      if (view === 'login') onClose();
    }
  };

  const handleGoogle = async () => {
    setErrorMsg('');
    const { error } = await signInWithGoogle();
    if (error) setErrorMsg(error.message);
    // On success, redirects to Google — modal closes via auth state change
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="auth-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="auth-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="auth-close" onClick={onClose}>✕</button>

          {/* Profile view (logged in user) */}
          {isLoggedIn ? (
            <div className="auth-profile">
              <div className="auth-avatar">
                {user?.email?.[0]?.toUpperCase() ?? '?'}
              </div>
              <p className="auth-email">{user?.email}</p>
              <button className="auth-btn-secondary" onClick={handleSignOut}>
                Cerrar sesión
              </button>
            </div>
          ) : (
            /* Login/register view */
            <>
              <h2 className="auth-title">
                {view === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </h2>
              <p className="auth-subtitle">
                {view === 'login'
                  ? 'Accede para guardar tu progreso en todos tus dispositivos'
                  : 'Tu racha y dibujos se sincronizarán automáticamente'}
              </p>

              <button className="auth-btn-google" onClick={handleGoogle}>
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continuar con Google
              </button>

              <div className="auth-divider"><span>o</span></div>

              <form onSubmit={handleSubmit} className="auth-form">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="auth-input"
                />
                {errorMsg && <p className="auth-error">{errorMsg}</p>}
                {successMsg && <p className="auth-success">{successMsg}</p>}
                <button type="submit" className="auth-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? '...' : view === 'login' ? 'Entrar' : 'Crear cuenta'}
                </button>
              </form>

              <p className="auth-switch">
                {view === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <button
                  className="auth-switch-btn"
                  onClick={() => { setView(view === 'login' ? 'register' : 'login'); setErrorMsg(''); setSuccessMsg(''); }}
                >
                  {view === 'login' ? 'Regístrate' : 'Inicia sesión'}
                </button>
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
