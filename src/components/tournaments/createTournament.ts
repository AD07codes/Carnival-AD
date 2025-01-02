import { supabase } from '../../lib/supabaseClient';

export const createTournament = async () => {
    const tournamentData = {
        name: 'CS Wellcore',
        description: 'A 4v4 battle in CS Wellcore',
        // Add other necessary fields as needed
    };

    try {
        const { data, error } = await supabase
            .from('tournaments')
            .insert([tournamentData]);

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Supabase request failed', error);
    }
};
