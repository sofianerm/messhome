import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type PackingItem = Database['public']['Tables']['packing_items']['Row'];
type PackingItemInsert = Database['public']['Tables']['packing_items']['Insert'];
type PackingItemUpdate = Database['public']['Tables']['packing_items']['Update'];

export function usePackingItems() {
  const [packingItems, setPackingItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackingItems();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('packing_items_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'packing_items' },
        (payload) => {
          console.log('🔥 REALTIME EVENT:', payload.eventType, payload.new || payload.old);
          if (payload.eventType === 'INSERT') {
            setPackingItems((current) => {
              // Vérifier si l'item n'existe pas déjà (éviter les doublons avec mise à jour optimiste)
              const exists = current.some(item => item.id === (payload.new as PackingItem).id);
              if (exists) {
                console.log('⚠️ Item already exists, skipping INSERT');
                return current;
              }
              console.log('➕ Adding item via realtime');
              return [...current, payload.new as PackingItem];
            });
          } else if (payload.eventType === 'UPDATE') {
            setPackingItems((current) => {
              console.log('📝 Updating item via realtime:', payload.new.id);
              return current.map((item) =>
                item.id === payload.new.id ? (payload.new as PackingItem) : item
              );
            });
          } else if (payload.eventType === 'DELETE') {
            setPackingItems((current) => {
              console.log('🗑️ Deleting item via realtime:', payload.old.id);
              return current.filter((item) => item.id !== payload.old.id);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPackingItems = async () => {
    try {
      const { data, error } = await supabase
        .from('packing_items')
        .select('*')
        .order('category_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPackingItems(data || []);
    } catch (error) {
      console.error('Error fetching packing items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPackingItem = async (itemData: Omit<PackingItemInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newItem: PackingItemInsert = {
        item: itemData.item,
        category: itemData.category || null,
        category_order: itemData.category_order || 0,
        checked: itemData.checked || false,
        user_id: null as any,
      };

      const { data, error } = await supabase
        .from('packing_items')
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;

      // Mise à jour immédiate de l'état local - trier correctement
      if (data) {
        setPackingItems(prev => {
          const updated = [...prev, data];
          return updated.sort((a, b) => {
            if (a.category_order !== b.category_order) {
              return a.category_order - b.category_order;
            }
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          });
        });
      }

      return data;
    } catch (error) {
      console.error('Error adding packing item:', error);
      throw error;
    }
  };

  const togglePackingItem = async (id: string, checked: boolean) => {
    try {
      // Mise à jour optimiste IMMÉDIATE
      setPackingItems(prev => prev.map(item =>
        item.id === id ? { ...item, checked } : item
      ));

      const { data, error } = await supabase
        .from('packing_items')
        .update({ checked })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Rollback en cas d'erreur
        setPackingItems(prev => prev.map(item =>
          item.id === id ? { ...item, checked: !checked } : item
        ));
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error toggling packing item:', error);
      throw error;
    }
  };

  const deletePackingItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('packing_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Mise à jour immédiate de l'état local
      setPackingItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting packing item:', error);
      throw error;
    }
  };

  return {
    packingItems,
    loading,
    addPackingItem,
    togglePackingItem,
    deletePackingItem,
    refetch: fetchPackingItems,
  };
}
