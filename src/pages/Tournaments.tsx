import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import TournamentCard from '../components/tournaments/TournamentCard';
import TournamentFilters from '../components/tournaments/TournamentFilters';
import { Tournament } from '../types/tournament';
import { useAuth } from '../contexts/AuthContext';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'upcoming' | 'ongoing' | 'completed'
  const { user } = useAuth();

  useEffect(() => {
    fetchTournaments();
  }, [filter]);

  async function fetchTournaments() {
    try {
      setLoading(true);
      let query = supabase
        .from('tournaments')
        .select('*')
        .order('start_time', { ascending: true });

      // Apply status filter if not 'all'
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tournaments:', error);
        return;
      }

      // Update tournament status based on start_time
      const updatedTournaments = data.map(tournament => {
        const startTime = new Date(tournament.start_time);
        const now = new Date();
        
        // If start time is in the future by more than 1 hour, it's upcoming
        if (startTime.getTime() - now.getTime() > 3600000) {
          return { ...tournament, status: 'upcoming' };
        }
        // If start time is within the last hour or next hour, it's ongoing
        else if (Math.abs(startTime.getTime() - now.getTime()) <= 3600000) {
          return { ...tournament, status: 'ongoing' };
        }
        // If start time is in the past by more than 1 hour, it's completed
        else {
          return { ...tournament, status: 'completed' };
        }
      });

      setTournaments(updatedTournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTournaments = tournaments.filter(tournament => {
    if (filter === 'all') return true;
    return tournament.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tournaments</h1>
        {user?.role === 'admin' && (
          <Link
            to="/tournaments/create"
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
          >
            Create Tournament
          </Link>
        )}
      </div>

      <TournamentFilters currentFilter={filter} onFilterChange={setFilter} />

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      ) : filteredTournaments.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          No tournaments found for the selected filter
        </div>
      )}
    </div>
  );
}
