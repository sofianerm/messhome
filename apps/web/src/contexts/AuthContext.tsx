import { createContext, useContext, ReactNode } from 'react';
import { useAuthWithSettings } from '../hooks/useAuthWithSettings';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type FamilySettings = Database['public']['Tables']['family_settings']['Row'];

interface AuthContextValue {
  user: User | null;
  settings: FamilySettings | null;
  loading: boolean;
  needsOnboarding: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthWithSettings();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Alias pour compatibilité
export function useFamilySettings() {
  const { settings, loading, reload } = useAuth();
  return {
    settings,
    loading,
    updateSettings: async (updates: any) => {
      // TODO: Implémenter updateSettings
      await reload();
    },
    refetch: reload,
  };
}
