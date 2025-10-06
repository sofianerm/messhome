import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Meal = Database['public']['Tables']['meals']['Row'];
type MealInsert = Database['public']['Tables']['meals']['Insert'];
type MealUpdate = Database['public']['Tables']['meals']['Update'];

export function useMeals() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les repas
  const fetchMeals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setMeals(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch meals');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un repas
  const addMeal = async (mealData: Omit<MealInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newMeal: MealInsert = {
        ...mealData,
        user_id: null as any,
      };

      const { data, error } = await supabase
        .from('meals')
        .insert(newMeal)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMeals(prev => [...prev, data].sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
      }

      return data;
    } catch (err) {
      console.error('Error adding meal:', err);
      setError(err instanceof Error ? err.message : 'Failed to add meal');
      throw err;
    }
  };

  // Mettre à jour un repas
  const updateMeal = async (id: string, updates: Partial<MealUpdate>) => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMeals(prev => prev.map(meal =>
          meal.id === id ? data : meal
        ).sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
      }

      return data;
    } catch (err) {
      console.error('Error updating meal:', err);
      setError(err instanceof Error ? err.message : 'Failed to update meal');
      throw err;
    }
  };

  // Supprimer un repas
  const deleteMeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMeals(prev => prev.filter(meal => meal.id !== id));
    } catch (err) {
      console.error('Error deleting meal:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete meal');
      throw err;
    }
  };

  // Charger les repas au montage
  useEffect(() => {
    fetchMeals();

    // Real-time subscriptions
    const channel = supabase
      .channel('meals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meals',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMeals(prev => [...prev, payload.new as Meal].sort((a, b) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
            ));
          } else if (payload.eventType === 'UPDATE') {
            setMeals(prev => prev.map(meal =>
              meal.id === payload.new.id ? payload.new as Meal : meal
            ).sort((a, b) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
            ));
          } else if (payload.eventType === 'DELETE') {
            setMeals(prev => prev.filter(meal => meal.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    meals,
    loading,
    error,
    addMeal,
    updateMeal,
    deleteMeal,
    refetch: fetchMeals,
  };
}
