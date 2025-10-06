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
      const { data, error } = await supabase
        .from('family_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      setSettings(data || null);
      setError(null);
    } catch (err) {
      console.error('Error fetching family settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour les paramètres
  const updateSettings = async (updates: Partial<FamilySettingsUpdate>) => {
    try {
      if (!settings?.id) {
        // Si pas de settings, en créer un
        const { data, error } = await supabase
          .from('family_settings')
          .insert({ ...updates })
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
