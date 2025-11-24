import { useQuery } from '@tanstack/react-query';
import { getClubDetails } from '../api/clubs';

export const useClubDetails = (clubsId: string) => {
  return useQuery({
    queryKey: ['clubDetails', clubsId],
    queryFn: () => {
      if (clubsId === 'all') return null;
      return getClubDetails(clubsId);
    },
  });
};
