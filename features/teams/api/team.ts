import { supabase } from '@lib/supabase';
import { TeamType } from '@top/features/event/types/team';
import { TeamDataType } from '../types';

export const getTeam = async (id: string): Promise<TeamType> => {
  const { data, error } = await supabase
    .from('teams')
    .select(
      `
      id,
      clubId:club_id,
      name,
      teamType:team_type,
      sport,
      leagueName:league_name,
      teamLevel:team_level,
      teamSort:team_sort,
      ageGroup:age_group,
      homeGround:home_ground,
      homeGroundAddress:home_ground_address,
      homeGroundLatitude:home_ground_latitude,
      homeGroundLongitude:home_ground_longitude,
      foundedYear:founded_year,
      motto,
      teamPhotoUrl:team_photo_url,
      trainingDay1:training_day_1,
      trainingTime1:training_time_1,
      trainingDay2:training_day_2,
      trainingTime2:training_time_2,
      matchDay:match_day,
      matchTime:match_time,
      isActive:is_active,
      createdAt:created_at,
      updatedAt:updated_at
    `
    )
    .eq('id', id)
    .single()
    .overrideTypes<TeamType>();

  if (error) throw error;
  return data;
};


export const getTeams = async (teamId: string): Promise<TeamDataType | undefined > => {
  try {
    const { data: teamData, error } = await supabase
      .from('teams')
      .select(`
        id,
        clubId: club_id,
        name,
        teamType: team_type,
        sport,
        leagueName: league_name,
        teamLevel: team_level,
        teamSort: team_sort,
        ageGroup: age_group,
        homeGround: home_ground,
        homeGroundAddress: home_ground_address,
        homeGroundLatitude: home_ground_latitude,
        homeGroundLongitude: home_ground_longitude,
        foundedYear: founded_year,
        motto,
        teamPhotoUrl: team_photo_url,
        trainingDay1: training_day_1,
        trainingTime1: training_time_1,
        trainingDay2: training_day_2,
        trainingTime2: training_time_2,
        matchDay: match_day,
        matchTime: match_time,
        isActive: is_active,
        createdAt: created_at,
        updatedAt: updated_at,
        clubs: clubs!teams_club_id_fkey (
          id,
          name,
          slug,
          sports,
          location,
          isActive: is_active,
          createdAt: created_at,
          updatedAt: updated_at,
          createdBy: created_by,
          sportType: sport_type,
          websiteUrl: website_url,
          facebookUrl: facebook_url,
          twitterUrl: twitter_url,
          instagramUrl: instagram_url,
          foundedYear: founded_year,
          contactEmail: contact_email,
          contactPhone: contact_phone,
          locationCity: location_city,
          locationState: location_state,
          locationCountry: location_country,
          locationPostcode: location_postcode,
          locationLatitude: location_latitude,
          locationLongitude: location_longitude,
          clubBadgeUrl: club_badge_url,
          backgroundImageUrl: background_image_url,
          aboutDescription: about_description
        )
      `)
      .eq('id', teamId)
      .maybeSingle()
      .overrideTypes<TeamDataType>();

    if (error) throw error;
    return teamData as TeamDataType ;


  } catch (error) {
    console.error('Error in getTeamData:', error);
    throw error;
  }
};


export const getPublicTeamInfo = async (teamId:string) => {
  try{
    const {data:publicTeamInfoData,error:publicTeamInfoError} = await supabase
      .from("teams")
      .select(
        `
        *,
        clubs(
        *
        ),
        team_members(
        *
        )
        `
      )
      .eq("id",teamId)
      .eq("team_members.member_status", "active")
      .maybeSingle();


    if(publicTeamInfoError) throw publicTeamInfoError
    
    return publicTeamInfoData;

  }catch(error){
    console.log("Error in getPublicTemInfo",error);
    throw error; 
  }
}