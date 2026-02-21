import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';
import Logger from '../utils/logger.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // isLoggedIn: has account (free or PRO). If null, is anonymous.
  const isLoggedIn = user !== null;
  const isPro = user?.app_metadata?.is_pro ?? false;

  useEffect(() => {
    // Restore existing session if any (supabase-js stores token in localStorage)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (session?.user) {
        Logger.log('🔑 Sesión restaurada:', session.user.email);
      }
    });

    // Subscribe to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      Logger.log('🔄 Auth state change:', _event);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUpWithEmail = async (email, password) => {
    return supabase.auth.signUp({ email, password });
  };

  const signInWithEmail = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signInWithGoogle = async () => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    return supabase.auth.signOut();
    // After signOut, onAuthStateChange will set user = null automatically
  };

  const value = {
    user,
    session,
    isLoggedIn,
    isPro,
    isLoading,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
