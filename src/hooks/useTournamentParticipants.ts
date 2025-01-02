import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Participant } from '../types/tournament';

export function useTournamentParticipants(tournamentId: string) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchParticipants() {
      try {
        const { data, error } = await supabase
          .from('tournament_participants')
          .select('*, users(username)')
          .eq('tournament_id', tournamentId)
          .eq('payment_status', 'completed');

        if (error) throw error;
        setParticipants(data || []);
      } catch (error) {
        console.error('Error fetching participants:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchParticipants();
  }, [tournamentId]);

  return { participants, loading };
}
