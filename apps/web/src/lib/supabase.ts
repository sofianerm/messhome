import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// FIX: Forcer reconnexion Realtime au focus de la fenêtre
// Résout le problème de chargement infini quand Chrome est minimisé puis rouvert
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    supabase.realtime.disconnect();
    supabase.realtime.connect();
  });
}
