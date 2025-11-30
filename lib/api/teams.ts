import { supabase } from '@lib/supabase';
import { getSupabaseClient } from '@lib/supabase-dev';
import { getAuthUser } from '@lib/utils/get-auth-user';
import { logger } from '@lib/utils/logger';
import { Database } from '@typ/database';

export const ADMIN_INVITE_MARKER = '__admin_invite__';

// type Team = Database['public']['Tables']['teams']['Row'];
type TeamInsert = Database['public']['Tables']['teams']['Insert'];
type TeamUpdate = Database['public']['Tables']['teams']['Update'];
// type TeamAdmin = Database['public']['Tables']['team_admins']['Row'];

export const AGE_GROUPS = [
  'U8',
  'U10',
  'U12',
  'U14',
  'U16',
  'U18',
  'Open',
] as const;
export const TEAM_SORTS = ['Men', 'Women', 'Mixed'] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number];
export type TeamSort = (typeof TEAM_SORTS)[number];

export const teamsApi = {
  async createTeam(
    clubId: string,
    team: Omit<
      TeamInsert,
      'id' | 'created_at' | 'updated_at' | 'club_id' | 'created_by'
    >,
    coachId?: string
  ) {
    const user = await getAuthUser();
    if (!user) throw new Error('User not authenticated');

    // Create the team
    const { data: newTeam, error: teamError } = await supabase
      .from('teams')
      .insert({
        ...team,
        club_id: clubId,
        created_by: user.id,
        is_active: true,
      })
      .select()
      .single();

    if (teamError) throw teamError;

    // If coach is specified, add them as team admin
    if (coachId && newTeam) {
      const client = getSupabaseClient();
      const { error: adminError } = await client.from('team_admins').insert({
        team_id: newTeam.id,
        user_id: coachId,
        role: 'coach',
        is_primary: true,
        assigned_by: user.id,
      });

      if (adminError) {
        logger.error('Failed to assign coach:', adminError);
        // Don't throw here - team was created successfully
      }
    }

    return newTeam;
  },

  async getTeam(id: string) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('teams')
      .select(
        `
        *,
        clubs(*)
      `
      )
      .eq('id', id)
      .maybeSingle(); // Use maybeSingle() to handle no data

    if (error) throw error;
    return data;
  },

  async updateTeam(id: string, updates: TeamUpdate) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle(); // Use maybeSingle() to handle no data

    if (error) throw error;
    return data;
  },

  async deleteTeam(id: string) {
    const client = getSupabaseClient();
    const { error } = await client
      .from('teams')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },

  async listTeamsByClub(clubId: string) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('teams')
      .select('*')
      .eq('club_id', clubId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async getTeamAdmins(teamId: string) {
    try {
      logger.log('ADM-003: Starting getTeamAdmins', { teamId });

      // Step 1: Get team admins WITHOUT trying to join profiles
      logger.log('ADM-003: Step 1 - Fetching team admins', { teamId });
      const { data: admins, error: adminsError } = await supabase
        .from('team_admins')
        .select('*')
        .eq('team_id', teamId)
        .order('is_primary', { ascending: false });

      if (adminsError) {
        logger.error('ADM-003: Step 1 FAILED - Error fetching team admins', {
          error: adminsError,
          teamId,
        });
        throw adminsError;
      }

      logger.log('ADM-003: Step 1 SUCCESS - Team admins fetched', {
        teamId,
        count: admins?.length || 0,
      });

      if (!admins || admins.length === 0) {
        logger.log('ADM-003: No team admins found', { teamId });
        return [];
      }

      // Step 2: Get profile data for all admins
      const userIds = admins.map(a => a.user_id);
      logger.log('ADM-003: Step 2 - Fetching profiles', {
        teamId,
        userIds,
        userCount: userIds.length,
      });

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, profile_photo_uri')
        .in('id', userIds);

      if (profilesError) {
        logger.error('ADM-003: Step 2 FAILED - Error fetching profiles', {
          error: profilesError,
          teamId,
          userIds,
        });
        throw profilesError;
      }

      logger.log('ADM-003: Step 2 SUCCESS - Profiles fetched', {
        teamId,
        profileCount: profiles?.length || 0,
      });

      // Step 3: Combine the data
      logger.log('ADM-003: Step 3 - Combining data', { teamId });

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const result = admins.map(admin => {
        const profile = profileMap.get(admin.user_id);

        logger.log('ADM-003: Step 3a - Combined admin data', {
          userId: admin.user_id,
          hasProfile: !!profile,
          role: admin.role,
        });

        return {
          ...admin,
          user: profile || {
            id: admin.user_id,
            first_name: '',
            last_name: '',
            profile_photo_uri: null,
          },
        };
      });

      logger.log('ADM-003: Step 3 SUCCESS - All data combined', {
        teamId,
        resultCount: result.length,
        summary: result.map(r => ({
          userId: r.user_id,
          name: `${r.user?.first_name || ''} ${r.user?.last_name || ''}`.trim(),
          role: r.role,
        })),
      });

      return result;
    } catch (error) {
      logger.error('ADM-003: FINAL ERROR - Failed to get team admins', {
        error,
        teamId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  },

  async addTeamAdmin(teamId: string, userId: string, role: string = 'coach') {
    const user = await getAuthUser();
    if (!user) throw new Error('User not authenticated');

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('team_admins')
      .insert({
        team_id: teamId,
        user_id: userId,
        role,
        assigned_by: user.id,
      })
      .select()
      .maybeSingle(); // Use maybeSingle() to handle no data

    if (error) throw error;
    return data;
  },

  async removeTeamAdmin(teamId: string, userId: string) {
    const client = getSupabaseClient();
    const { error } = await client
      .from('team_admins')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async checkTeamNameAvailable(
    clubId: string,
    name: string,
    excludeTeamId?: string
  ) {
    let query = supabase
      .from('teams')
      .select('id')
      .eq('club_id', clubId)
      .eq('name', name)
      .eq('is_active', true);

    if (excludeTeamId) {
      query = query.neq('id', excludeTeamId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return !data || data.length === 0;
  },

  async getSportsByClub(clubId: string) {
    const { data, error } = await supabase
      .from('clubs')
      .select('sports')
      .eq('id', clubId)
      .single();

    if (error) throw error;
    return data?.sports || [];
  },

  async checkTeamAdmin(teamId: string) {
    const user = await getAuthUser();
    if (!user) return false;

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('team_admins')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .maybeSingle(); // Use maybeSingle() to handle no data

    return !error && !!data;
  },

  async getTeamAdminDashboard(teamId: string) {
    const team = await this.getTeam(teamId);

    const client = getSupabaseClient();
    // Get member count
    const { count: membersCount } = await client
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .eq('member_status', 'active');

    // Get upcoming events count
    const { count: eventsCount } = await client
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .gte('event_date', new Date().toISOString())
      .eq('event_status', 'scheduled');

    // Get pending payments count
    const { count: paymentsCount } = await client
      .from('payment_requests')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .eq('status', 'pending');

    // Get unread alerts count
    const { count: alertsCount } = await client
      .from('team_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .eq('is_read', false);

    return {
      team,
      stats: {
        totalMembers: membersCount || 0,
        upcomingEvents: eventsCount || 0,
        pendingPayments: paymentsCount || 0,
        unreadAlerts: alertsCount || 0,
      },
    };
  },

  async getTeamSectionSummaries(teamId: string) {
    const client = getSupabaseClient();
    // Get recent events
    const { data: events } = await client
      .from('events')
      .select('*')
      .eq('team_id', teamId)
      .gte('event_date', new Date().toISOString())
      .eq('event_status', 'scheduled')
      .order('event_date', { ascending: true })
      .limit(3);

    // Get recent payment requests
    const { data: payments } = await client
      .from('payment_requests')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(3);

    // Get recent members
    const { data: members } = await client
      .from('team_members')
      .select(
        `
        *,
        users:user_id (
          id,
          email,
          raw_user_meta_data
        )
      `
      )
      .eq('team_id', teamId)
      .eq('member_status', 'active')
      .order('joined_at', { ascending: false })
      .limit(3);

    // Get recent alerts
    const { data: alerts } = await client
      .from('team_alerts')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(3);

    return {
      events: events || [],
      payments: payments || [],
      members: members || [],
      alerts: alerts || [],
    };
  },

  async searchUsersForTeam(teamId: string, searchTerm: string) {
    const { data, error } = await supabase.rpc('search_users_for_team', {
      p_search_term: searchTerm,
      p_team_id: teamId,
      p_limit: 20,
    });

    if (error) throw error;
    return data || [];
  },

  async addTeamMembers(teamId: string, userIds: string[]) {
    const user = await getAuthUser();
    if (!user) throw new Error('User not authenticated');

    // Prepare member records
    const memberRecords = userIds.map(userId => ({
      team_id: teamId,
      user_id: userId,
      member_status: 'active',
      added_by: user.id,
    }));

    const client = getSupabaseClient();
    // Insert members
    const { data, error } = await client
      .from('team_members')
      .insert(memberRecords)
      .select();

    if (error) throw error;
    return data;
  },

  async inviteTeamMembers(
    teamId: string,
    invitations: {
      email?: string;
      phone?: string;
      role: string;
      message?: string;
    }[]
  ) {
    const user = await getAuthUser();
    if (!user) throw new Error('User not authenticated');

    // Prepare invitation records
    const invitationRecords = invitations.map(inv => ({
      team_id: teamId,
      email: inv.email,
      phone: inv.phone,
      role: inv.role,
      message: inv.message,
      invited_by: user.id,
      status: 'pending',
    }));

    const client = getSupabaseClient();
    // Insert invitations
    const { data, error } = await client
      .from('team_invitations')
      .insert(invitationRecords)
      .select();

    if (error) throw error;

    // In a real app, this would trigger email/SMS sending
    // For MVP, we'll just log the invitations
    logger.log('Team invitations created:', data);

    return data;
  },

  async getTeamMembers(
    teamId: string,
    options?: {
      search?: string;
      role?: string;
      sortBy?: 'name' | 'joined_at';
      sortOrder?: 'asc' | 'desc';
      page?: number;
      pageSize?: number;
    }
  ) {
    const {
      page = 1,
      pageSize = 20,
      search,
      role,
      sortBy = 'name',
      sortOrder = 'asc',
    } = options || {};

    const client = getSupabaseClient();
    // Step 1: Fetch team admins (managers, coaches) - no FK to profiles
    const { data: admins, error: adminsError } = await client
      .from('team_admins')
      .select('*')
      .eq('team_id', teamId);

    if (adminsError) {
      logger.error('Error fetching team admins:', adminsError);
      throw adminsError;
    }

    // Step 2: Fetch team members - no FK to profiles, no role column
    let membersQuery = client
      .from('team_members')
      .select('*', { count: 'exact' })
      .eq('team_id', teamId)
      .eq('member_status', 'active');

    // Apply pagination for members only (admins always shown)
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    membersQuery = membersQuery.range(from, to);

    const { data: members, error: membersError, count } = await membersQuery;

    if (membersError) {
      logger.error('Error fetching team members:', membersError);
      throw membersError;
    }

    // Step 3: Collect all user IDs and fetch profiles separately
    const allUserIds = new Set<string>();

    if (admins) {
      // logger.log('Team Admins user objects:', admins);
      admins.forEach(admin => allUserIds.add(admin.user_id));
      // logger.log('Team Admins user ids:', allUserIds);
    }

    if (members) {
      // logger.log('Team Members user objects:', members);
      members.forEach(member => allUserIds.add(member.user_id));
    }

    // logger.log('Team Admins & Members user ids:', allUserIds);

    let profiles: any[] = [];
    if (allUserIds.size > 0) {
      const { data: profileData, error: profilesError } = await client
        .from('profiles')
        .select('id, first_name, last_name, profile_photo_uri')
        .in('id', Array.from(allUserIds));

      if (profilesError) {
        logger.error('Error fetching profiles:', profilesError);
        // Continue without profile data rather than failing completely
      } else {
        profiles = profileData || [];
      }
    }
    // logger.log('Team Admins & Members profiles:', profiles);

    // Step 4: Create profile lookup map
    const profileMap = new Map(
      profiles.map(p => [
        p.id,
        {
          id: p.id,
          name:
            `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown',
          email: '', // profiles table doesn't have email
          phone: null, // profiles table doesn't have phone
          profilePhoto: p.profile_photo_uri,
        },
      ])
    );

    // Step 5: Combine admins and members with their profiles
    const combinedList: any[] = [];

    // Add admins first (managers/coaches have role column)
    if (admins) {
      admins.forEach(admin => {
        const profile = profileMap.get(admin.user_id);
        combinedList.push({
          id: admin.id,
          user: profile || {
            id: admin.user_id,
            name: 'Unknown',
            email: '',
            phone: null,
            profilePhoto: null,
          },
          role: admin.role || 'admin', // admin.role is manager/coach/admin
          joinedAt: admin.assigned_at,
          lastActive: null,
        });
      });
    }

    // Add members (no role column, they're just members)
    if (members) {
      members.forEach(member => {
        const profile = profileMap.get(member.user_id);
        combinedList.push({
          id: member.id,
          user: profile || {
            id: member.user_id,
            name: 'Unknown',
            email: '',
            phone: null,
            profilePhoto: null,
          },
          role: 'member', // Members don't have roles, they're just members
          joinedAt: member.joined_at,
          lastActive: null,
        });
      });
    }

    // Step 6: Apply filters if needed
    let filteredList = combinedList;

    // Filter by role if specified
    if (role && role !== 'all') {
      filteredList = filteredList.filter(item => {
        // UI expects 'admin' filter to include admin/coach/manager
        if (role === 'admin') {
          return (
            item.role === 'admin' ||
            item.role === 'coach' ||
            item.role === 'manager'
          );
        }
        return item.role === role;
      });
    }

    // Apply search filter if specified
    if (search) {
      const searchLower = search.toLowerCase();
      filteredList = filteredList.filter(item =>
        item.user?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Step 7: Apply sorting
    if (sortBy === 'name') {
      filteredList.sort((a, b) => {
        const nameA = (a.user?.name || '').toLowerCase();
        const nameB = (b.user?.name || '').toLowerCase();
        return sortOrder === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    } else if (sortBy === 'joined_at') {
      filteredList.sort((a, b) => {
        const dateA = new Date(a.joinedAt || 0).getTime();
        const dateB = new Date(b.joinedAt || 0).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }

    return {
      members: filteredList,
      pagination: {
        total: (count || 0) + (admins?.length || 0), // Total includes both
        page,
        pageSize,
        hasMore: (count || 0) + (admins?.length || 0) > to + 1,
      },
    };
  },

  async updateMemberRole(teamId: string, memberId: string, newRole: string) {
    const user = await getAuthUser();
    if (!user) throw new Error('User not authenticated');

    // Note: team_members table doesn't have a role column
    // Only team_admins have roles (manager/coach/admin)
    // This function would need to:
    // 1. Remove from team_members and add to team_admins if promoting to admin/coach
    // 2. Remove from team_admins and add to team_members if demoting to member
    // For now, throw error as this needs proper implementation

    throw new Error(
      'updateMemberRole not implemented: team_members has no role column, only team_admins have roles'
    );
  },

  async removeTeamMember(teamId: string, memberId: string) {
    const user = await getAuthUser();
    if (!user) throw new Error('User not authenticated');

    const client = getSupabaseClient();
    const { error: updateError } = await client
      .from('team_members')
      .update({
        member_status: 'inactive',
        left_at: new Date().toISOString(),
      })
      .eq('team_id', teamId)
      .eq('user_id', memberId);

    const { error: updateStatusError } = await client
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
  },

  async bulkUpdateMemberRoles(
    teamId: string,
    memberIds: string[],
    newRole: string
  ) {
    const user = await getAuthUser();
    if (!user) throw new Error('User not authenticated');

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('team_members')
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .in('id', memberIds)
      .eq('team_id', teamId)
      .select();

    if (error) throw error;
    return data;
  },

  async bulkRemoveTeamMembers(teamId: string, memberIds: string[]) {
    const user = await getAuthUser();
    if (!user) throw new Error('User not authenticated');

    const client = getSupabaseClient();
    const { error: updateError } = await client
      .from('team_members')
      .update({
        member_status: 'inactive',
        left_at: new Date().toISOString(),
      })
      .in('user_id', memberIds)
      .eq('team_id', teamId);

    if (updateError) throw updateError;
  },

  async getUserTeams() {
    const { getAuthUser } = await import('@lib/utils/get-auth-user');
    const user = await getAuthUser();

    // Query 1: Get teams where user is an admin
    const { data: adminTeams, error: adminError } = await supabase
      .from('team_admins')
      .select(
        `
        team_id,
        role,
        is_primary,
        teams!inner (
          id,
          name,
          sport,
          team_photo_url,
          club_id,
          is_active,
          clubs (
            id,
            name,
            club_badge_url
          )
        )
      `
      )
      .eq('user_id', user.id);

    if (adminError) {
      logger.error('Error fetching admin teams:', adminError);
      throw adminError;
    }

    // Query 2: Get teams where user is a member
    const { data: memberTeams, error: memberError } = await supabase
      .from('team_members')
      .select(
        `
        team_id,
        position,
        jersey_number,
        member_status,
        teams!inner (
          id,
          name,
          sport,
          team_photo_url,
          club_id,
          is_active,
          clubs (
            id,
            name,
            club_badge_url
          )
        )
      `
      )
      .eq('user_id', user.id)
      .eq('member_status', 'active');

    if (memberError) {
      logger.error('Error fetching member teams:', memberError);
      throw memberError;
    }

    // Combine teams - user can be BOTH admin AND member
    const teamsMap = new Map();

    // Process admin teams first
    if (adminTeams) {
      adminTeams.forEach(item => {
        if (item.teams && item.teams.is_active) {
          const team = item.teams;
          teamsMap.set(team.id, {
            id: team.id,
            name: team.name,
            sport: team.sport,
            team_photo_url: team.team_photo_url,
            club_id: team.club_id,
            // User is an admin
            is_admin: true,
            admin_role: item.role,
            is_primary_admin: item.is_primary,
            // Not yet known if also a member
            is_member: false,
            position: null,
            jersey_number: null,
            club: team.clubs
              ? {
                  id: team.clubs.id,
                  name: team.clubs.name,
                  club_badge_url: team.clubs.club_badge_url,
                }
              : null,
          });
        }
      });
    }

    // Process member teams - UPDATE existing or ADD new
    if (memberTeams) {
      memberTeams.forEach(item => {
        if (item.teams && item.teams.is_active) {
          const team = item.teams;
          const existing = teamsMap.get(team.id);

          if (existing) {
            // User is BOTH admin and member - update with member info
            existing.is_member = true;
            existing.position = item.position;
            existing.jersey_number = item.jersey_number;
          } else {
            // User is only a member
            teamsMap.set(team.id, {
              id: team.id,
              name: team.name,
              sport: team.sport,
              team_photo_url: team.team_photo_url,
              club_id: team.club_id,
              // User is not an admin
              is_admin: false,
              admin_role: null,
              is_primary_admin: false,
              // User is a member
              is_member: true,
              position: item.position,
              jersey_number: item.jersey_number,
              club: team.clubs
                ? {
                    id: team.clubs.id,
                    name: team.clubs.name,
                    club_badge_url: team.clubs.club_badge_url,
                  }
                : null,
            });
          }
        }
      });
    }

    // Convert map to array and sort by name
    const userTeams = Array.from(teamsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return {
      teams: userTeams,
      adminTeams: userTeams.filter(t => t.is_admin),
      memberTeams: userTeams.filter(t => t.is_member),
    };
  },

  // Public discovery endpoints
  async getPublicTeamInfo(id: string) {
    // removed training_schedule,

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select(
        `
        id,
        club_id,
        name,
        team_type,
        sport,
        league_name,
        team_level,
        team_sort,
        age_group,
        home_ground,
        home_ground_address,
        home_ground_latitude,
        home_ground_longitude,
        founded_year,
        motto,
        team_photo_url,
        training_day_1,
        training_time_1,
        training_day_2,
        training_time_2,
        match_day,
        match_time,
        is_active
      `
      )
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (teamError) throw teamError;
    if (!team) throw new Error('Team not found');

    // Get club info separately
    const { data: club } = await supabase
      .from('clubs')
      .select('id, name, club_badge_url,created_by')
      .eq('id', team.club_id)
      .single();

    // Get member count
    const { count: memberCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', id)
      .eq('member_status', 'active');

    // Get coach info
    const { data: teamAdmins } = await supabase
      .from('team_admins')
      .select('user_id')
      .eq('team_id', id)
      .eq('role', 'coach')
      .eq('is_primary', true)
      .limit(1);

    let coach = null;
    if (teamAdmins && teamAdmins[0]) {
      const { data: coachUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', teamAdmins[0].user_id)
        .single();

      if (coachUser) {
        coach = {
          id: coachUser.id,
          name:
            `${coachUser.first_name || ''} ${coachUser.last_name || ''}`.trim() ||
            'Coach',
          photo: coachUser.profile_photo_uri,
          qualifications: [], // TODO: Add qualifications field to profiles table
        };
      }
    }

    // Get user auth status to determine visibility
    const user = await getAuthUser();
    let userRole: 'public' | 'member' | 'admin' = 'public';

    const client = getSupabaseClient();
    if (user) {
      // Check if user is a team admin
      const { data: adminCheck } = await client
        .from('team_admins')
        .select('id')
        .eq('team_id', id)
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle() to handle no data

      if (adminCheck) {
        userRole = 'admin';
      } else {
        // Check if user is a team member
        const { data: memberCheck } = await client
          .from('team_members')
          .select('id')
          .eq('team_id', id)
          .eq('user_id', user.id)
          .eq('member_status', 'active')
          .maybeSingle(); // Use maybeSingle() to handle no data

        if (memberCheck) {
          userRole = 'member';
        }
      }
    }

    const publicTeamInfo = {
      id: team.id,
      club: club
        ? {
            id: club.id,
            name: club.name,
            logo: club.club_badge_url,
            createdBy: club.created_by,
          }
        : null,
      name: team.name,
      team_type: team.team_type,
      sport: team.sport,
      leagueName: team.league_name,
      teamSort: team.team_sort,
      teamLevel: team.team_level,
      ageGroup: team.age_group,
      homeGround: team.home_ground,
      homeGroundAddress: team.home_ground_address,
      homeGroundLatitude: team.home_ground_latitude,
      homeGroundLongitude: team.home_ground_longitude,
      foundedYear: team.founded_year,
      motto: team.motto,
      teamPhotoUrl: team.team_photo_url,
      trainingDay1: team.training_day_1,
      trainingTime1: team.training_time_1,
      trainingDay2: team.training_day_2,
      trainingTime2: team.training_time_2,
      matchDay: team.match_day,
      matchTime: team.match_time,
      coach,
      memberCount: memberCount || 0,
      userRole,
    };

    return publicTeamInfo;
  },

  async expressInterestInTeam(teamId: string, adminId: string) {
    const user = await getAuthUser();
    if (!user) throw new Error('User must be logged in to express interest');

    const client = getSupabaseClient();
    // Check if user has already expressed interest
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
  },

  // Simple helper for edit-squad screen - gets flat list of members with profiles
  async getTeamMembersSimple(teamId: string) {
    try {
      // Get team members
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('member_status', 'active');

      if (membersError) throw membersError;
      if (!members || members.length === 0) return [];

      // Get profiles for all members
      const userIds = members.map(m => m.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, profile_photo_uri')
        .in('id', userIds);

      if (profilesError) {
        logger.error('Error fetching profiles:', profilesError);
        // Return members without profiles rather than failing
        return members.map(m => ({
          ...m,
          profile: null,
        }));
      }

      // Create profile lookup
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Combine members with profiles
      return members.map(member => ({
        ...member,
        profile: profileMap.get(member.user_id) || null,
      }));
    } catch (error) {
      logger.error('Error in getTeamMembersSimple:', error);
      throw error;
    }
  },

  // Simple helper for edit-squad screen - gets flat list of admins with profiles
  async getTeamAdminsSimple(teamId: string) {
    try {
      // Get team admins
      const { data: admins, error: adminsError } = await supabase
        .from('team_admins')
        .select('*')
        .eq('team_id', teamId)
        .order('is_primary', { ascending: false });

      if (adminsError) throw adminsError;
      if (!admins || admins.length === 0) return [];

      // Get profiles for all admins
      const userIds = admins.map(a => a.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, profile_photo_uri')
        .in('id', userIds);

      if (profilesError) {
        logger.error('Error fetching profiles:', profilesError);
        // Return admins without profiles rather than failing
        return admins.map(a => ({
          ...a,
          profile: null,
        }));
      }

      // Create profile lookup
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Combine admins with profiles
      return admins.map(admin => ({
        ...admin,
        profile: profileMap.get(admin.user_id) || null,
      }));
    } catch (error) {
      logger.error('Error in getTeamAdminsSimple:', error);
      throw error;
    }
  },

  // Check if user has pending interest expression for a team
  async checkInterestStatus(teamId: string) {
    try {
      const user = await getAuthUser();
      if (!user) {
        return { hasPending: false };
      }

      const client = getSupabaseClient();
      // Check for pending interest expression
      const { data, error } = await client
        .from('interest_expressions')
        .select('id, interest_status')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .eq('interest_status', 'pending')
        .maybeSingle();

      if (error) {
        logger.error('Error checking interest status:', error);
        return { hasPending: false };
      }

      return {
        hasPending: !!data,
        interestId: data?.id,
        status: data?.interest_status,
      };
    } catch (error) {
      logger.error('Error in checkInterestStatus:', error);
      return { hasPending: false };
    }
  },

  // --- NEW TEAM ADMIN ENDPOINTS ---

  // Search team members with query
  async searchTeamMembers(teamId: string, query: string) {
    try {
      const client = getSupabaseClient();
      const { data: members, error } = await client
        .from('team_members')
        .select(
          `
          *,
          profiles:users (
            id,
            first_name,
            last_name,
            email,
            avatar_url
          )
        `
        )
        .eq('team_id', teamId)
        .or(
          `profiles.first_name.ilike.%${query}%,profiles.last_name.ilike.%${query}%,profiles.email.ilike.%${query}%`
        );

      if (error) throw error;
      return members || [];
    } catch (error) {
      logger.error('Error searching team members:', error);
      throw error;
    }
  },

  // Get count of pending interest expressions
  async getPendingInterestCount(teamId: string) {
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
      logger.error('Error getting pending interest count:', error);
      throw error;
    }
  },

  // Get all pending interest expressions with user details
  async getInterestExpressions(teamId: string) {
    try {
      const client = getSupabaseClient();
      const { data: expressions, error } = await client
        .from('interest_expressions')
        .select(
          `
          *,
          user:users (
            id,
            first_name,
            last_name,
            email,
            avatar_url
          )
        `
        )
        .eq('team_id', teamId)
        .eq('interest_status', 'pending')
        .order('expressed_at', { ascending: true });

      if (error) throw error;
      return expressions || [];
    } catch (error) {
      logger.error('Error getting interest expressions:', error);
      throw error;
    }
  },

  // Accept an interest expression and add member to team
  async acceptInterestExpression1(teamId: string, userId: string) {
    try {
      const user = await getAuthUser();
      if (!user) throw new Error('User not authenticated');

      const client = getSupabaseClient();
      // Start transaction by using multiple operations
      // 1. Add user to team_members if not already there
      const { error: memberError } = await client.from('team_members').upsert(
        {
          team_id: teamId,
          user_id: userId,
          member_status: 'active',
          joined_at: new Date().toISOString(),
        },
        {
          onConflict: 'team_id,user_id',
        }
      );

      if (memberError) throw memberError;

      // 2. Update interest status to accepted
      const { error: updateError } = await client
        .from('interest_expressions')
        .update({ interest_status: 'accepted' })
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // 3. Create notification for accepted user
      const { data: team } = await client
        .from('teams')
        .select('team_name')
        .eq('id', teamId)
        .maybeSingle(); // Use maybeSingle() to handle no data

      const { error: notifError } = await client.from('notifications').insert({
        user_id: userId,
        notification_type: 'team_membership',
        title: 'Team Membership Accepted',
        message: `You have been accepted to team ${team?.team_name || 'the team'}`,
        data: { team_id: teamId, action: 'accepted' },
      });

      if (notifError) {
        logger.error('Error creating notification:', notifError);
      }

      return { success: true };
    } catch (error) {
      logger.error('Error accepting interest expression:', error);
      throw error;
    }
  },

  // Decline an interest expression
  async ignoreInterestExpression(teamId: string, userId: string) {
    try {
      const client = getSupabaseClient();
      // Update interest status to declined
      const { error: updateError } = await client
        .from('interest_expressions')
        .update({ interest_status: 'declined' })
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .eq('interest_status', 'pending');

      if (updateError) {
        if (updateError.code === '23514') {
          logger.warn('ADM-002: Decline status not permitted, deleting row', {
            teamId,
            userId,
            error: updateError,
          });

          const { error: deleteError } = await client
            .from('interest_expressions')
            .delete()
            .eq('team_id', teamId)
            .eq('user_id', userId)
            .eq('interest_status', 'pending');

          if (deleteError) throw deleteError;
        } else {
          throw updateError;
        }
      }

      // Create notification for declined user
      const { data: team } = await client
        .from('teams')
        .select('team_name')
        .eq('id', teamId)
        .maybeSingle(); // Use maybeSingle() to handle no data

      const { error: notifError } = await client.from('notifications').insert({
        user_id: userId,
        notification_type: 'team_membership',
        title: 'Team Request Update',
        message: `Your request to join ${team?.team_name || 'the team'} was not accepted`,
        data: { team_id: teamId, action: 'declined' },
      });

      if (notifError) {
        logger.error('Error creating notification:', notifError);
      }

      return { success: true };
    } catch (error) {
      logger.error('Error declining interest expression:', error);
      throw error;
    }
  },

  // Invite a player to the team
  async invitePlayer(teamId: string, userId: string) {
    try {
      const user = await getAuthUser();
      if (!user) throw new Error('User not authenticated');

      const client = getSupabaseClient();
      // Create an invitation (interest_expression with invited status)
      const { error: inviteError } = await client
        .from('interest_expressions')
        .insert({
          team_id: teamId,
          user_id: userId,
          interest_status: 'invited',
          expressed_at: new Date().toISOString(),
        });

      if (inviteError) throw inviteError;

      // Create notification for invited user
      const { data: team } = await client
        .from('teams')
        .select('team_name')
        .eq('id', teamId)
        .maybeSingle(); // Use maybeSingle() to handle no data

      const { error: notifError } = await client.from('notifications').insert({
        user_id: userId,
        notification_type: 'team_membership',
        title: 'Team Invitation',
        message: `You have been invited to join ${team?.team_name || 'a team'}`,
        data: { team_id: teamId, action: 'invited' },
      });

      if (notifError) {
        logger.error('Error creating notification:', notifError);
      }

      return { success: true };
    } catch (error) {
      logger.error('Error inviting player:', error);
      throw error;
    }
  },

  // Check if user is a Super Admin (has is_primary = true)
  async checkSuperAdmin(teamId: string, userId: string) {
    try {
      const client = getSupabaseClient();
      const { data: admin, error } = await client
        .from('team_admins')
        .select('is_primary')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single();

      if (error) {
        logger.error('Error checking super admin status:', error);
        return false;
      }

      return admin?.is_primary === true;
    } catch (error) {
      logger.error('Error in checkSuperAdmin:', error);
      return false;
    }
  },

  // Search team members who are not admins
  async searchNonAdminMembers(teamId: string, query: string) {
    try {
      // First get all admin user IDs
      const { data: admins, error: adminError } = await supabase
        .from('team_admins')
        .select('user_id')
        .eq('team_id', teamId);

      if (adminError) throw adminError;

      const adminIds = admins?.map(a => a.user_id) || [];

      // Search team members excluding admins
      let searchQuery = supabase
        .from('team_members')
        .select(
          `
          *,
          user:users (
            id,
            first_name,
            last_name,
            email,
            avatar_url
          )
        `
        )
        .eq('team_id', teamId);

      if (adminIds.length > 0) {
        searchQuery = searchQuery.not(
          'user_id',
          'in',
          `(${adminIds.join(',')})`
        );
      }

      if (query) {
        searchQuery = searchQuery.or(
          `user.first_name.ilike.%${query}%,user.last_name.ilike.%${query}%,user.email.ilike.%${query}%`
        );
      }

      const { data: members, error } = await searchQuery;

      if (error) throw error;
      return members || [];
    } catch (error) {
      logger.error('Error searching non-admin members:', error);
      throw error;
    }
  },

  // Promote a team member to admin
  async promoteToAdmin(
    teamId: string,
    userId: string,
    role: string = 'Manager'
  ) {
    try {
      const user = await getAuthUser();
      if (!user) throw new Error('User not authenticated');

      const client = getSupabaseClient();
      // Check if user is already an admin
      const { data: existingAdmin } = await client
        .from('team_admins')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle() to handle no data

      if (existingAdmin) {
        throw new Error('User is already an admin');
      }

      // Add to team_admins
      const { error: adminError } = await client.from('team_admins').insert({
        team_id: teamId,
        user_id: userId,
        role: role,
        is_primary: false,
        assigned_at: new Date().toISOString(),
        assigned_by: user.id,
      });

      if (adminError) throw adminError;

      // Create notification for promoted user
      const { data: team } = await supabase
        .from('teams')
        .select('team_name')
        .eq('id', teamId)
        .single();

      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          notification_type: 'admin_change',
          title: 'Admin Role Granted',
          message: `You have been promoted to admin for ${team?.team_name || 'the team'}`,
          data: { team_id: teamId, action: 'promoted', role },
        });

      if (notifError) {
        logger.error('Error creating notification:', notifError);
      }

      return { success: true };
    } catch (error) {
      logger.error('Error promoting to admin:', error);
      throw error;
    }
  },

  // ADM-002: Add Members screen endpoints
  /**
   * Get pending interest expressions for a team
   * Returns all pending requests to join the team
   */
  async getInterestExpressions(teamId: string) {
    try {
      logger.log('ADM-002: Starting getInterestExpressions', { teamId });

      const client = getSupabaseClient();
      // Step 1: Get interest expressions WITHOUT trying to join auth.users
      logger.log('ADM-002: Step 1 - Fetching interest expressions', { teamId });
      const { data: expressions, error: expressionsError } = await client
        .from('interest_expressions')
        .select('*')
        .eq('team_id', teamId)
        .eq('interest_status', 'pending')
        .order('expressed_at', { ascending: true });

      if (expressionsError) {
        logger.error(
          'ADM-002: Step 1 FAILED - Error fetching interest expressions',
          {
            error: expressionsError,
            teamId,
            query:
              'interest_expressions.select(*).eq(team_id).eq(interest_status)',
          }
        );
        throw expressionsError;
      }

      logger.log('ADM-002: Step 1 SUCCESS - Interest expressions fetched', {
        teamId,
        count: expressions?.length || 0,
      });

      if (!expressions || expressions.length === 0) {
        logger.log('ADM-002: No pending interest expressions found', {
          teamId,
        });
        return [];
      }

      // Step 2: Get profile data for all users
      const userIds = expressions.map(e => e.user_id);
      logger.log('ADM-002: Step 2 - Fetching profiles', {
        teamId,
        userIds,
        userCount: userIds.length,
      });

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, profile_photo_uri')
        .in('id', userIds);

      if (profilesError) {
        logger.error('ADM-002: Step 2 FAILED - Error fetching profiles', {
          error: profilesError,
          teamId,
          userIds,
          query: 'profiles.select(...).in(id, userIds)',
        });
        throw profilesError;
      }

      logger.log('ADM-002: Step 2 SUCCESS - Profiles fetched', {
        teamId,
        profileCount: profiles?.length || 0,
        profileIds: profiles?.map(p => p.id) || [],
      });

      // Step 3: Get emails from auth.users using Admin API
      // Note: ADM-002 doesn't use email, but other consumers might need it
      logger.log('ADM-002: Step 3 - Fetching emails from auth.users', {
        teamId,
        userIds,
        note: 'ADM-002 does not use email, but keeping for other consumers',
      });

      const emailMap: Record<string, string> = {};

      // Try to get user emails one by one (batch API not available in client SDK)
      for (const userId of userIds) {
        try {
          // Attempt email fetch - silent if fails since ADM-002 doesn't use it

          // Try using auth.getUser which might work if we have proper permissions
          const { data: userData, error: userError } =
            await supabase.auth.admin.getUserById(userId);

          if (userError) {
            // Expected - email not accessible from client, not needed for ADM-002
            emailMap[userId] = '';
          } else {
            emailMap[userId] = userData.user?.email || '';
          }
        } catch (err) {
          // Silent fallback - email not critical for ADM-002
          emailMap[userId] = '';
        }
      }

      logger.log('ADM-002: Step 3 COMPLETE - Email fetch results', {
        teamId,
        totalUsers: userIds.length,
        emailsFound: Object.values(emailMap).filter(e => e).length,
        emailMap,
      });

      // Step 4: Combine all the data
      logger.log('ADM-002: Step 4 - Combining data', { teamId });

      const result = expressions.map(expression => {
        const profile = profiles?.find(p => p.id === expression.user_id);
        const email = emailMap[expression.user_id] || '';

        const combinedUser = {
          id: expression.user_id,
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          email: email, // Kept for other consumers, ADM-002 doesn't display it
          profile_photo_uri: profile?.profile_photo_uri || null,
          favorite_position: null, // Not in database, ADM-002 shows empty subtitle
        };

        logger.log('ADM-002: Step 4a - Combined user data', {
          userId: expression.user_id,
          hasProfile: !!profile,
          hasEmail: !!email,
          combinedUser,
        });

        return {
          ...expression,
          user: combinedUser,
        };
      });

      logger.log('ADM-002: Step 4 SUCCESS - All data combined', {
        teamId,
        resultCount: result.length,
        summary: result.map(r => ({
          userId: r.user_id,
          name: `${r.user.first_name} ${r.user.last_name}`.trim(),
          hasEmail: !!r.user.email,
        })),
      });

      return result;
    } catch (error) {
      logger.error(
        'ADM-002: FINAL ERROR - Failed to get interest expressions',
        {
          error,
          teamId,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
        }
      );
      throw error;
    }
  },

  /**
   * Accept an interest expression and add user to team
   * Updates status to accepted and adds to team_members
   */
  async acceptInterestExpression(
    teamId: string,
    userId: string,
    teamName: string
  ) {
    try {
      logger.log('ADM-002: Accepting interest expression', { teamId, userId });

      const user = await getAuthUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const client = getSupabaseClient();
      // Start transaction-like operations
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
          logger.error('ADM-002: Error adding team member', {
            memberError,
            teamId,
            userId,
          });
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
          logger.error('ADM-002: Error adding team member', {
            memberError,
            teamId,
            userId,
          });
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
        logger.error('ADM-002: Error updating interest status', {
          updateError,
          teamId,
          userId,
        });
        throw updateError;
      }

      // 4. Create notification for accepted user
      const { error: notifError } = await client.from('notifications').insert({
        user_id: userId,
        notification_type: 'team_membership',
        title: 'Team Membership Accepted',
        message: `You have been accepted to team ${teamName}`,
        data: { team_id: teamId, action: 'accepted' },
      });

      if (notifError) {
        logger.warn('ADM-002: Notification skipped due to RLS', {
          notifError,
          teamId,
          userId,
        });
        // Non-critical, don't throw
      }

      logger.log('ADM-002: Interest accepted successfully', {
        teamId,
        userId,
        addedToTeam: true,
      });

      return { success: true };
    } catch (error) {
      logger.error('ADM-002: Failed to accept interest expression', error);
      throw error;
    }
  },

  /**
   * Decline an interest expression
   * Updates status to declined and notifies user
   */
  async ignoreInterestExpression(
    teamId: string,
    userId: string,
    teamName: string
  ) {
    try {
      logger.log('ADM-002: Declining interest expression', { teamId, userId });

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
          logger.warn('ADM-002: Decline status not permitted, deleting row', {
            teamId,
            userId,
            updateError,
          });

          const { error: deleteError } = await client
            .from('interest_expressions')
            .delete()
            .eq('team_id', teamId)
            .eq('user_id', userId)
            .eq('interest_status', 'pending');

          if (deleteError) {
            logger.error('ADM-002: Failed to delete interest expression', {
              deleteError,
              teamId,
              userId,
            });
            throw deleteError;
          }
        } else {
          logger.error('ADM-002: Error updating interest status', {
            updateError,
            teamId,
            userId,
          });
          throw updateError;
        }
      }

      // 2. Create notification for declined user
      const { error: notifError } = await client.from('notifications').insert({
        user_id: userId,
        notification_type: 'team_membership',
        title: 'Team Request Update',
        message: `Your request to join ${teamName} was not accepted`,
        data: { team_id: teamId, action: 'declined' },
      });

      if (notifError) {
        logger.warn('ADM-002: Notification skipped due to RLS', {
          notifError,
          teamId,
          userId,
        });
        // Non-critical, don't throw
      }

      logger.log('ADM-002: Interest declined successfully', { teamId, userId });

      return { success: true };
    } catch (error) {
      logger.error('ADM-002: Failed to decline interest expression', error);
      throw error;
    }
  },

  /**
   * Search for non-team members to invite
   * Excludes current team members from results
   */
  async searchNonMembers(teamId: string, query: string) {
    try {
      const trimmedQuery = query?.trim() ?? '';
      // Get current team member IDs to exclude
      const { data: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (membersError) {
        console.error('Error in search non member', membersError);
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
        logger.error('ADM-002: Error searching non-members', {
          error,
          teamId,
          query: trimmedQuery,
        });
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

      logger.log('ADM-002: Non-members search results', {
        teamId,
        query: trimmedQuery,
        resultCount: normalizedResults.length,
      });

      return normalizedResults;
    } catch (error) {
      logger.error('ADM-002: Failed to search non-members', error);
      throw error;
    }
  },

  /**
   * Invite a player to join the team
   * Creates an interest_expression with invited status
   */
  async invitePlayer(teamId: string, userId: string, teamName: string) {
    try {
      logger.log('ADM-002: Inviting player to team', { teamId, userId });

      const client = getSupabaseClient();
      // Check if invitation already exists
      const { data: existing } = await client
        .from('interest_expressions')
        .select('id, interest_status')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle() to handle no data

      if (existing) {
        logger.warn('ADM-002: Player already has interest expression', {
          teamId,
          userId,
          status: existing.interest_status,
        });
        return { success: false, reason: 'already_invited' };
      }

      // Create invitation
      const { error: insertError } = await client
        .from('interest_expressions')
        .insert({
          team_id: teamId,
          user_id: userId,
          interest_status: 'pending',
          expressed_at: new Date().toISOString(),
          message: ADMIN_INVITE_MARKER,
        });

      if (insertError) {
        logger.error('ADM-002: Error creating invitation', {
          insertError,
          teamId,
          userId,
        });
        throw insertError;
      }

      // Create notification for invited user
      const { error: notifError } = await client.from('notifications').insert({
        user_id: userId,
        notification_type: 'team_membership',
        title: 'Team Invitation',
        message: `You have been invited to join ${teamName}`,
        data: { team_id: teamId, action: 'invited' },
      });

      if (notifError) {
        logger.warn('ADM-002: Notification skipped due to RLS', {
          notifError,
          teamId,
          userId,
        });
        // Non-critical, don't throw
      }

      logger.log('ADM-002: Player invited successfully', { teamId, userId });

      return { success: true };
    } catch (error) {
      logger.error('ADM-002: Failed to invite player', error);
      throw error;
    }
  },

  // ADM-003: Manage Admins screen endpoints
  /**
   * Check if a user is a Super Admin for a team
   * Uses the is_primary field in team_admins table
   */
  async checkSuperAdmin(teamId: string, userId: string) {
    try {
      logger.log('ADM-003: Checking Super Admin status', { teamId, userId });

      const { data, error } = await supabase
        .from('team_admins')
        .select('is_primary')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        logger.log('ADM-003: User is not an admin', { teamId, userId });
        return false;
      }

      const isSuperAdmin = data.is_primary === true;

      logger.log('ADM-003: Super Admin status checked', {
        teamId,
        userId,
        isSuperAdmin,
      });

      return isSuperAdmin;
    } catch (error) {
      logger.error('ADM-003: Error checking Super Admin status', error);
      return false;
    }
  },

  /**
   * Search team members who are NOT admins
   * Excludes users who are already team admins
   */
  async searchNonAdminMembers(teamId: string, query: string) {
    try {
      logger.log('ADM-003: Searching non-admin members', { teamId, query });

      // First get all admin IDs to exclude
      const { data: admins } = await supabase
        .from('team_admins')
        .select('user_id')
        .eq('team_id', teamId);

      const adminIds = admins?.map(a => a.user_id) || [];

      // Now search team members excluding admins
      let searchQuery = supabase
        .from('team_members')
        .select(
          `
          user_id,
          role,
          user:profiles!team_members_user_id_fkey(
            id,
            first_name,
            last_name,
            email,
            profile_photo_uri,
            favorite_position
          )
        `
        )
        .eq('team_id', teamId);

      // Exclude admins if any exist
      if (adminIds.length > 0) {
        searchQuery = searchQuery.not(
          'user_id',
          'in',
          `(${adminIds.join(',')})`
        );
      }

      // Apply search filter if query provided
      if (query && query.trim()) {
        const searchTerm = `%${query}%`;
        // This is tricky with the join, might need to filter in memory
        const { data, error } = await searchQuery;

        if (error) throw error;

        // Filter results by search term in memory
        const filtered = data?.filter(member => {
          const user = member.user;
          if (!user) return false;

          const searchLower = query.toLowerCase();
          return (
            user.first_name?.toLowerCase().includes(searchLower) ||
            user.last_name?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower)
          );
        });

        logger.log('ADM-003: Non-admin member search results', {
          teamId,
          query,
          resultCount: filtered?.length || 0,
        });

        return filtered || [];
      } else {
        // No search query, return all non-admin members
        const { data, error } = await searchQuery;

        if (error) {
          logger.error('ADM-003: Error searching non-admin members', {
            error,
            teamId,
          });
          throw error;
        }

        logger.log('ADM-003: Non-admin members fetched', {
          teamId,
          memberCount: data?.length || 0,
        });

        return data || [];
      }
    } catch (error) {
      logger.error('ADM-003: Failed to search non-admin members', error);
      throw error;
    }
  },

  /**
   * Enhanced promote to admin with notifications
   * Wrapper around existing addTeamAdmin
   */
  async promoteToAdmin(
    teamId: string,
    userId: string,
    teamName: string,
    role: string = 'Admin'
  ) {
    try {
      logger.log('ADM-003: Promoting member to admin', {
        teamId,
        userId,
        role,
      });

      const client = getSupabaseClient();
      // First verify user is a team member
      const { data: member } = await client
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle() to handle no data

      if (!member) {
        throw new Error('User is not a team member');
      }

      // Check if already admin
      const { data: existingAdmin } = await client
        .from('team_admins')
        .select('user_id')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle() to handle no data

      if (existingAdmin) {
        logger.warn('ADM-003: User already admin', {
          teamId,
          userId,
        });
        return { success: false, reason: 'already_admin' };
      }

      // Add as admin
      const { error: adminError } = await client.from('team_admins').insert({
        team_id: teamId,
        user_id: userId,
        role,
        is_primary: false,
        created_at: new Date().toISOString(),
      });

      if (adminError) {
        logger.error('ADM-003: Error adding team admin', {
          adminError,
          teamId,
          userId,
        });
        throw adminError;
      }

      // Create notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          notification_type: 'admin_change',
          title: 'Admin Promotion',
          message: `You have been promoted to admin for ${teamName}`,
          data: { team_id: teamId, action: 'promoted' },
        });

      if (notifError) {
        logger.error('ADM-003: Error creating notification', { notifError });
        // Non-critical, don't throw
      }

      logger.log('ADM-003: Member promoted to admin successfully', {
        teamId,
        userId,
        role,
      });

      return { success: true };
    } catch (error) {
      logger.error('ADM-003: Failed to promote to admin', error);
      throw error;
    }
  },

  /**
   * Enhanced remove admin with notifications
   */
  async removeTeamAdminWithNotification(
    teamId: string,
    userId: string,
    teamName: string
  ) {
    try {
      logger.log('ADM-003: Removing team admin', { teamId, userId });

      const client = getSupabaseClient();
      // First remove from team_admins
      const { error: removeError } = await client
        .from('team_admins')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (removeError) {
        logger.error('ADM-003: Error removing admin', {
          removeError,
          teamId,
          userId,
        });
        throw removeError;
      }

      // Create notification
      const { error: notifError } = await client.from('notifications').insert({
        user_id: userId,
        notification_type: 'admin_change',
        title: 'Admin Role Removed',
        message: `You have been removed as admin from ${teamName}`,
        data: { team_id: teamId, action: 'removed' },
      });

      if (notifError) {
        logger.error('ADM-003: Error creating notification', { notifError });
        // Non-critical, don't throw
      }

      logger.log('ADM-003: Admin removed successfully', {
        teamId,
        userId,
      });

      return { success: true };
    } catch (error) {
      logger.error('ADM-003: Failed to remove admin', error);
      throw error;
    }
  },
};
