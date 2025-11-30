import { logger } from '@lib/utils/logger';
import { getSupabaseClient } from '@top/lib/supabase-dev';
import { StripeAccountDBResult } from '@top/features/payments/types';

export const getTeamStripeAccount = async (
  teamId: string
): Promise<StripeAccountDBResult | null> => {
  try {
    const client = getSupabaseClient();
    
    // First, try to get stripe account directly from team
    const { data: teamStripeAccount, error: teamError } = await client
      .from('stripe_accounts')
      .select(
        `
        id,
        teamId:team_id,
        stripeAccountId:stripe_account_id,
        accountStatus:account_status,
        chargesEnabled:charges_enabled,
        payoutsEnabled:payouts_enabled,
        country,
        currency,
        accountEmail:account_email,
        businessType:business_type,
        createdAt:created_at,
        updatedAt:updated_at
      `
      )
      .eq('team_id', teamId)
      .maybeSingle<StripeAccountDBResult>();

    if (teamStripeAccount) {
      return teamStripeAccount;
    }

    // If team doesn't have stripe account, try to get from club via team
    if (teamError && teamError.code === 'PGRST116') {
      logger.log('No Stripe account found for team, trying to get from club:', teamId);
      
      // Get team's club_id
      const { data: teamData, error: teamDataError } = await client
        .from('teams')
        .select('club_id')
        .eq('id', teamId)
        .maybeSingle();

      if (teamDataError || !teamData?.club_id) {
        logger.log('No club found for team:', teamId);
        return null;
      }

      // Try to get stripe account from any team in the same club
      const { data: clubTeams, error: clubTeamsError } = await client
        .from('teams')
        .select('id')
        .eq('club_id', teamData.club_id);

      if (clubTeamsError || !clubTeams || clubTeams.length === 0) {
        logger.log('No teams found in club:', teamData.club_id);
        return null;
      }

      const clubTeamIds = clubTeams.map(t => t.id);
      
      // Find stripe account from any team in the club
      const { data: clubStripeAccount, error: clubError } = await client
        .from('stripe_accounts')
        .select(
          `
          id,
          teamId:team_id,
          stripeAccountId:stripe_account_id,
          accountStatus:account_status,
          chargesEnabled:charges_enabled,
          payoutsEnabled:payouts_enabled,
          country,
          currency,
          accountEmail:account_email,
          businessType:business_type,
          createdAt:created_at,
          updatedAt:updated_at
        `
        )
        .in('team_id', clubTeamIds)
        .limit(1)
        .maybeSingle<StripeAccountDBResult>();

      if (clubStripeAccount) {
        logger.log('Found Stripe account from club for team:', teamId);
        return clubStripeAccount;
      }

      if (clubError && clubError.code === 'PGRST116') {
        logger.log('No Stripe account found for club:', teamData.club_id);
        return null;
      }

      if (clubError) {
        throw clubError;
      }
    }

    if (teamError) {
      throw teamError;
    }

    return null;
  } catch (error) {
    logger.error('Failed to get team Stripe account:', error);
    throw error;
  }
};
