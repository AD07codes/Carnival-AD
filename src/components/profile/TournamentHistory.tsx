import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { TournamentParticipation } from '../../types/user';

export default function TournamentHistory() {
  const { user } = useAuth();
  const [participations, setParticipations] = useState<TournamentParticipation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchTournamentHistory();
    }
  }, [user?.id]);

  async function fetchTournamentHistory() {
    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select(`
          *,
          tournaments:tournament_id (
            title,
            start_time,
            status,
            prize_pool
          )
        `)
        .eq('user_id', user?.id)
        .eq('payment_status', 'completed')
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setParticipations(data || []);
    } catch (error) {
      console.error('Error fetching tournament history:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-48"></div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-semibold">Tournament History</h2>
      </div>

      {participations.length > 0 ? (
        <div className="space-y-4">
          {participations.map((participation) => (
            <Link
              key={participation.id}
              to={`/tournaments/${participation.tournament_id}`}
              className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{participation.tournaments.title}</h3>
                  <p className="text-sm text-gray-400">
                    {format(new Date(participation.tournaments.start_time), 'PPp')}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  participation.tournaments.status === 'upcoming' ? 'bg-green-900 text-green-300' :
                  participation.tournaments.status === 'ongoing' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-red-900 text-red-300'
                }`}>
                  {participation.tournaments.status}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-400">
                Prize Pool: ${participation.tournaments.prize_pool}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          You haven't participated in any tournaments yet
        </div>
      )}
    </div>
  );
}
