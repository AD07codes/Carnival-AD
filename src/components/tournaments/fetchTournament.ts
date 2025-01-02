import { supabase } from '../../lib/supabaseClient';

export const fetchTournament = async (tournamentId: string) => {
    try {
        const { data, error } = await supabase
            .from('tournaments')
            .select('*')
            .eq('id', tournamentId)
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Supabase request failed', error);
    }
};
