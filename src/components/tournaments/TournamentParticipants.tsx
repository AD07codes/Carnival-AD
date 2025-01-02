import React from 'react';
import { Users } from 'lucide-react';
import { useTournamentParticipants } from '../../hooks/useTournamentParticipants';

interface Props {
  tournamentId: string;
}

export default function TournamentParticipants({ tournamentId }: Props) {
  const { participants, loading } = useTournamentParticipants(tournamentId);

  if (loading) {
    return <div className="animate-pulse bg-gray-800 rounded-lg h-48"></div>;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Participants</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="bg-gray-700 rounded-lg p-3 flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center 
                          justify-center font-semibold">
              {participant.users.username.charAt(0).toUpperCase()}
            </div>
            <span className="truncate">{participant.users.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
