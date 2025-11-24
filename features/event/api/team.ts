import { supabase } from '@lib/supabase';

export const getTeams =async (teamId:string) => {
    try{
        const { data:teamData, error } = await supabase
        .from('teams')
        .select(
            `
            *,
            clubs(*)
        `
        )
        .eq('id', teamId)
        .maybeSingle();

        if (error) throw error;

        return teamData;
    }catch(error){
        console.error("Error in get team Data",error);
        throw error;
    }
}