import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Trophy, Users, Calendar, DollarSign } from 'lucide-react';
import { Tournament } from '../../types/tournament';
import { useJoinTournament } from '../../hooks/useJoinTournament';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  tournament: Tournament;
}

export default function TournamentCard({ tournament }: Props) {
  const { joinTournament, loading } = useJoinTournament();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);

  const handleJoin = async () => {
    try {
      // Store join request in localStorage for offline support
      const request = {
        tournamentId: tournament.id,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      localStorage.setItem(`join_request_${tournament.id}`, JSON.stringify(request));
      
      await joinTournament(tournament.id);
      navigate(`/payment/${tournament.id}`);
    } catch (error) {
      console.error('Error joining tournament:', error);
    }
  };

  return (
    <Link
      to={`/tournaments/${tournament.id}`}
      className="block bg-gray-800 rounded-lg overflow-hidden transform hover:-translate-y-1 
                transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
    >
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-semibold">{tournament.title}</h3>
          <span className={`px-2 py-1 rounded text-sm ${
            tournament.status === 'upcoming' ? 'bg-green-900 text-green-300' :
            tournament.status === 'ongoing' ? 'bg-yellow-900 text-yellow-300' :
            'bg-red-900 text-red-300'
          }`}>
            {tournament.status}
          </span>
        </div>

        <p className="text-gray-400 line-clamp-2">{tournament.description}</p>

        <div className="space-y-2">
          <div className="flex items-center text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            {format(new Date(tournament.start_time), 'PPp')}
          </div>

          <div className="flex items-center text-gray-400">
            <Users className="w-4 h-4 mr-2" />
            {tournament.max_participants} participants max
          </div>

          <div className="flex items-center text-gray-400">
            <DollarSign className="w-4 h-4 mr-2" />
            Entry Fee: ${tournament.entry_fee}
          </div>

          <div className="flex items-center text-gray-400">
            <Trophy className="w-4 h-4 mr-2" />
            Prize Pool: ${tournament.prize_pool}
          </div>
        </div>

        {user && tournament.status === 'upcoming' && (
          <button
            onClick={(e) => {
              e.preventDefault();
              handleJoin();
            }}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 
                     disabled:cursor-not-allowed px-4 py-2 rounded-lg mt-4"
          >
            {loading ? 'Processing...' : 'Join Tournament'}
          </button>
        )}
      </div>
    </Link>
  );
}
