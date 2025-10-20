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
    // Désactiver multi-tab évite les événements SIGNED_IN répétés au changement d'onglet
    // Voir: https://github.com/supabase/supabase/issues/7250
    multiTab: false,
  },
  realtime: {
    // DÉSACTIVÉ: Supabase Realtime peut causer des boucles de reconnexion
    // Si vous n'utilisez pas les subscriptions temps-réel, mieux vaut le désactiver
    // eventsPerSecond: 2,
  },
});

// FIX RETIRÉ: La reconnexion Realtime causait aussi des boucles infinies
