import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAcceptInterestExpression, getIgnoreInterestExpression, getInsertExpressInterestInTeam, getInterestExpressionsPending, getInterestExpressionsPendingCount, getInterestStatusPending } from "../api/interestExpressions";

// USE QUERY 

export const useInterestExpressionsPendingCount = (teamId:string) => {
    return useQuery({
        queryKey:["InterestExpressionsPendingCount",teamId],
        queryFn: () => {
            return getInterestExpressionsPendingCount(teamId);
        }
    })
} 


export const useInterestExpressionsPending = (teamId?:string) => {
    return useQuery({
        queryKey:["InterestExpressionsPending",teamId],
        queryFn: () => {
            return getInterestExpressionsPending(teamId!);
        }
    })
}

// USE MUTATION 

export const useAcceptInterestExpression = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({teamId,userId,teamName,clubId}:{teamId:string,userId:string,teamName:string,clubId?:string}) => {
            return getAcceptInterestExpression(teamId,userId,teamName);
        },
        onSuccess(data, variables, onMutateResult, context) {
            queryClient.invalidateQueries({queryKey:["InterestExpressionsPending",variables.teamId]});
            queryClient.invalidateQueries({queryKey:["InterestExpressionsPendingCount",variables.teamId]});
            queryClient.invalidateQueries({queryKey:["TeamMembers",variables.teamId]});
            queryClient.invalidateQueries({queryKey:["clubsList"]});
            queryClient.invalidateQueries({queryKey:["clubDetails",variables.clubId]});
        },

    })
}

export const useIgnoreInterestExpression = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({teamId,userId,teamName}:{teamId:string,userId:string,teamName:string}) => {
            return getIgnoreInterestExpression(teamId,userId,teamName);
        },
        onSuccess(data, variables, onMutateResult, context) {
             console.log("Success Ignore interest expressions");
             queryClient.invalidateQueries({queryKey:["InterestExpressionsPending",variables.teamId]});
             queryClient.invalidateQueries({queryKey:["InterestExpressionsPendingCount",variables.teamId]});
        },
    })
}

export const useInsertExpressInterestInTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({teamId}:{teamId:string}) => {
            return getInsertExpressInterestInTeam(teamId);
        },
        onSuccess(data, variables, onMutateResult, context) {
            queryClient.invalidateQueries({queryKey:["interestStatusPending",variables.teamId],})
        },
    })
}

export const useInterestStatusPending = (teamId:string,userId?:string) => {
    return useQuery({
        queryKey:["interestStatusPending",teamId],
        queryFn: () => {
            return getInterestStatusPending(teamId,userId!)
        }
    })
}