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
  realtime: {
    // DÉSACTIVÉ: Supabase Realtime peut causer des boucles de reconnexion
    // Si vous n'utilisez pas les subscriptions temps-réel, mieux vaut le désactiver
    // eventsPerSecond: 2,
  },
});

// FIX RETIRÉ: La reconnexion Realtime causait aussi des boucles infinies
