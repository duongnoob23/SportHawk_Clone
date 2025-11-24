import { logger } from '@lib/utils/logger';
import { supabase } from '@lib/supabase';
import { TeamDBResult } from '@top/features/payments/types';

export const getTeam = async (teamId: string): Promise<TeamDBResult | null> => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select(
        `
        id,
        clubId:club_id,
        name,
        sport,
        teamType:team_type,
        isActive:is_active,
        ageGroup:age_group,
        foundedYear:founded_year,
        homeGround:home_ground,
        homeGroundAddress:home_ground_address,
        homeGroundLatitude:home_ground_latitude,
        homeGroundLongitude:home_ground_longitude,
        leagueName:league_name,
        matchDay:match_day,
        matchTime:match_time,
        motto,
        teamLevel:team_level,
        teamPhotoUrl:team_photo_url,
        teamSort:team_sort,
        trainingDay1:training_day_1,
        trainingDay2:training_day_2,
        trainingTime1:training_time_1,
        trainingTime2:training_time_2,
        createdAt:created_at,
        updatedAt:updated_at
      `
      )
      .eq('id', teamId)
      .single<TeamDBResult>();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.log('No team found with ID:', teamId);
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Failed to get team:', error);
    throw error;
  }
};
