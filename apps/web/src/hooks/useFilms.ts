import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Film = Database['public']['Tables']['films']['Row'];
type FilmInsert = Database['public']['Tables']['films']['Insert'];
type FilmUpdate = Database['public']['Tables']['films']['Update'];

export function useFilms() {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les films
  const fetchFilms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('films')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFilms(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching films:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch films');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un film
  const addFilm = async (filmData: Omit<FilmInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newFilm: FilmInsert = {
        ...filmData,
        user_id: null as any,
      };

      const { data, error } = await supabase
        .from('films')
        .insert(newFilm)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setFilms(prev => [data, ...prev]);
      }

      return data;
    } catch (err) {
      console.error('Error adding film:', err);
      setError(err instanceof Error ? err.message : 'Failed to add film');
      throw err;
    }
  };

  // Mettre à jour un film
  const updateFilm = async (id: string, updates: Partial<FilmUpdate>) => {
    try {
      const { data, error } = await supabase
        .from('films')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setFilms(prev => prev.map(film =>
          film.id === id ? data : film
        ));
      }

      return data;
    } catch (err) {
      console.error('Error updating film:', err);
      setError(err instanceof Error ? err.message : 'Failed to update film');
      throw err;
    }
  };

  // Supprimer un film
  const deleteFilm = async (id: string) => {
    try {
      const { error } = await supabase
        .from('films')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFilms(prev => prev.filter(film => film.id !== id));
    } catch (err) {
      console.error('Error deleting film:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete film');
      throw err;
    }
  };

  // Charger les films au montage
  useEffect(() => {
    fetchFilms();

    // Real-time subscriptions
    const channel = supabase
      .channel('films-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'films',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setFilms(prev => [payload.new as Film, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setFilms(prev => prev.map(film =>
              film.id === payload.new.id ? payload.new as Film : film
            ));
          } else if (payload.eventType === 'DELETE') {
            setFilms(prev => prev.filter(film => film.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    films,
    loading,
    error,
    addFilm,
    updateFilm,
    deleteFilm,
    refetch: fetchFilms,
  };
}
