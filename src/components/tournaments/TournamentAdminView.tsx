import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const TournamentAdminView: React.FC<{ tournamentId: string }> = ({ tournamentId }) => {
    const { user } = useAuth();
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        const fetchParticipants = async () => {
            const { data, error } = await supabase
                .from('participants')
                .select('*')
                .eq('tournament_id', tournamentId);

            if (error) {
                console.error('Error fetching participants:', error.message);
            } else {
                setParticipants(data);
            }
        };

        fetchParticipants();
    }, [tournamentId]);

    if (user?.role !== 'admin') {
        return <div>Unauthorized</div>;
    }

    return (
        <div>
            <h1>Participants for {tournamentId}</h1>
            <ul>
                {participants.map((participant) => (
                    <li key={participant.id}>
                        Game ID: {participant.game_id}, In-Game Name: {participant.game_name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TournamentAdminView;
