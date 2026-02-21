import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';
import Logger from '../utils/logger.js';
import { migrateLocalStorageToSupabase } from '../services/migrationService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // isLoggedIn: has account (free or PRO). If null, is anonymous.
  const isLoggedIn = user !== null;
  const isPro = user?.app_metadata?.is_pro ?? false;

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION after processing URL hash (handles OAuth redirects)
    // This is more reliable than getSession() which may run before the hash is parsed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      Logger.log('🔄 Auth state change:', _event, session?.user?.email ?? 'no user');

      // Migrate localStorage when user signs in for the first time
      if (_event === 'SIGNED_IN' && session?.user) {
        migrateLocalStorageToSupabase(session.user.id);
      }
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
