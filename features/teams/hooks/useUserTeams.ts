import { useUser } from '@hks/useUser';
import { teamsApi } from '@lib/api/teams';
import { useQuery } from '@tanstack/react-query';

export function useUserTeams() {
  const { user } = useUser();

  return useQuery({
    queryKey: ['teams', 'me', user?.id],
    queryFn: () => teamsApi.getUserTeams(),
    enabled: !!user?.id,
  });
}
