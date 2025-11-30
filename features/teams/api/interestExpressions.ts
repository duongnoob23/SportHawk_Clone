import { supabase } from "@top/lib/supabase";
import { getSupabaseClient } from "@top/lib/supabase-dev";
import { getAuthUser } from "@top/lib/utils/get-auth-user";



export const getInterestExpressionsPendingCount = async (teamId: string) =>  {
    try {
      const client = getSupabaseClient();
      const { count, error } = await client
        .from('interest_expressions')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId)
        .eq('interest_status', 'pending');

      if (error) throw error;
      return count || 0;
    } catch (error) {
    console.log("Error getting pending interest count:",error)
      throw error;
    }
  }

export const getInterestExpressionsPending =async (teamId: string) =>  {
      try {
        const client = getSupabaseClient();
        const { data: expressions, error } = await client
          .from('interest_expressions')
          .select(
            `
            *,
            profiles(
              id,
              first_name,
              last_name,
              profile_photo_uri
            )
          `
          )
          .eq('team_id', teamId)
          .eq('interest_status', 'pending')
          .order('expressed_at', { ascending: true });
  
        if (error) throw error;
        return expressions || [];
      } catch (error) {
        console.error('Error getting interest expressions:', error);
        throw error;
      }
    }

export const getAcceptInterestExpression =async (
    teamId: string,
    userId: string,
    teamName: string
  ) => {
    try {

      const user = await getAuthUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      const client = getSupabaseClient();
      // 1. Check if user is already a member
      const { data: existingMember } = await client
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle() to handle no data

      if (!existingMember) {
        // 2. Add user to team_members
        const { error: memberError } = await client
          .from('team_members')
          .insert({
            team_id: teamId,
            user_id: userId,
            member_status: 'active',
            joined_at: new Date().toISOString(),
          });

        if (memberError) {
          console.error("Error insert team_members",memberError);
          throw memberError;
        }
      } else {
        const { error: memberError } = await client
          .from('team_members')
          .update({
            member_status: 'active',
            joined_at: new Date().toISOString(),
            left_at: null,
          })
          .eq('team_id', teamId)
          .eq('user_id', userId);

        if (memberError) {
          console.error("Error insert team_members",memberError);
          throw memberError;
        }
      }

      // 3. Update interest_expressions status
      const { error: updateError } = await client
        .from('interest_expressions')
        .update({
          interest_status: 'accepted',
          responded_at: new Date().toISOString(),
          responded_by: user.id,
        })
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .eq('interest_status', 'pending');

      if (updateError) {
        console.error("Error insert team_members",updateError);
        throw updateError;
      }

      // 4. Create notification for accepted user
      const { error: notifError } = await client
        .from('notifications')
        .insert({
          user_id: userId,
          notification_type: 'team_membership',
          title: 'Team Membership Accepted',
          message: `You have been accepted to team ${teamName}`,
          data: { team_id: teamId, action: 'accepted' },
        });

      if (notifError) {
       console.error("Error insert team_members",notifError);
      }
      return { success: true };
    } catch (error) {
      console.error("Error insert team_members",error);
      throw error;
    }
  }

export const getIgnoreInterestExpression = async (
      teamId: string,
      userId: string,
      teamName: string
    ) => {
      try {
        const user = await getAuthUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        const client = getSupabaseClient();
        // 1. Update interest_expressions status
        const { error: updateError } = await client
          .from('interest_expressions')
          .update({
            interest_status: 'declined',
            responded_at: new Date().toISOString(),
            responded_by: user.id,
          })
          .eq('team_id', teamId)
          .eq('user_id', userId)
          .eq('interest_status', 'pending');
  
        if (updateError) {
          if (updateError.code === '23514') {
            const { error: deleteError } = await client
              .from('interest_expressions')
              .delete()
              .eq('team_id', teamId)
              .eq('user_id', userId)
              .eq('interest_status', 'pending');
  
            if (deleteError) {
                console.error("Error in delete interest_expressions",deleteError);
              throw deleteError;
            }
          } else {
            console.error("Error in delete interest_expressions",updateError);
            throw updateError;
          }
        }
        // 2. Create notification for declined user
        const { error: notifError } = await client
          .from('notifications')
          .insert({
            user_id: userId,
            notification_type: 'team_membership',
            title: 'Team Request Update',
            message: `Your request to join ${teamName} was not accepted`,
            data: { team_id: teamId, action: 'declined' },
          });
  
        if (notifError) {
           console.error("Error in delete interest_expressions",notifError);
          // Non-critical, don't throw
        }
        return { success: true };
      } catch (error) {
        console.error('ADM-002: Failed to decline interest expression', error);
        throw error;
      }
    }

export const getInsertExpressInterestInTeam =async (teamId: string) =>  {
    const user = await getAuthUser();
    if (!user) throw new Error('User must be logged in to express interest');

    const client = getSupabaseClient();
    const { data: existing, error: errorExisting } = await client
      .from('interest_expressions')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .maybeSingle()
      .overrideTypes<any>();

    if (errorExisting) {
      console.error(
        'Error check existing interest_expressions ',
        errorExisting
      );
      throw errorExisting;
    }

    if (!existing) {
      const { data, error } = await client
        .from('interest_expressions')
        .insert({
          team_id: teamId,
          user_id: user.id,
          interest_status: 'pending',
          expressed_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle(); // Use maybeSingle() to handle no data

      if (error) {
        console.error('Error insert interest_expressions');
        throw error;
      }
    } else {
      const { error: updateInterestError } = await client
        .from('interest_expressions')
        .update({
          responded_at: null,
          responded_by: null,
          interest_status: 'pending',
        })
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (updateInterestError) {
        console.error('error in updateInterestError ');
        throw updateInterestError;
      }
    }
  }

export const getInterestStatusPending = async (teamId: string,userId:string) =>  {
      try {
        const client = getSupabaseClient();
        const { data, error } = await client
          .from('interest_expressions')
          .select('id, interest_status')
          .eq('team_id', teamId)
          .eq('user_id', userId)
          .eq('interest_status', 'pending')
          .maybeSingle();
  


        if (error) {
          console.log("Error in get interestStatusPending",error);
          throw error 
        }
  
        return {
          hasPending: !!data,
          interestId: data?.id,
          status: data?.interest_status,
        };
      } catch (error) {
        return { hasPending: false };
      }
    }