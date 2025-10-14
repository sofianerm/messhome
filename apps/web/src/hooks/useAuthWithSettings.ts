import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type FamilySettings = Database['public']['Tables']['family_settings']['Row'];

interface AuthWithSettingsState {
  user: User | null;
  settings: FamilySettings | null;
  loading: boolean;
  needsOnboarding: boolean;
}

/**
 * Hook simplifié qui gère auth + settings
 * VERSION SIMPLE ET PROPRE - PAS DE COMPLICATIONS
 */
export function useAuthWithSettings() {
  const [state, setState] = useState<AuthWithSettingsState>({
    user: null,
    settings: null,
    loading: true,
    needsOnboarding: false,
  });

  // Fonction pour charger user + settings
  const loadUserAndSettings = async () => {
    try {
      console.log('🔄 Loading user and settings...');

      // 1. Charger la session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        console.log('❌ No session');
        setState({
          user: null,
          settings: null,
          loading: false,
          needsOnboarding: false,
        });
        return;
      }

      const user = session.user;
      console.log('✅ User loaded:', user.id);

      // 2. Charger les family_settings
      const { data: settings } = await supabase
        .from('family_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('📋 Settings loaded:', settings);

      // 3. Déterminer si onboarding nécessaire
      const needsOnboarding = !settings || settings.onboarding_completed !== true;

      console.log('🎯 Needs onboarding:', needsOnboarding);

      setState({
        user,
        settings: settings || null,
        loading: false,
        needsOnboarding,
      });

    } catch (error) {
      console.error('❌ Error in loadUserAndSettings:', error);
      setState({
        user: null,
        settings: null,
        loading: false,
        needsOnboarding: false,
      });
    }
  };

  // Charger au montage + écouter les changements d'auth
  useEffect(() => {
    // Charger immédiatement
    loadUserAndSettings();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth event:', event);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          // Recharger quand l'auth change
          await loadUserAndSettings();
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            settings: null,
            loading: false,
            needsOnboarding: false,
          });
        }
      }
    );

    // Détecter quand l'onglet redevient visible (Edge bloque tout après veille)
    let wasHidden = false;
    let hiddenTime = 0;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        wasHidden = true;
        hiddenTime = Date.now();
      } else if (wasHidden) {
        const hiddenDuration = Date.now() - hiddenTime;
        console.log(`👁️ Page visible après ${hiddenDuration}ms`);

        // Si caché plus de 3 secondes, recharger la page
        // (Edge bloque les connexions après mise en veille)
        if (hiddenDuration > 3000) {
          console.warn('⚠️ Rechargement après veille (Edge fix)');
          window.location.reload();
        }

        wasHidden = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user: state.user,
    settings: state.settings,
    loading: state.loading,
    needsOnboarding: state.needsOnboarding,
    isAuthenticated: !!state.user,
    signOut,
    reload: loadUserAndSettings,
  };
}
