import { supabase } from "@top/lib/supabase";
import { TeamMemberData } from "../types";

export const getTeamMembers = async (teamId: string): Promise<TeamMemberData[]> => {
  try {
    const { data: teamMemberData, error } = await supabase
      .from('team_members')
      .select(`
        id,
        teamId: team_id,
        userId: user_id,
        position,
        jerseyNumber: jersey_number,
        memberStatus: member_status,
        joinedAt: joined_at,
        leftAt: left_at,
        addedBy: added_by,
        profiles: profiles!team_members_user_id_fkey1 (
          id,
          firstName: first_name,
          lastName: last_name,
          teamSort: team_sort,
          profilePhotoUri: profile_photo_uri,
          dateOfBirth: date_of_birth,
          backgroundImageUri: background_image_uri,
          createdAt: created_at,
          updatedAt: updated_at
        )
      `)
      .eq('team_id', teamId)
      .eq('member_status', 'active')
      .returns<TeamMemberData[]>(); // Supabase >=2.39

    if (error) throw error;
    return teamMemberData ?? [];
  } catch (error) {
    console.error('Error in getTeamMembers:', error);
    throw error;
  }
};


export const removeTeamMember =async (teamId: string, memberId: string) =>  {
   try{
        const {
        data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error: updateError } = await supabase
        .from('team_members')
        .update({
            member_status: 'inactive',
            left_at: new Date().toISOString(),
        })
        .eq('team_id', teamId)
        .eq('user_id', memberId);

        const { error: updateStatusError } = await supabase
        .from('interest_expressions')
        .update({
            responded_at: null,
            responded_by: null,
            interest_status: 'inactive',
        })
        .eq('team_id', teamId)
        .eq('user_id', memberId);

        if (updateStatusError) {
        console.error(updateStatusError);
        throw updateStatusError;
        }

        if (updateError) throw updateError;
   }catch(error){
        console.error("Error in get team members",error);
        throw error;
   }
}

export const searchNonMembers =async (teamId: string, query: string) => {
    try {
      const trimmedQuery = query?.trim() ?? '';
      // Get current team member IDs to exclude
      const { data: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (membersError) {
        console.error("Error in search non member",membersError);
        throw membersError;
      }
      const memberIds = teamMembers?.map(member => member.user_id) ?? [];
      let searchQuery = supabase
        .from('profiles')
        .select(
          `
          id,
          first_name,
          last_name,
          profile_photo_uri
        `
        )
        .limit(20);

      // Exclude team members if any exist
      if (memberIds.length > 0) {
        searchQuery = searchQuery.not('id', 'in', `(${memberIds.join(',')})`);
      }

      if (trimmedQuery) {
        const searchTerm = `%${trimmedQuery}%`;
        searchQuery = searchQuery.or(
          `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`
        );
      }

      searchQuery = searchQuery.order('first_name', { ascending: true });

      const { data, error } = await searchQuery;

      if (error) {
        console.error('ADM-002: Error searching non-members', error);
        throw error;
      }
      const normalizedResults =
        data?.map(profile => ({
          id: profile.id,
          first_name: profile.first_name ?? '',
          last_name: profile.last_name ?? '',
          email: '',
          profile_photo_uri: profile.profile_photo_uri ?? null,
          favorite_position: null,
        })) ?? [];

      console.log('MEMBER1', JSON.stringify(normalizedResults, null, 2));

      return normalizedResults;


    } catch (error) {
      console.error('ADM-002: Failed to search non-members', error);
      throw error;
    }
  }

export const addTeamMembers =async (teamId: string, userIds: string) =>  {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Prepare member records
    const memberRecords = {
      team_id: teamId,
      user_id: userIds,
      member_status: 'active',
      added_by: user.id,
    };

    // Insert members
    const { data, error } = await supabase
      .from('team_members')
      .insert(memberRecords)
      .select();

    if (error) throw error;
    return data;
  }