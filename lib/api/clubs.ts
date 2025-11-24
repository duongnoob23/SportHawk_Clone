import { supabase } from '@lib/supabase';
import { logger } from '@lib/utils/logger';
import { Database } from '@typ/database';

type Club = Database['public']['Tables']['clubs']['Row'];
type ClubInsert = Database['public']['Tables']['clubs']['Insert'];
type ClubUpdate = Database['public']['Tables']['clubs']['Update'];

type ClubAdminWithClub = {
  club_id: string;
  clubs: Club | null;
};

export const SPORTS = [
  'Football',
  'Rugby',
  'Cricket',
  'Tennis',
  'Basketball',
  'Netball',
  'Hockey',
  'Athletics',
] as const;

export type Sport = (typeof SPORTS)[number];

export const clubsApi = {
  async createClub(
    club: Omit<ClubInsert, 'id' | 'created_at' | 'updated_at' | 'created_by'>
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('clubs')
      .insert({
        ...club,
        created_by: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    // Automatically add the creator as the primary admin
    const { error: adminError } = await supabase.from('club_admins').insert({
      club_id: data.id,
      user_id: user.id,
      role: 'admin',
      is_primary: true,
      assigned_by: user.id, // Can now use user.id since RLS policies are fixed
    });

    if (adminError) throw adminError;

    return data;
  },

  async getClub(id: string) {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateClub(id: string, updates: ClubUpdate) {
    const { data, error } = await supabase
      .from('clubs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteClub(id: string) {
    const { error } = await supabase.from('clubs').delete().eq('id', id);

    if (error) throw error;
  },

  async listClubs(filters?: { sport?: string; city?: string }) {
    let query = supabase
      .from('clubs')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (filters?.sport) {
      query = query.contains('sports', [filters.sport]);
    }

    if (filters?.city) {
      query = query.eq('location_city', filters.city);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getMyClubs() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('club_admins')
      .select(
        `
        club_id,
        clubs (*)
      `
      )
      .eq('user_id', user.id)
      .returns<ClubAdminWithClub[]>();

    if (error) throw error;
    if (!data) return [];

    const clubs: Club[] = [];
    for (const item of data) {
      if (item.clubs) {
        clubs.push(item.clubs);
      }
    }
    return clubs;
  },

  async checkSuperAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();

    if (error) return false;
    return data?.is_super_admin || false;
  },

  async getClubDashboard(clubId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get club details
    const club = await this.getClub(clubId);

    // Get teams count
    const { count: teamsCount } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .eq('is_active', true);

    // Get teams for this club to calculate members
    const { data: clubTeams } = await supabase
      .from('teams')
      .select('id')
      .eq('club_id', clubId)
      .eq('is_active', true);

    const teamIds = clubTeams?.map((t: { id: string }) => t.id) || [];

    // Get total members count across all teams
    const { count: membersCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .in('team_id', teamIds)
      .eq('member_status', 'active');

    // Get active events count
    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .in('team_id', teamIds)
      .gte('event_date', new Date().toISOString())
      .eq('event_status', 'scheduled');

    return {
      club,
      stats: {
        totalTeams: teamsCount || 0,
        totalMembers: membersCount || 0,
        activeEvents: eventsCount || 0,
      },
    };
  },

  async checkClubAdmin(clubId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('club_admins')
      .select('id')
      .eq('club_id', clubId)
      .eq('user_id', user.id)
      .single();

    return !error && !!data;
  },

  async searchUsersForClub(clubId: string, searchTerm: string) {
    // For clubs, we'll search all users and check if they're already members
    const { data: users, error: searchError } = await supabase
      .from('auth.users')
      .select('id, email, raw_user_meta_data')
      .or(
        `email.ilike.%${searchTerm}%,raw_user_meta_data->first_name.ilike.%${searchTerm}%,raw_user_meta_data->last_name.ilike.%${searchTerm}%`
      )
      .limit(20);

    if (searchError) throw searchError;

    // Check which users are already club members
    const userIds = users?.map(u => u.id) || [];
    const { data: existingMembers } = await supabase
      .from('club_members')
      .select('user_id')
      .eq('club_id', clubId)
      .in('user_id', userIds);

    const existingMemberIds = new Set(
      existingMembers?.map(m => m.user_id) || []
    );

    // Format response
    return (users || []).map(user => ({
      id: user.id,
      email: user.email,
      first_name: user.raw_user_meta_data?.first_name || '',
      last_name: user.raw_user_meta_data?.last_name || '',
      avatar_url: user.raw_user_meta_data?.avatar_url || '',
      is_member: existingMemberIds.has(user.id),
    }));
  },

  async addClubMembers(
    clubId: string,
    userIds: string[],
    role: string = 'member'
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Prepare member records
    const memberRecords = userIds.map(userId => ({
      club_id: clubId,
      user_id: userId,
      role,
      added_by: user.id,
    }));

    // Insert members
    const { data, error } = await supabase
      .from('club_members')
      .insert(memberRecords)
      .select();

    if (error) throw error;
    return data;
  },

  async inviteClubMembers(
    clubId: string,
    invitations: {
      email?: string;
      phone?: string;
      role: string;
      message?: string;
    }[]
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Prepare invitation records
    const invitationRecords = invitations.map(inv => ({
      club_id: clubId,
      email: inv.email,
      phone: inv.phone,
      role: inv.role,
      message: inv.message,
      invited_by: user.id,
      status: 'pending',
    }));

    // Insert invitations
    const { data, error } = await supabase
      .from('team_invitations')
      .insert(invitationRecords)
      .select();

    if (error) throw error;

    // In a real app, this would trigger email/SMS sending
    // For MVP, we'll just log the invitations
    logger.log('Club invitations created:', data);

    return data;
  },

  // Public discovery endpoints
  async getPublicClubInfo(id: string) {
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select(
        `
        id,
        name,
        slug,
        sport_type,
        location_city,
        location_country,
        location_postcode,
        location_latitude,
        location_longitude,
        founded_year,
        about_description,
        club_badge_url,
        background_image_url,
        website_url,
        facebook_url,
        instagram_url,
        twitter_url,
        contact_email,
        contact_phone,
        is_active,
        sports,
        location,
        location_state
      `
      )
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (clubError) throw clubError;
    if (!club) throw new Error('Club not found');

    // Get member count
    const { data: teams } = await supabase
      .from('teams')
      .select('id')
      .eq('club_id', id)
      .eq('is_active', true);

    const teamIds = teams?.map((t: { id: string }) => t.id) || [];

    const { count: memberCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .in('team_id', teamIds)
      .eq('member_status', 'active');

    // Get team count for preview
    const { count: teamCount } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', id)
      .eq('is_active', true);

    // Get user auth status to determine visibility
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let userRole: 'public' | 'member' | 'admin' = 'public';

    if (user) {
      // Check if user is a club admin
      const { data: adminCheck } = await supabase
        .from('club_admins')
        .select('id')
        .eq('club_id', id)
        .eq('user_id', user.id)
        .single();

      if (adminCheck) {
        userRole = 'admin';
      } else {
        // Check if user is a member of any team in this club
        const { data: memberCheck } = await supabase
          .from('team_members')
          .select('id')
          .in('team_id', teamIds)
          .eq('user_id', user.id)
          .eq('member_status', 'active')
          .limit(1);

        if (memberCheck && memberCheck.length > 0) {
          userRole = 'member';
        }
      }
    }

    /*
        id,
        name,
        slug,
        sport_type,
        location_city,
        location_country,
        location_postcode,
        location_latitude,
        location_longitude,
        founded_year,
        about_description,
        club_badge_url,
        background_image_url,
        website_url,
        facebook_url,
        instagram_url,
        twitter_url
        contact_email,
        contact_phone,
        is_active,
        sports,
        location,
        location_state

    */

    // Filter contact info based on visibility settings
    const publicClubInfo = {
      id: club.id,
      name: club.name,
      slug: club.slug,
      sportType: club.sport_type,
      locationCity: club.location_city,
      locationCountry: club.location_country,
      locationPostcode: club.location_postcode,
      locationLatitude: club.location_latitude,
      locationLongitude: club.location_longitude,
      foundedYear: club.founded_year,
      aboutDescription: club.about_description,
      clubBadgeUrl: club.club_badge_url,
      backgroundImageUrl: club.background_image_url,
      websiteUrl: club.website_url,
      facebookUrl: club.facebook_url,
      instagramUrl: club.instagram_url,
      twitterUrl: club.twitter_url,
      contactEmail: club.contact_email,
      contactPhone: club.contact_phone,
      isActive: club.is_active,
      sports: club.sports || [],
      location: club.location || null,
      locationState: club.location_state,
      memberCount: memberCount || 0,
      teamCount: teamCount || 0,
      userRole,
    };

    return publicClubInfo;
  },

  checkContactVisibility(
    value: string | null,
    visibility: string | null,
    userRole: 'public' | 'member' | 'admin'
  ): string | null {
    if (!value) return null;

    const vis = visibility || 'members'; // Default to members-only

    if (vis === 'public') return value;
    if (vis === 'members' && (userRole === 'member' || userRole === 'admin'))
      return value;
    if (vis === 'private' && userRole === 'admin') return value;

    return null;
  },

  async getClubAdmins(clubId: string) {

    // First get the admin records
    const { data: admins, error: adminError } = await supabase
      .from('club_admins')
      .select('*')
      .eq('club_id', clubId)
      .order('is_primary', { ascending: false })
      .order('assigned_at');

    if (adminError) {
      console.error('Error fetching admins:', adminError);
      throw adminError;
    }


    if (!admins || admins.length === 0) return [];

    // Then get the profile data for each admin
    const userIds = admins.map(admin => admin.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, profile_photo_uri')
      .in('id', userIds);

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      throw profileError;
    }


    // Map the profiles to a lookup object
    const profileMap = (profiles || []).reduce(
      (acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      },
      {} as Record<string, any>
    );

    // Combine admin and profile data
    const result = admins.map(admin => {
      const profile = profileMap[admin.user_id] || {};
      return {
        id: admin.user_id,
        name:
          `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
          'Unknown',
        avatarUrl: profile.profile_photo_uri,
        role: admin.title || admin.role || 'Admin',
      };
    });

    return result;
  },

  async getClubTeamsPreview(clubId: string) {
    const { data: teams, error } = await supabase
      .from('teams')
      .select(
        `
        id,
        name,
        sport,
        age_group,
        team_sort
      `
      )
      .eq('club_id', clubId)
      .eq('is_active', true)
      .order('sport')
      .order('age_group');

    if (error) throw error;

    // Get member counts for each team
    const teamsWithCounts = await Promise.all(
      (teams || []).map(
        async (team: {
          id: string;
          name: string;
          sport: string;
          age_group?: string;
          team_sort?: string;
        }) => {
          const { count } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id)
            .eq('member_status', 'active');

          return {
            ...team,
            memberCount: count || 0,
          };
        }
      )
    );

    return teamsWithCounts;
  },

  async expressInterestInClub(clubId: string, payload: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be logged in to express interest');

    // Check if user has already expressed interest
    const { data: existing } = await supabase
      .from('club_interests')
      .select('id')
      .eq('club_id', clubId)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (existing) {
      throw new Error('You have already expressed interest in this club');
    }

    // Create interest record
    const { data, error } = await supabase
      .from('club_interests')
      .insert({
        club_id: clubId,
        user_id: user.id,
        interested_party: payload.interested_party,
        player_name: payload.player_name,
        player_date_of_birth: payload.player_date_of_birth,
        player_team_sort: payload.player_team_sort,
        contact_email: payload.contact_email,
        contact_phone: payload.contact_phone,
        experience_level: payload.experience_level,
        availability: payload.availability,
        notes: payload.notes,
        selected_teams: payload.selected_teams,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Send notification to club admins

    return data;
  },

  async searchClubs1(params?: {
    searchTerm?: string;
    sport?: string;
    limit?: number;
    offset?: number;
  }) {
    logger.debug('MEM-001: Search initiated', {
      searchTerm: params?.searchTerm,
      sport: params?.sport,
    });

    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    try {
      let query = supabase
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
          location_longitude
          teams
        `
        )
        .eq('is_active', true)
        .range(offset, offset + limit - 1);

      // Apply sport filter if provided
      if (params?.sport && params.sport !== 'All') {
        query = query.contains('sports', [params.sport]);
      }

      // Apply search term if provided
      if (params?.searchTerm && params.searchTerm.trim() !== '') {
        const searchWords = params.searchTerm.trim().toLowerCase().split(/\s+/);

        // Build OR conditions for each searchable field
        const searchConditions = searchWords
          .map(word => {
            // Escape special characters for ilike
            const escapedWord = word.replace(/[%_]/g, '\\$&');
            return `name.ilike.%${escapedWord}%,location_city.ilike.%${escapedWord}%,location_state.ilike.%${escapedWord}%,about_description.ilike.%${escapedWord}%,location_postcode.ilike.%${escapedWord}%,contact_phone.ilike.%${escapedWord}%`;
          })
          .join(',');

        query = query.or(searchConditions);
      }

      const { data: clubs, error, count } = await query;

      if (error) throw error;

      // Get member counts for each club
      const clubsWithCounts = await Promise.all(
        (clubs || []).map(async club => {
          // Get teams for this club
          const { data: teams } = await supabase
            .from('teams')
            .select('id')
            .eq('club_id', club.id)
            .eq('is_active', true);

          const teamIds = teams?.map(t => t.id) || [];

          // Get member count across all teams
          let memberCount = 0;
          if (teamIds.length > 0) {
            const { count } = await supabase
              .from('team_members')
              .select('*', { count: 'exact', head: true })
              .in('team_id', teamIds)
              .eq('member_status', 'active');

            memberCount = count || 0;
          }

          return {
            ...club,
            member_count: memberCount,
            coordinates:
              club.location_latitude && club.location_longitude
                ? {
                    latitude: Number(club.location_latitude),
                    longitude: Number(club.location_longitude),
                  }
                : undefined,
          };
        })
      );

      // Rank results if search term was provided
      let rankedResults = clubsWithCounts;
      if (params?.searchTerm && params.searchTerm.trim() !== '') {
        const searchWords = params.searchTerm.trim().toLowerCase().split(/\s+/);

        rankedResults = clubsWithCounts.sort((a, b) => {
          // Calculate match scores for each club
          const scoreA = calculateMatchScore(a, searchWords);
          const scoreB = calculateMatchScore(b, searchWords);

          // Sort by longest match first, then by total matches
          if (scoreA.longestMatch !== scoreB.longestMatch) {
            return scoreB.longestMatch - scoreA.longestMatch;
          }
          return scoreB.totalMatches - scoreA.totalMatches;
        });
      }

      logger.debug('MEM-001: Clubs loaded', { count: rankedResults.length });

      return {
        clubs: rankedResults,
        total_count: count || rankedResults.length,
      };
    } catch (error) {
      logger.error('MEM-001: Club search failed', error);
      throw error;
    }
  },
  async searchClubs(params?: {
    searchTerm?: string;
    sport?: string;
    limit?: number;
    offset?: number;
  }) {
    logger.debug('MEM-001: Search initiated', {
      searchTerm: params?.searchTerm,
      sport: params?.sport,
    });

    const limit = params?.limit || 20;
    const offset = params?.offset || 0;

    try {
      let query = supabase
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
          location_longitude
        `
        )
        .eq('is_active', true)
        .range(offset, offset + limit - 1);

      // Apply sport filter if provided
      if (params?.sport && params.sport !== 'All') {
        query = query.contains('sports', [params.sport]);
      }

      // Apply search term if provided
      if (params?.searchTerm && params.searchTerm.trim() !== '') {
        const searchWords = params.searchTerm.trim().toLowerCase().split(/\s+/);

        // Build OR conditions for each searchable field
        const searchConditions = searchWords
          .map(word => {
            // Escape special characters for ilike
            const escapedWord = word.replace(/[%_]/g, '\\$&');
            return `name.ilike.%${escapedWord}%,location_city.ilike.%${escapedWord}%,location_state.ilike.%${escapedWord}%,about_description.ilike.%${escapedWord}%,location_postcode.ilike.%${escapedWord}%,contact_phone.ilike.%${escapedWord}%`;
          })
          .join(',');

        query = query.or(searchConditions);
      }

      const { data: clubs, error, count } = await query;

      if (error) throw error;

      // Get member counts for each club
      const clubsWithCounts = await Promise.all(
        (clubs || []).map(async club => {
          // Get teams for this club
          const { data: teams } = await supabase
            .from('teams')
            .select('id')
            .eq('club_id', club.id)
            .eq('is_active', true);

          const teamIds = teams?.map(t => t.id) || [];

          // Get member count across all teams
          let memberCount = 0;
          if (teamIds.length > 0) {
            const { count } = await supabase
              .from('team_members')
              .select('*', { count: 'exact', head: true })
              .in('team_id', teamIds)
              .eq('member_status', 'active');

            memberCount = count || 0;
          }

          return {
            ...club,
            member_count: memberCount,
            coordinates:
              club.location_latitude && club.location_longitude
                ? {
                    latitude: Number(club.location_latitude),
                    longitude: Number(club.location_longitude),
                  }
                : undefined,
          };
        })
      );

      // Rank results if search term was provided
      let rankedResults = clubsWithCounts;
      if (params?.searchTerm && params.searchTerm.trim() !== '') {
        const searchWords = params.searchTerm.trim().toLowerCase().split(/\s+/);

        rankedResults = clubsWithCounts.sort((a, b) => {
          // Calculate match scores for each club
          const scoreA = calculateMatchScore(a, searchWords);
          const scoreB = calculateMatchScore(b, searchWords);

          // Sort by longest match first, then by total matches
          if (scoreA.longestMatch !== scoreB.longestMatch) {
            return scoreB.longestMatch - scoreA.longestMatch;
          }
          return scoreB.totalMatches - scoreA.totalMatches;
        });
      }

      logger.debug('MEM-001: Clubs loaded', { count: rankedResults.length });

      return {
        clubs: rankedResults,
        total_count: count || rankedResults.length,
      };
    } catch (error) {
      logger.error('MEM-001: Club search failed', error);
      throw error;
    }
  },
};

// Helper function to calculate match score for search ranking
function calculateMatchScore(
  club: any,
  searchWords: string[]
): { longestMatch: number; totalMatches: number } {
  const searchableText = [
    club.name || '',
    club.location_city || '',
    club.location_state || '',
    club.about_description || '',
    club.location_postcode || '',
    club.contact_phone || '',
  ]
    .join(' ')
    .toLowerCase();

  let longestMatch = 0;
  let totalMatches = 0;

  for (const word of searchWords) {
    if (searchableText.includes(word)) {
      longestMatch = Math.max(longestMatch, word.length);
      totalMatches++;
    }
  }

  return { longestMatch, totalMatches };
}
