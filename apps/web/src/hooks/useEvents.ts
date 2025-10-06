import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les événements
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un événement
  const addEvent = async (eventData: Omit<EventInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newEvent: EventInsert = {
        ...eventData,
        user_id: null as any, // Temporaire : RLS désactivé pour le dev
      };

      const { data, error } = await supabase
        .from('events')
        .insert(newEvent)
        .select()
        .single();

      if (error) throw error;

      // Ajouter localement pour une UI réactive
      if (data) {
        setEvents(prev => [...prev, data].sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
      }

      return data;
    } catch (err) {
      console.error('Error adding event:', err);
      setError(err instanceof Error ? err.message : 'Failed to add event');
      throw err;
    }
  };

  // Mettre à jour un événement
  const updateEvent = async (id: string, updates: Partial<EventUpdate>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour localement
      if (data) {
        setEvents(prev => prev.map(event =>
          event.id === id ? data : event
        ).sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
      }

      return data;
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to update event');
      throw err;
    }
  };

  // Supprimer un événement
  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Supprimer localement
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      throw err;
    }
  };

  // Charger les événements au montage du composant
  useEffect(() => {
    fetchEvents();

    // S'abonner aux changements en temps réel
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        (payload) => {
          console.log('Event change detected:', payload);

          if (payload.eventType === 'INSERT') {
            setEvents(prev => [...prev, payload.new as Event].sort((a, b) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
            ));
          } else if (payload.eventType === 'UPDATE') {
            setEvents(prev => prev.map(event =>
              event.id === payload.new.id ? payload.new as Event : event
            ).sort((a, b) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
            ));
          } else if (payload.eventType === 'DELETE') {
            setEvents(prev => prev.filter(event => event.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
}
