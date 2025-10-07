import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type FamilySettings = Database['public']['Tables']['family_settings']['Row'];
type FamilySettingsUpdate = Database['public']['Tables']['family_settings']['Update'];

export function useFamilySettings() {
  const [settings, setSettings] = useState<FamilySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les paramètres
  const fetchSettings = async () => {
    try {
      setLoading(true);

      // IMPORTANT: Vérifier d'abord que l'utilisateur est authentifié
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      console.log('🔍 fetchSettings - User ID:', user?.id);

      if (authError) {
        console.error('Auth error:', authError);
        setSettings(null);
        setLoading(false);
        return;
      }

      if (!user) {
        console.log('⚠️ No user authenticated');
        // Pas d'user = pas de settings (ne PAS retry en boucle)
        setSettings(null);
        setError(null);
        setLoading(false);
        return;
      }

      // Récupérer les settings de l'utilisateur (RLS filtre automatiquement)
      const { data, error } = await supabase
        .from('family_settings')
        .select('*')
        .eq('user_id', user.id) // Filtrer explicitement par user_id
        .maybeSingle();

      console.log('🔍 fetchSettings - Data:', data);
      console.log('🔍 fetchSettings - Error:', error);

      if (error) throw error;

      // Ne pas créer automatiquement - l'onboarding s'en charge
      setSettings(data || null);
      setError(null);
      setLoading(false); // Mettre loading à false SEULEMENT quand on a les données
    } catch (err) {
      console.error('Error fetching family settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      setLoading(false);
    }
  };

  // Mettre à jour les paramètres
  const updateSettings = async (updates: Partial<FamilySettingsUpdate>) => {
    try {
      if (!settings?.id) {
        // Si pas de settings, en créer un avec user_id
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('family_settings')
          .insert({ ...updates, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
        return data;
      }

      const { data, error } = await supabase
        .from('family_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }

      return data;
    } catch (err) {
      console.error('Error updating family settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  };

  // Charger les paramètres au montage
  useEffect(() => {
    fetchSettings();

    // Real-time subscriptions
    const channel = supabase
      .channel('family-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_settings',
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setSettings(payload.new as FamilySettings);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
}
