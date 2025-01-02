import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, Trophy, Users, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TournamentChat from '../components/tournaments/TournamentChat';
import TournamentParticipants from '../components/tournaments/TournamentParticipants';
import { format } from 'date-fns';

interface Tournament {
  id: string;
  title: string;
  description: string;
  start_time: string;
  entry_fee: number;
  max_participants: number;
  prize_pool: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  tournament_participants?: Array<{
    id: string;
    user_id: string;
    payment_status: string;
  }>;
}

export default function TournamentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTournamentDetails();
      const subscription = subscribeToUpdates();
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [id]);

  const fetchTournamentDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          tournament_participants (
            id,
            user_id,
            payment_status
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setTournament(data);
    } catch (err: any) {
      console.error('Error fetching tournament:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    return supabase
      .channel(`tournament_details_${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments',
          filter: `id=eq.${id}`
        },
        () => {
          fetchTournamentDetails();
        }
      )
      .subscribe();
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) {
      return;
    }

    try {
      setLoading(true);

      // Delete related records first
      await Promise.all([
        supabase.from('tournament_participants').delete().eq('tournament_id', id),
        supabase.from('tournament_requests').delete().eq('tournament_id', id),
        supabase.from('chat_messages').delete().eq('tournament_id', id)
      ]);

      // Delete the tournament
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      navigate('/tournaments');
    } catch (err: any) {
      console.error('Error deleting tournament:', err);
      alert('Failed to delete tournament. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="text-center py-8 text-red-400">
        <p className="text-xl font-semibold mb-2">Error Loading Tournament</p>
        <p className="text-sm">{error || 'Tournament not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{tournament.title}</h1>
          <div className="flex items-center space-x-4 text-gray-400">
            <span className={`px-2 py-1 rounded text-sm ${
              tournament.status === 'upcoming' ? 'bg-green-900 text-green-300' :
              tournament.status === 'ongoing' ? 'bg-yellow-900 text-yellow-300' :
              'bg-red-900 text-red-300'
            }`}>
              {tournament.status}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {format(new Date(tournament.start_time), 'PPp')}
            </span>
          </div>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 p-2 rounded-lg"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-300 mb-6">{tournament.description}</p>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center text-gray-400 mb-1">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Max Players</span>
                </div>
                <p className="text-xl font-bold">{tournament.max_participants}</p>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center text-gray-400 mb-1">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>Entry Fee</span>
                </div>
                <p className="text-xl font-bold">${tournament.entry_fee}</p>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center text-gray-400 mb-1">
                  <Trophy className="w-4 h-4 mr-2" />
                  <span>Prize Pool</span>
                </div>
                <p className="text-xl font-bold">${tournament.prize_pool}</p>
              </div>
            </div>
          </div>

          <TournamentParticipants tournamentId={tournament.id} />
        </div>

        <div className="lg:col-span-1">
          <TournamentChat tournamentId={tournament.id} />
        </div>
      </div>
    </div>
  );
}
