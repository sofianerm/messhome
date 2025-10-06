import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type FamilyMember = Database['public']['Tables']['family_members']['Row'];
type FamilyMemberInsert = Database['public']['Tables']['family_members']['Insert'];
type FamilyMemberUpdate = Database['public']['Tables']['family_members']['Update'];

export function useFamilyMembers() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les membres
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .order('role', { ascending: true }); // Parents d'abord

      if (error) throw error;
      setMembers(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching family members:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un membre
  const addMember = async (memberData: Omit<FamilyMemberInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      // Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newMember: FamilyMemberInsert = {
        ...memberData,
        user_id: user.id, // Utiliser l'ID de l'utilisateur connecté
        // Convertir les chaînes vides en null pour les champs optionnels
        birth_date: memberData.birth_date || null,
        email: memberData.email || null,
        phone: memberData.phone || null,
        allergies: memberData.allergies || null,
        dietary_preferences: memberData.dietary_preferences || null,
      };

      const { data, error } = await supabase
        .from('family_members')
        .insert(newMember)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMembers(prev => [...prev, data].sort((a, b) => {
          const roleOrder = { papa: 0, maman: 1, enfant: 2, autre: 3 };
          return roleOrder[a.role as keyof typeof roleOrder] - roleOrder[b.role as keyof typeof roleOrder];
        }));
      }

      return data;
    } catch (err) {
      console.error('Error adding family member:', err);
      setError(err instanceof Error ? err.message : 'Failed to add member');
      throw err;
    }
  };

  // Mettre à jour un membre
  const updateMember = async (id: string, updates: Partial<FamilyMemberUpdate>) => {
    try {
      // Convertir les chaînes vides en null
      const cleanedUpdates = {
        ...updates,
        birth_date: updates.birth_date === '' ? null : updates.birth_date,
        email: updates.email === '' ? null : updates.email,
        phone: updates.phone === '' ? null : updates.phone,
        allergies: updates.allergies === '' ? null : updates.allergies,
        dietary_preferences: updates.dietary_preferences === '' ? null : updates.dietary_preferences,
      };

      const { data, error } = await supabase
        .from('family_members')
        .update(cleanedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMembers(prev => prev.map(member =>
          member.id === id ? data : member
        ).sort((a, b) => {
          const roleOrder = { papa: 0, maman: 1, enfant: 2, autre: 3 };
          return roleOrder[a.role as keyof typeof roleOrder] - roleOrder[b.role as keyof typeof roleOrder];
        }));
      }

      return data;
    } catch (err) {
      console.error('Error updating family member:', err);
      setError(err instanceof Error ? err.message : 'Failed to update member');
      throw err;
    }
  };

  // Supprimer un membre
  const deleteMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMembers(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      console.error('Error deleting family member:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete member');
      throw err;
    }
  };

  // Charger les membres au montage
  useEffect(() => {
    fetchMembers();

    // Real-time subscriptions
    const channel = supabase
      .channel('family-members-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_members',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMembers(prev => [...prev, payload.new as FamilyMember].sort((a, b) => {
              const roleOrder = { papa: 0, maman: 1, enfant: 2, autre: 3 };
              return roleOrder[a.role as keyof typeof roleOrder] - roleOrder[b.role as keyof typeof roleOrder];
            }));
          } else if (payload.eventType === 'UPDATE') {
            setMembers(prev => prev.map(member =>
              member.id === payload.new.id ? payload.new as FamilyMember : member
            ).sort((a, b) => {
              const roleOrder = { papa: 0, maman: 1, enfant: 2, autre: 3 };
              return roleOrder[a.role as keyof typeof roleOrder] - roleOrder[b.role as keyof typeof roleOrder];
            }));
          } else if (payload.eventType === 'DELETE') {
            setMembers(prev => prev.filter(member => member.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    members,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
    refetch: fetchMembers,
  };
}
