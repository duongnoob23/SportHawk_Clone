import { supabase } from '@lib/supabase';
import { logger } from '@lib/utils/logger';
import { ClubDetailsResponse, ClubType } from '../types';

export type GetClubsType = {
  searchTerm?: string;
  sport?: string;
  limit?: number;
  offset?: number;
};

export const getClubs = async (params: GetClubsType) => {
  const limit = params?.limit || 20;
  const offset = params?.offset || 0;

  try {
    const {
      data: clubs,
      error,
      count,
    } = await supabase
      .from('clubs')
      .select(
        `
            id,
            name,
            location_city,
            location_state,
            location_postcode,
            about_description,
            sports,
            club_badge_url,
            background_image_url,
            contact_phone,
            location_latitude,
            location_longitude,
            sport_type,
            teams(
            *,
            team_members(
            *
            ),
            team_admins(
            *
            )
            )
        `
      )
      .eq('is_active', true)
      .eq('teams.team_members.member_status', 'active')
      .range(offset, offset + limit - 1)
      .overrideTypes<ClubType[]>();

    if (error) throw error;
    const clubsWithUniqueMemberCounts = clubs.map(club => {
      const allUserIds: string[] = [];

      club.teams?.forEach(team => {
        team.team_members?.forEach(member => {
          if (member.member_status === 'active') {
            allUserIds.push(member.user_id);
          }
        });
      });

      const uniqueUserIds = [...new Set(allUserIds)];

      return {
        ...club,
        member_count: uniqueUserIds.length,
        coordinates:
          club.location_latitude && club.location_longitude
            ? {
                latitude: Number(club.location_latitude),
                longitude: Number(club.location_longitude),
              }
            : undefined,
      };
    });

    return {
      clubs: clubsWithUniqueMemberCounts,
    };
  } catch (error) {
    logger.error('MEM-001: Club search failed', error);
    throw error;
  }
};

export const getClubDetails2 = async (clubsId: string) => {
  try {
    const { data: clubDetailsData, error: clubDetailsError } = await supabase
      .from('clubs')
      .select(
        `
        *,
        club_admins(
          *,
          profiles:profiles!club_admins_user_id_fkey1(*)
        ),
        teams!inner(
          *,
          team_members!inner(
            *
          )
        )
        `
      )
      .eq('id', clubsId)
      .eq('teams.is_active', true)
      .eq('teams.team_members.member_status', 'active')
      .maybeSingle();

    if (clubDetailsError) {
      console.error('Error in get club details', clubDetailsError);
      throw clubDetailsError;
    }

    return clubDetailsData;
  } catch (error) {
    console.error('Error in get club details api:', error);
    throw error;
  }
};

export const getClubDetails = async (
  clubsId: string
): Promise<ClubDetailsResponse | undefined> => {
  try {
    // Use dev client to bypass RLS in development
    const { getSupabaseClient } = await import('@lib/supabase-dev');
    const client = getSupabaseClient();

    const { data: clubDetailsData, error: clubDetailsError } = await client
      .from('clubs')
      .select(
        `
        id,
        name,
        slug,
        sportType:sport_type,
        locationCity:location_city,
        locationCountry:location_country,
        locationState:location_state,
        locationPostcode:location_postcode,
        locationLatitude:location_latitude,
        locationLongitude:location_longitude,
        foundedYear:founded_year,
        aboutDescription:about_description,
        clubBadgeUrl:club_badge_url,
        backgroundImageUrl:background_image_url,
        websiteUrl:website_url,
        facebookUrl:facebook_url,
        instagramUrl:instagram_url,
        twitterUrl:twitter_url,
        contactEmail:contact_email,
        contactPhone:contact_phone,
        isActive:is_active,
        createdAt:created_at,
        updatedAt:updated_at,
        sports,
        location,
        createdBy:created_by,

        clubAdmins:club_admins(
          id,
          role,
          title,
          clubId:club_id,
          userId:user_id,
          profiles:profiles!club_admins_user_id_fkey1(
            id,
            fcmToken:fcm_token,
            lastName:last_name,
            teamSort:team_sort,
            createdAt:created_at,
            firstName:first_name,
            updatedAt:updated_at,
            dateOfBirth:date_of_birth,
            profilePhotoUri:profile_photo_uri,
            isSporthawkAdmin:is_sporthawk_admin,
            backgroundImageUri:background_image_uri,
            startAccountDelete:start_account_delete
          ),
          isPrimary:is_primary,
          assignedAt:assigned_at,
          assignedBy:assigned_by,
          permissions
        ),

        teams(
          id,
          name,
          motto,
          sport,
          clubId:club_id,
          ageGroup:age_group,
          isActive:is_active,
          matchDay:match_day,
          teamSort:team_sort,
          teamType:team_type,
          createdAt:created_at,
          matchTime:match_time,
          teamLevel:team_level,
          updatedAt:updated_at,
          homeGround:home_ground,
          leagueName:league_name,
          foundedYear:founded_year,

          teamMembers:team_members(
            id,
            leftAt:left_at,
            teamId:team_id,
            userId:user_id,
            addedBy:added_by,
            position,
            joinedAt:joined_at,
            jerseyNumber:jersey_number,
            memberStatus:member_status,
            profiles:profiles!team_members_user_id_fkey1(
              id,
              firstName:first_name,
              lastName:last_name,
              profilePhotoUri:profile_photo_uri,
              dateOfBirth:date_of_birth,
              teamSort:team_sort,
              isSporthawkAdmin:is_sporthawk_admin
            )
          ),

          teamPhotoUrl:team_photo_url,
          trainingDay1:training_day_1,
          trainingDay2:training_day_2,
          trainingTime1:training_time_1,
          trainingTime2:training_time_2,
          homeGroundAddress:home_ground_address,
          homeGroundLatitude:home_ground_latitude,
          homeGroundLongitude:home_ground_longitude
        )
      `
      )
      .eq('id', clubsId)
      //   .eq('teams.is_active', true)
      .eq('teams.team_members.member_status', 'active')
      .maybeSingle()
      .overrideTypes<ClubDetailsResponse>();

    if (clubDetailsError) {
      console.error('Error in get club details', clubDetailsError);
      throw clubDetailsError;
    }

    if (clubDetailsData) {
      const filterClubDetailsData = clubDetailsData?.teams.filter(item => {
        return item.isActive == true;
      });
      return {
        ...clubDetailsData,
        teams: filterClubDetailsData,
      };
    } else {
      return undefined;
    }
  } catch (error) {
    console.error('Error in get club details api:', error);
    throw error;
  }
};
