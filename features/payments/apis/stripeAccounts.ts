import { logger } from '@lib/utils/logger';
import { supabase } from '@lib/supabase';
import { StripeAccountDBResult } from '@top/features/payments/types';

export const getTeamStripeAccount = async (
  teamId: string
): Promise<StripeAccountDBResult | null> => {
  try {
    const { data, error } = await supabase
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
      .single<StripeAccountDBResult>();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.log('No Stripe account found for team:', teamId);
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Failed to get team Stripe account:', error);
    throw error;
  }
};
