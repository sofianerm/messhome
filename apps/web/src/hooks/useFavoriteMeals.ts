import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type FavoriteMeal = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export function useFavoriteMeals() {
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorite_meals')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setFavorites(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching favorite meals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (name: string, category?: string) => {
    try {
      const { data, error } = await supabase
        .from('favorite_meals')
        .insert({
          name,
          category: category || null,
          user_id: null as any,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setFavorites(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      }

      return data;
    } catch (err) {
      console.error('Error adding favorite:', err);
      throw err;
    }
  };

  const deleteFavorite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('favorite_meals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error('Error deleting favorite:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchFavorites();

    const channel = supabase
      .channel('favorite-meals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorite_meals',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setFavorites(prev => [...prev, payload.new as FavoriteMeal].sort((a, b) => a.name.localeCompare(b.name)));
          } else if (payload.eventType === 'UPDATE') {
            setFavorites(prev => prev.map(f => f.id === payload.new.id ? payload.new as FavoriteMeal : f));
          } else if (payload.eventType === 'DELETE') {
            setFavorites(prev => prev.filter(f => f.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    favorites,
    loading,
    error,
    addFavorite,
    deleteFavorite,
    refetch: fetchFavorites,
  };
}
