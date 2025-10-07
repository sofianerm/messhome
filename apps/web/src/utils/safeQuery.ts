/**
 * Wrapper pour les requêtes Supabase avec timeout de sécurité
 * Évite les chargements infinis en cas de problème
 */

export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  return Promise.race([
    queryFn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
    ),
  ]);
}

/**
 * Hook utilitaire pour détecter si loading dure trop longtemps
 */
export function useLoadingTimeout(loading: boolean, timeoutMs: number = 10000) {
  const [timedOut, setTimedOut] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      console.error('⚠️ Loading timeout - forcing loading to false');
      setTimedOut(true);
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [loading, timeoutMs]);

  return timedOut;
}
