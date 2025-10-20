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
    console.log('🔵 useAuthWithSettings MOUNTED');

    // Charger immédiatement
    loadUserAndSettings();

    // Garder trace de l'userId actuel pour éviter rechargements inutiles
    let lastUserId: string | null = null;

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth event:', event, 'userId:', session?.user?.id);

        const newUserId = session?.user?.id || null;

        if (event === 'SIGNED_OUT') {
          lastUserId = null;
          setState({
            user: null,
            settings: null,
            loading: false,
            needsOnboarding: false,
          });
        } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          // WORKAROUND: Supabase émet SIGNED_IN au lieu de TOKEN_REFRESHED lors du focus
          // On recharge SEULEMENT si l'userId a changé (vrai nouveau sign-in)
          // Voir: https://github.com/supabase/supabase/issues/7250
          if (newUserId !== lastUserId) {
            console.log('🆕 Nouvel utilisateur, rechargement settings');
            lastUserId = newUserId;
            await loadUserAndSettings();
          } else {
            console.log('✅ Même user, ignoré (refresh token silencieux)');
          }
        }
        // TOKEN_REFRESHED est ignoré - pas besoin de recharger les settings
      }
    );

    return () => {
      subscription.unsubscribe();
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
