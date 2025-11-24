import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addTeamMembers, getTeamMembers, removeTeamMember, searchNonMembers } from "../api/teamMember";

export const useTeamMembers = (teamId:string) => {
   return useQuery({
    queryKey:["TeamMembers",teamId],
    queryFn: () => {
        return getTeamMembers(teamId);
    }
   })
}


export const useSearchNonMembers = (teamId?:string, query?:string) => {
    return useQuery({
        queryKey:["SeachNonMembers"],
        queryFn: () => {
            return searchNonMembers(teamId!,query!);
        }
    })   
}

export const useRemoveTeamMembers = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) => {
            return removeTeamMember(teamId,memberId);
        },
        onSuccess(data, variables, onMutateResult, context) {
            console.log("Remove team member success");
            queryClient.invalidateQueries({queryKey:["TeamMembers",variables.teamId]})
            queryClient.invalidateQueries({queryKey:["clubDetails"]})
        },
        
    })
}




export const useAddTeamMembers = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ teamId,userIds}:{teamId:string,userIds:string}) => {
            return addTeamMembers(teamId,userIds);
        },
        onSuccess(data, variables, onMutateResult, context) {
            console.log("Add team member success");
            queryClient.invalidateQueries({queryKey:["TeamMembers",variables.teamId]})
            queryClient.invalidateQueries({queryKey:["SeachNonMembers"]})
        },

    })
}