import { useQuery } from "@tanstack/react-query";
import { getTeamPaymentRequests } from "../apis";

export const usePaymentRequestTeams = (teamId:string) => {
    return useQuery({
        queryKey:["TeamPaymentRequests"],
        queryFn: () => {
            return getTeamPaymentRequests(teamId);
        },
    })
}