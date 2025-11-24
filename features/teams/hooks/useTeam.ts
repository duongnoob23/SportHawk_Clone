import { useQuery } from '@tanstack/react-query';
import { getPublicTeamInfo, getTeam, getTeams } from '../api/team';

export function useTeam(teamId?: string) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: () => {
      if (!teamId) throw new Error('teamId is required');
      return getTeam(teamId);
    },
    enabled: !!teamId,
  });
}


export const useTeams = (teamId?:string)=> {
    return useQuery({
        queryKey:["teamData",teamId],
        queryFn: () => getTeams(teamId!),
        enabled: !!teamId,
        
    })
}

export const usePublicTeamInfo = (teamId:string) => {
  return useQuery({
    queryKey:["publicTeamInfo",teamId],
    queryFn: () => {
      return getPublicTeamInfo(teamId);
    }
  })
}