import { useQuery } from '@tanstack/react-query';
import { getClubs, GetClubsType } from '../api/clubs';

export const useClubs = (payload:GetClubsType) => {
    return useQuery({
        queryKey:["clubsList"],
        queryFn: () => {
            return getClubs(payload)
        }
    })
}