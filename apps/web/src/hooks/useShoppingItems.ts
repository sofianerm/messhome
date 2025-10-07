import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type ShoppingItem = Database['public']['Tables']['shopping_items']['Row'];
type ShoppingItemInsert = Database['public']['Tables']['shopping_items']['Insert'];
type ShoppingItemUpdate = Database['public']['Tables']['shopping_items']['Update'];

export function useShoppingItems() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les articles
  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching shopping items:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un article
  const addItem = async (name: string, category?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newItem: ShoppingItemInsert = {
        name,
        category: category || null,
        checked: false,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('shopping_items')
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setItems(prev => [data, ...prev]);
      }

      return data;
    } catch (err) {
      console.error('Error adding item:', err);
      setError(err instanceof Error ? err.message : 'Failed to add item');
      throw err;
    }
  };

  // Toggle checked
  const toggleItem = async (id: string, checked: boolean) => {
    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .update({ checked })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setItems(prev => prev.map(item => item.id === id ? data : item));
      }

      return data;
    } catch (err) {
      console.error('Error toggling item:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle item');
      throw err;
    }
  };

  // Supprimer un article
  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  };

  // Supprimer tous les articles cochés
  const deleteChecked = async () => {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('checked', true);

      if (error) throw error;

      setItems(prev => prev.filter(item => !item.checked));
    } catch (err) {
      console.error('Error deleting checked items:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete checked items');
      throw err;
    }
  };

  // Charger les articles au montage
  useEffect(() => {
    fetchItems();

    // Real-time subscriptions
    const channel = supabase
      .channel('shopping-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_items',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems(prev => [payload.new as ShoppingItem, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setItems(prev => prev.map(item =>
              item.id === payload.new.id ? payload.new as ShoppingItem : item
            ));
          } else if (payload.eventType === 'DELETE') {
            setItems(prev => prev.filter(item => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    items,
    loading,
    error,
    addItem,
    toggleItem,
    deleteItem,
    deleteChecked,
    refetch: fetchItems,
  };
}
