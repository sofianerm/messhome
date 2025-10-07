import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Trip = Database['public']['Tables']['trips']['Row'];
type TripInsert = Database['public']['Tables']['trips']['Insert'];
type TripUpdate = Database['public']['Tables']['trips']['Update'];

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('trips_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trips' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTrips((current) => [...current, payload.new as Trip]);
          } else if (payload.eventType === 'UPDATE') {
            setTrips((current) =>
              current.map((trip) =>
                trip.id === payload.new.id ? (payload.new as Trip) : trip
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setTrips((current) =>
              current.filter((trip) => trip.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTrip = async (tripData: Omit<TripInsert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newTrip: TripInsert = {
        ...tripData,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('trips')
        .insert(newTrip)
        .select()
        .single();

      if (error) throw error;

      // Mise à jour immédiate de l'état local
      if (data) {
        setTrips(prev => [...prev, data]);
      }

      return data;
    } catch (error) {
      console.error('Error adding trip:', error);
      throw error;
    }
  };

  const updateTrip = async (id: string, updates: TripUpdate) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Mise à jour immédiate de l'état local
      if (data) {
        setTrips(prev => prev.map(trip => trip.id === id ? data : trip));
      }

      return data;
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Mise à jour immédiate de l'état local
      setTrips(prev => prev.filter(trip => trip.id !== id));
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  };

  return {
    trips,
    loading,
    addTrip,
    updateTrip,
    deleteTrip,
    refetch: fetchTrips,
  };
}
