import React, { useEffect, useState } from 'react';
import { createTournament } from './createTournament';
import ParticipantForm from './ParticipantForm';
import TournamentAdminView from './TournamentAdminView';
import { useAuth } from '../../contexts/AuthContext';
import { fetchTournament } from './fetchTournament';

const TournamentInfo: React.FC = () => {
    const { user } = useAuth();
    const [tournament, setTournament] = useState(null);

    const createAndFetchTournament = async () => {
        const createdTournament = await createTournament();
        if (createdTournament) {
            const tournamentId = createdTournament.id; // Ensure this is a valid UUID
            const data = await fetchTournament(tournamentId);
            setTournament(data);
        }
    };

    useEffect(() => {
        createAndFetchTournament();
    }, []);

    if (!tournament) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Tournament: CS Wellcore</h1>
            <p>A 4v4 battle in CS Wellcore</p>
            
            {user?.role === 'admin' ? (
                <TournamentAdminView tournamentId={tournament.id} />
            ) : (
                <ParticipantForm tournamentId={tournament.id} />
            )}
        </div>
    );
};

export default TournamentInfo;
