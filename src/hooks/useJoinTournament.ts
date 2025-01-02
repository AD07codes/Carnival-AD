import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useJoinTournament() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  async function joinTournament(tournamentId: string) {
    if (!user) {
      throw new Error('Must be logged in to join tournament');
    }
    
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
          return;
        } else if (existingRequest.status === 'approved') {
          alert('You are already registered for this tournament');
          return;
        } else {
          alert('Your previous request was rejected. Please contact admin for more information');
          return;
        }
      }

      // Create join request with real-time notification
      const { error } = await supabase
        .from('tournament_requests')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Store request in localStorage for offline support
      const request = {
        tournamentId,
        userId: user.id,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      localStorage.setItem(`join_request_${tournamentId}`, JSON.stringify(request));

      alert('Join request submitted! Waiting for admin approval.');
    } catch (error: any) {
      console.error('Error joining tournament:', error);
      alert(error.message || 'Failed to join tournament');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return { joinTournament, loading };
}
