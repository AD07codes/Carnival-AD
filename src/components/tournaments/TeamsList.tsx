import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  players: {
    id: string;
    username: string;
    game_id?: string;
    game_name?: string;
  }[];
}

interface Props {
  tournamentId: string;
}

export default function TeamsList({ tournamentId }: Props) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
    subscribeToTeamUpdates();
  }, [tournamentId]);

  async function fetchTeams() {
    try {
      // First get all participants
      const { data: participants, error: participantsError } = await supabase
        .from('tournament_participants')
        .select(`
          id,
          user_id,
          team_name,
          users (
            id,
            username,
            game_id,
            game_name
          )
        `)
        .eq('tournament_id', tournamentId)
        .eq('payment_status', 'completed');

      if (participantsError) throw participantsError;

      // Group participants by team
      const teamMap = new Map<string, Team>();
      participants?.forEach((participant) => {
        const teamName = participant.team_name || 'Unassigned';
        if (!teamMap.has(teamName)) {
          teamMap.set(teamName, {
            id: teamName,
            name: teamName,
            players: [],
          });
        }
        teamMap.get(teamName)?.players.push({
          id: participant.users.id,
          username: participant.users.username,
          game_id: participant.users.game_id,
          game_name: participant.users.game_name,
        });
      });

      setTeams(Array.from(teamMap.values()));
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToTeamUpdates() {
    const subscription = supabase
      .channel('tournament_participants')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tournament_participants',
        filter: `tournament_id=eq.${tournamentId}`,
      }, () => {
        fetchTeams();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-48"></div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Users className="w-5 h-5 text-purple-500" />
        <h2 className="text-xl font-semibold">Teams & Players</h2>
      </div>

      {teams.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-gray-700 rounded-lg p-4 space-y-4"
            >
              <h3 className="font-semibold text-lg border-b border-gray-600 pb-2">
                {team.name}
              </h3>
              <div className="space-y-2">
                {team.players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center space-x-3 bg-gray-600/50 rounded-lg p-2"
                  >
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center 
                                justify-center font-semibold">
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{player.username}</p>
                      {player.game_id && (
                        <p className="text-sm text-gray-400">
                          Game ID: {player.game_id}
                        </p>
                      )}
                      {player.game_name && (
                        <p className="text-sm text-gray-400">
                          Game Name: {player.game_name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          No teams have been formed yet
        </div>
      )}
    </div>
  );
}
