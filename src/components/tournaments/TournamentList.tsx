import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const TournamentList: React.FC = () => {
    const [tournaments, setTournaments] = useState([]);

    useEffect(() => {
        const fetchTournaments = async () => {
            const { data, error } = await supabase
                .from('tournaments')
                .select('*');

            if (error) {
                console.error('Error fetching tournaments:', error.message);
            } else {
                console.log('Fetched tournaments:', data); // Add this log
                setTournaments(data);
            }
        };

        fetchTournaments();
    }, []);

    if (tournaments.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>All Tournaments</h1>
            <ul>
                {tournaments.map((tournament) => (
                    <li key={tournament.id}>{tournament.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default TournamentList;
