import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, AuthError } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  locale: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  // Charger session au démarrage
  useEffect(() => {
    loadSession();

    // Écouter les changements d'auth (Supabase gère le refresh automatiquement)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setState(prev => ({ ...prev, user: null, profile: null, loading: false }));
        }
      }
    );

    // FIX DÉSACTIVÉ: Le refresh de session causait des boucles infinies
    // La reconnexion Realtime dans supabase.ts devrait suffire

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadSession() {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setState(prev => ({ ...prev, user: null, profile: null, loading: false }));
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load session',
        loading: false
      }));
    }
  }

  async function loadProfile(userId: string) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();

      setState({
        user: user,
        profile: profile,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load profile',
        loading: false
      }));
    }
  }

  // ==================== SIGN UP ====================
  async function signUp(email: string, password: string, fullName?: string) {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
          },
        },
      });

      if (error) throw error;

      // Le trigger handle_new_user() va créer automatiquement le profil
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign up';
      setState(prev => ({ ...prev, error: message, loading: false }));
      return { success: false, error: message };
    }
  }

  // ==================== SIGN IN ====================
  async function signIn(email: string, password: string) {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in';
      setState(prev => ({ ...prev, error: message, loading: false }));
      return { success: false, error: message };
    }
  }

  // ==================== SIGN IN WITH GOOGLE ====================
  async function signInWithGoogle() {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in with Google';
      setState(prev => ({ ...prev, error: message, loading: false }));
      return { success: false, error: message };
    }
  }

  // ==================== SIGN OUT ====================
  async function signOut() {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign out';
      setState(prev => ({ ...prev, error: message, loading: false }));
      return { success: false, error: message };
    }
  }

  // ==================== UPDATE PROFILE ====================
  async function updateProfile(updates: Partial<Profile>) {
    try {
      if (!state.user) throw new Error('Not authenticated');

      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id)
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({ ...prev, profile: data, loading: false }));

      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      setState(prev => ({ ...prev, error: message, loading: false }));
      return { success: false, error: message };
    }
  }

  // ==================== RESET PASSWORD ====================
  async function resetPassword(email: string) {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setState(prev => ({ ...prev, loading: false }));

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      setState(prev => ({ ...prev, error: message, loading: false }));
      return { success: false, error: message };
    }
  }

  return {
    // State
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,

    // Methods
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    resetPassword,
    refreshSession: loadSession,
  };
}
