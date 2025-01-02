import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import TournamentInfo from '../components/tournaments/TournamentInfo';
import TournamentChat from '../components/tournaments/TournamentChat';
import TournamentParticipants from '../components/tournaments/TournamentParticipants';
import TournamentRequests from '../components/tournaments/TournamentRequests';
import TournamentRoomDetails from '../components/tournaments/TournamentRoomDetails';
import TeamsList from '../components/tournaments/TeamsList';
import { useTournamentDetails } from '../hooks/useTournamentDetails';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function TournamentDetails() {
  const { id } = useParams<{ id: string }>();
  const { tournament, loading, error } = useTournamentDetails(id!);
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this tournament?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      navigate('/tournaments');
    } catch (error) {
      console.error('Error deleting tournament:', error);
      alert('Failed to delete tournament');
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="text-center py-8 text-red-400">
        Tournament not found or an error occurred
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-2xl md:text-3xl font-bold">{tournament.title}</h1>
        {user?.role === 'admin' && (
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 p-2 rounded-lg"
            title="Delete Tournament"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TournamentInfo tournament={tournament} />
          
          {/* Room Details Section */}
          {(tournament.status === 'ongoing' || user?.role === 'admin') && (
            <TournamentRoomDetails tournamentId={tournament.id} />
          )}
          
          {/* Teams & Players Section */}
          <TeamsList tournamentId={tournament.id} />
          
          {user?.role === 'admin' && (
            <TournamentRequests tournamentId={tournament.id} />
          )}
          
          <TournamentParticipants tournamentId={tournament.id} />
        </div>
        
        <div className="lg:col-span-1">
          <TournamentChat tournamentId={tournament.id} />
        </div>
      </div>
    </div>
  );
}
