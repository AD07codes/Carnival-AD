import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, CheckCircle, XCircle } from 'lucide-react';

interface TournamentRequest {
  id: string;
  tournament_id: string;
  user_id: string;
  status: string;
  created_at: string;
  users: {
    username: string;
    game_id?: string;
    game_name?: string;
    email: string;
  };
}

export default function TournamentRequests({ tournamentId }: { tournamentId: string }) {
  const [requests, setRequests] = useState<TournamentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    const subscription = subscribeToRequests();
    return () => {
      subscription.unsubscribe();
    };
  }, [tournamentId]);

  async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from('tournament_requests')
        .select(`
          *,
          users (
            username,
            game_id,
            game_name,
            email
          )
        `)
        .eq('tournament_id', tournamentId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToRequests() {
    return supabase
      .channel('tournament_requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tournament_requests',
        filter: `tournament_id=eq.${tournamentId}`,
      }, (payload) => {
        console.log('Received request update:', payload);
        fetchRequests();
      })
      .subscribe((status) => {
        console.log('Request subscription status:', status);
      });
  }

  async function handleRequest(requestId: string, status: 'approved' | 'rejected') {
    try {
      const { error: updateError } = await supabase
        .from('tournament_requests')
        .update({ status })
        .eq('id', requestId);

      if (updateError) throw updateError;

      if (status === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const { error: participantError } = await supabase
            .from('tournament_participants')
            .insert({
              tournament_id: tournamentId,
              user_id: request.user_id,
              payment_status: 'pending'
            });

          if (participantError) throw participantError;
        }
      }

      // Refresh requests
      fetchRequests();
    } catch (error) {
      console.error('Error handling request:', error);
      alert('Failed to process request');
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-48"></div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Users className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold">Join Requests</h3>
      </div>

      {requests.length === 0 ? (
        <p className="text-center text-gray-400">No pending requests</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-gray-700 p-4 rounded-lg flex items-center justify-between"
            >
              <div>
                <p className="font-semibold">{request.users.username}</p>
                <p className="text-sm text-gray-400">{request.users.email}</p>
                {request.users.game_id && (
                  <p className="text-sm text-gray-400">Game ID: {request.users.game_id}</p>
                )}
                {request.users.game_name && (
                  <p className="text-sm text-gray-400">Game Name: {request.users.game_name}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRequest(request.id, 'approved')}
                  className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleRequest(request.id, 'rejected')}
                  className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
