import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useJoinTournament() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  async function joinTournament(tournamentId: string) {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check if already joined or has pending request
      const { data: existingRequest } = await supabase
        .from('tournament_requests')
        .select('status')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id)
        .single();

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          alert('Your request is still pending admin approval');
        } else if (existingRequest.status === 'approved') {
          alert('You are already registered for this tournament');
        } else {
          alert('Your previous request was rejected. Please contact admin for more information');
        }
        return;
      }

      // Create join request
      const { error } = await supabase
        .from('tournament_requests')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
          status: 'pending'
        });

      if (error) throw error;

      alert('Join request submitted! Waiting for admin approval. You will be notified once approved.');
    } catch (error: any) {
      console.error('Error joining tournament:', error);
      alert(error.message || 'Failed to join tournament');
    } finally {
      setLoading(false);
    }
  }

  return { joinTournament, loading };
}
