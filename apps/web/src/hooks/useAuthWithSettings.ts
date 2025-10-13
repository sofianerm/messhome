import { useState, useEffect, useRef } from 'react';
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
 * Hook simplifié qui gère auth + settings en une seule passe
 * Évite les problèmes de synchronisation entre useAuth et useFamilySettings
 */
export function useAuthWithSettings() {
  const [state, setState] = useState<AuthWithSettingsState>({
    user: null,
    settings: null,
    loading: true,
    needsOnboarding: false,
  });

  // Protection anti-boucle
  const loadingRef = useRef(false);

  // Fonction pour charger user + settings
  const loadUserAndSettings = async () => {
    // Éviter les appels simultanés
    if (loadingRef.current) {
      console.log('⏭️ Already loading, skipping...');
      return;
    }

    loadingRef.current = true;
    try {
      console.log('🔄 Loading user and settings...');

      // 1. Charger la session avec timeout (augmenté à 30s pour OAuth)
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Session timeout après 30s')), 30000)
      );

      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]).catch((err) => {
        console.error('⏱️ Session timeout, retrying without timeout...');
        // Si timeout, réessayer sans timeout
        return supabase.auth.getSession();
      });

      if (sessionError || !session?.user) {
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

      // 2. Charger les family_settings pour cet user avec timeout
      const settingsPromise = supabase
        .from('family_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const settingsTimeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Settings timeout après 30s')), 30000)
      );

      const { data: settings, error: settingsError } = await Promise.race([
        settingsPromise,
        settingsTimeoutPromise
      ]).catch((err) => {
        console.error('⏱️ Settings timeout, retrying without timeout...');
        // Si timeout, réessayer sans timeout
        return supabase
          .from('family_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
      });

      if (settingsError) {
        console.error('❌ Error loading settings:', settingsError);
      }

      console.log('📋 Settings loaded:', settings);
      console.log('📋 onboarding_completed:', settings?.onboarding_completed);

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
    } finally {
      loadingRef.current = false;
    }
  };

  // Charger au montage + écouter les changements d'auth
  useEffect(() => {
    // Si on vient juste de se connecter via OAuth, attendre les events
    const justConnected = sessionStorage.getItem('oauth_just_connected');

    if (justConnected) {
      console.log('🔑 OAuth just connected, waiting for auth events...');
      sessionStorage.removeItem('oauth_just_connected');
      // Ne pas charger maintenant, attendre l'event SIGNED_IN/INITIAL_SESSION
    } else {
      loadUserAndSettings();
    }

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          // IMPORTANT: Débloquer loadingRef IMMÉDIATEMENT avant de recharger
          // (cas OAuth où le premier chargement est toujours en cours)
          loadingRef.current = false;

          console.log('🔔 Auth event:', event, 'loadingRef après déblocage:', loadingRef.current);

          // Attendre un peu que le callback finisse d'établir la session
          await new Promise(resolve => setTimeout(resolve, 200));

          await loadUserAndSettings();
        } else if (event === 'SIGNED_OUT') {
          loadingRef.current = false; // Débloquer aussi
          setState({
            user: null,
            settings: null,
            loading: false,
            needsOnboarding: false,
          });
        }
      }
    );

    // Détecter quand l'onglet redevient visible (Edge/Chrome mettent en veille)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Tab visible - checking if stuck...');

        // Si loadingRef bloqué depuis trop longtemps, débloquer
        if (loadingRef.current && state.loading) {
          console.warn('⚠️ LoadingRef bloqué - reset forcé');
          loadingRef.current = false;
          loadUserAndSettings();
        }
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
