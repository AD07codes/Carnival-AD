import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const ParticipantForm: React.FC<{ tournamentId: string }> = ({ tournamentId }) => {
    const [gameId, setGameId] = useState('');
    const [gameName, setGameName] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const participantData = {
            tournament_id: tournamentId,
            game_id: gameId,
            game_name: gameName,
        };

        try {
            const { data, error } = await supabase
                .from('participants')
                .insert([participantData]);

            if (error) throw error;

            console.log('Participant added:', data);
        } catch (error) {
            console.error('Error adding participant:', error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="gameId">Free Fire Game ID</label>
                <input
                    type="text"
                    id="gameId"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="gameName">In-Game Name</label>
                <input
                    type="text"
                    id="gameName"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                />
            </div>
            <button type="submit">Join Tournament</button>
        </form>
    );
};

export default ParticipantForm;
