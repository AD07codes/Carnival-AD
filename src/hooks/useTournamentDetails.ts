import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tournament } from '../types/tournament';

export function useTournamentDetails(id: string) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTournament() {
      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setTournament(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchTournament();
  }, [id]);

  return { tournament, loading, error };
}
