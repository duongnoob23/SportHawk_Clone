import { useQuery } from '@tanstack/react-query';
import { getTeams } from '../api/team';

export const useTeams =async (teamId:string) => {
    return useQuery({
        queryKey:["TeamData",teamId],
        queryFn: () => getTeams(teamId),
        enabled: !!teamId,
        
    })
}