import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook qui retourne true quand l'auth Supabase est complètement chargée
 * À utiliser dans tous les autres hooks qui font des requêtes DB
 */
export function useAuthReady() {
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (mounted) {
          setUserId(session?.user?.id || null);
          setIsReady(true);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        if (mounted) {
          setUserId(null);
          setIsReady(true); // Même en cas d'erreur, on considère que c'est "ready" (pas d'auth)
        }
      }
    };

    checkAuth();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          setUserId(session?.user?.id || null);
          setIsReady(true);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isReady, userId };
}
