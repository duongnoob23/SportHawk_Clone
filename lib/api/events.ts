import { RSVPResponseType } from '@top/features/teams/types';
import {
  EventAttendance,
  EventLocation,
  InvitationResponder,
  RSVPCounts,
} from './../../features/event/types/index';
import { InvitationStatus } from './../../features/teams/constants/index';
// Events API - Centralized event management functions
// All database operations for events and participants
import { supabase } from '@lib/supabase';
import { logger } from '@lib/utils/logger';
import {
  EVENT_STATUS_FILTER,
  INVITATION_STATUS,
  RSVP_RESPONSE,
} from '@top/features/event/constants/eventResponse';
import {
  getDateRangeFromFilter,
  TimeFilterType,
} from '@top/hooks/useTimeFilter';

export type EventParticipantRow = {
  id: string;
  event_id: string;
  user_id: string;
  role: string | null;
  attendance_status: string | null;
  rsvp_response: RSVPResponseType;
  rsvp_at: string | null;
  invited_at: string | null;
  invited_by: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ParticipantProfile = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  profile_photo_uri?: string | null;
  // thêm trường khác bạn có trong bảng profiles nếu cần
};

export type ParticipantEvent = {
  id: string;
  team_id: string;
  title: string;
  event_type: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location_name: string | null;
  location_address: string | null;
  opponent: string | null;
  is_home_event: boolean | null;
  notes: string | null;
  event_status: string | null;
  // teams join nếu cần mở rộng
};

export type ParticipantWithExtras = EventParticipantRow & {
  profile?: ParticipantProfile | null;
  event?: ParticipantEvent | null;
};

// Types matching database schema
export interface Event {
  id: string;
  team_id: string;
  created_by: string;
  title: string;
  event_type: string;
  description?: string | null;
  event_date: string;
  start_time: string;
  end_time?: string | null;
  location?: string | null;
  location_name?: string | null;
  location_address?: string | null;
  opponent?: string | null;
  is_home_event?: boolean | null;
  notes?: string | null;
  event_status?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  role?: string | null;
  attendance_status?: string | null;
  rsvp_response?: string | null;
  rsvp_at?: string | null;
  invited_at?: string | null;
  invited_by?: string | null;
  notes?: string | null;
}

// Team member and admin types moved to teams.ts where they belong

export interface CreateEventData {
  team_id: string;
  title: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time?: string | null;
  location?: string | null;
  location_name?: string | null;
  location_address?: string | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
  description?: string | null;
  opponent?: string | null;
  is_home_event?: boolean | null;
  notes?: string | null;
  answer_by?: string | null;
  selected_members?: string[];
  selected_leaders?: string[];
  pre_match_message?: string | null;
  event_status?: string | null;
}

// Create a new event with participants
export async function createEvent(
  data: CreateEventData,
  userId: string
): Promise<Event> {
  try {
    logger.log('Events API: Creating event', {
      team_id: data.team_id,
      title: data.title,
      status: data.event_status,
      type: data.event_type,
    });

    // Start a transaction by creating the event first
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert({
        team_id: data.team_id,
        created_by: userId,
        title: data.title,
        event_type: data.event_type,
        event_date: data.event_date,
        start_time: data.start_time,
        end_time: data.end_time,
        // location: data.location,
        location_name: data.location_name,
        description: data.description,
        opponent: data.opponent,
        is_home_event: data.is_home_event,
        notes: data.notes,
        event_status: data.event_status,
      })
      .select()
      .single();

    if (eventError) {
      logger.error('Events API: Error creating event', eventError);
      throw eventError;
    }

    // Add participants if provided
    if (data.selected_members && data.selected_members.length > 0) {
      const participants = data.selected_members.map(member_id => ({
        event_id: eventData.id,
        user_id: member_id,
        role: 'player',
        invited_by: userId,
        invited_at: new Date().toISOString(),
        notes: data.pre_match_message || null,
      }));

      const { error: participantsError } = await supabase
        .from('event_participants')
        .insert(participants);

      if (participantsError) {
        logger.error(
          'Events API: Error adding participants',
          participantsError
        );
        // Note: Event is created but participants failed - consider cleanup
      }

      // Also insert event invitations for selected members
      const invitations = data.selected_members.map(member_id => ({
        event_id: eventData.id,
        user_id: member_id,
        invited_by: userId,
        invited_at: new Date().toISOString(),
        invitation_status: 'pending',
      }));

      const { error: invitationsError } = await supabase
        .from('event_invitations')
        .insert(invitations);

      if (invitationsError) {
        logger.error(
          'Events API: Error adding event invitations',
          invitationsError
        );
      }
    }

    // Add leaders if provided
    if (data.selected_leaders && data.selected_leaders.length > 0) {
      const leaders = data.selected_leaders.map(leader_id => ({
        event_id: eventData.id,
        user_id: leader_id,
        role: 'coach',
        invited_by: userId,
        invited_at: new Date().toISOString(),
      }));

      const { error: leadersError } = await supabase
        .from('event_participants')
        .insert(leaders);

      if (leadersError) {
        logger.error('Events API: Error adding leaders', leadersError);
      }

      // Also insert event invitations for selected leaders
      const leaderInvitations = data.selected_leaders.map(leader_id => ({
        event_id: eventData.id,
        user_id: leader_id,
        invited_by: userId,
        invited_at: new Date().toISOString(),
        invitation_status: 'pending',
      }));

      const { error: leaderInvitationsError } = await supabase
        .from('event_invitations')
        .insert(leaderInvitations);

      if (leaderInvitationsError) {
        logger.error(
          'Events API: Error adding leader invitations',
          leaderInvitationsError
        );
      }
    }

    logger.log('Events API: Event created successfully', {
      event_id: eventData.id,
    });
    return eventData;
  } catch (error) {
    logger.error('Events API: Failed to create event', error);
    throw error;
  }
}

// Team member functions moved to teams.ts where they belong

// Team admin functions moved to teams.ts where they belong

// Get events for a team
export async function getTeamEvents(
  teamId: string,
  timeFilter?: TimeFilterType
): Promise<Event[]> {
  try {
    logger.log('Events API: Fetching team events', {
      team_id: teamId,
      timeFilter: timeFilter,
    });

    let query = supabase
      .from('events')
      .select('*')
      .eq('team_id', teamId)
      .order('event_date', { ascending: true })
      .order('start_time', { ascending: true });

    const dateRange = getDateRangeFromFilter(timeFilter);
    if (dateRange) {
      if (dateRange.startDate) {
        query = query.gte('event_date', dateRange.startDate.toISOString());
      }
      if (dateRange.endDate) {
        query = query.lte('event_date', dateRange.endDate.toISOString());
      }
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Events API: Error fetching events', error);
      throw error;
    }

    logger.log('Events API: Events fetched', { count: data?.length || 0 });
    return data || [];
  } catch (error) {
    logger.error('Events API: Failed to fetch events', error);
    throw error;
  }
}

// Get event participants
export async function getEventParticipants(
  eventId: string
): Promise<EventParticipant[]> {
  try {
    logger.log('Events API: Fetching event participants', {
      event_id: eventId,
    });

    const { data, error } = await supabase
      .from('event_participants')
      .select(
        `
        *,
        profile:profiles (
          first_name,
          last_name,
          profile_photo_uri
        )
      `
      )
      .eq('event_id', eventId);

    if (error) {
      logger.error('Events API: Error fetching participants', error);
      throw error;
    }

    logger.log('Events API: Participants fetched', {
      count: data?.length || 0,
    });
    return data || [];
  } catch (error) {
    logger.error('Events API: Failed to fetch participants', error);
    throw error;
  }
}

// Update event
export async function updateEvent(
  eventId: string,
  updates: Partial<Event>
): Promise<Event> {
  try {
    logger.log('Events API: Updating event', { event_id: eventId });

    const { data, error } = await supabase
      .from('events')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      logger.error('Events API: Error updating event', error);
      throw error;
    }

    logger.log('Events API: Event updated successfully');
    return data;
  } catch (error) {
    logger.error('Events API: Failed to update event', error);
    throw error;
  }
}

// Cancel event
export async function cancelEvent(
  eventId: string,
  userId: string,
  reason?: string
): Promise<void> {
  try {
    logger.log('Events API: Cancelling event', { event_id: eventId });

    const { error } = await supabase
      .from('events')
      .update({
        event_status: EVENT_STATUS_FILTER.CANCELLED,
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
        cancelled_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (error) {
      logger.error('Events API: Error cancelling event', error);
      throw error;
    }

    logger.log('Events API: Event cancelled successfully');
  } catch (error) {
    logger.error('Events API: Failed to cancel event', error);
    throw error;
  }
}

function mapRsvpToInvitationStatus(
  response: RSVPResponseType
): InvitationStatus {
  switch (response) {
    case RSVP_RESPONSE.YES:
      return INVITATION_STATUS.ACCEPTED;
    case RSVP_RESPONSE.MAYBE:
      return INVITATION_STATUS.MAYBE;
    case RSVP_RESPONSE.NO:
      return INVITATION_STATUS.DECLINED;
    default:
      return INVITATION_STATUS.PENDING;
  }
}

export async function updateInvitationStatus3(
  id: string,
  eventId: string,
  userId: string,
  response: RSVPResponseType
): Promise<void> {
  const status = mapRsvpToInvitationStatus(response);

  const { data, error } = await supabase
    .from('event_participants')
    .update({
      attendance_status: status,
    })
    .eq('id', id)
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('Update error:', error);
    throw error;
  }
}

export async function getUserEvents(
  teamId?: string,
  userId?: string,
  filter?: TimeFilterType
) {
  try {
    logger.log('Events API: Fetching user events', {
      user_id: userId,
      team_id: teamId,
      filter,
    });

    let query = supabase
      .from('event_invitations')
      .select(
        `
        *,
        event:events!inner (
          id,
          team_id,
          title,
          event_type,
          description,
          event_date,
          start_time,
          end_time,
          location_name,
          location_address,
          opponent,
          is_home_event,
          notes,
          event_status,
          created_by,
          teams (
            id,
            name,
            sport,
            team_photo_url
          )
        )
      `
      )
      .eq('user_id', userId)
      .neq('event.event_status', EVENT_STATUS_FILTER.CANCELLED);

    if (teamId && teamId !== 'all') {
      query = query.eq('event.team_id', teamId);
    }

    const dateRange = getDateRangeFromFilter(filter);
    if (dateRange) {
      if (dateRange.startDate) {
        query = query.gte(
          'event.event_date',
          dateRange.startDate.toISOString()
        );
      }
      if (dateRange.endDate) {
        query = query.lte('event.event_date', dateRange.endDate.toISOString());
      }
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Events API: Error fetching user events', error);
      throw error;
    }

    const eventIds = data?.map(e => e.event_id) || [];
    const { data: eventSquads } = await supabase
      .from('event_squads')
      .select('event_id')
      .in('event_id', eventIds);

    if (data) {
      data.sort((a: any, b: any) => {
        const dateCompare = a.event.event_date.localeCompare(
          b.event.event_date
        );
        if (dateCompare !== 0) return dateCompare;
        return a.event.start_time.localeCompare(b.event.start_time);
      });
    }

    const mergedData =
      data?.map(item => ({
        ...item,
        hasSquad: eventSquads?.some(s => s.event_id === item.event_id) ?? false,
      })) || [];

    logger.log('Events API: User events fetched', {
      count: mergedData.length,
    });

    return mergedData;
  } catch (error) {
    logger.error('Events API: Failed to fetch user events', error);
    throw error;
  }
}

export async function getEventParticipantsWithJoins(
  eventId: string
): Promise<ParticipantWithExtras[]> {
  // participants
  const participants = await getEventParticipantsRaw(eventId);

  if (participants.length === 0) return [];

  // profiles
  const userIds = Array.from(new Set(participants.map(p => p.user_id))).filter(
    Boolean
  );
  let profileMap = new Map<string, ParticipantProfile>();
  if (userIds.length > 0) {
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, profile_photo_uri')
      .in('id', userIds);

    if (pErr) {
      logger.error('getEventParticipantsWithJoins profiles error', pErr);
    } else {
      profileMap = new Map(
        (profiles || []).map(p => [p.id, p as ParticipantProfile])
      );
    }
  }

  // event (1 id)
  let eventData: ParticipantEvent | null = null;
  {
    const { data: events, error: eErr } = await supabase
      .from('events')
      .select(
        `
        id, team_id, title, event_type, description, event_date,
        start_time, end_time, location_name, location_address,
        opponent, is_home_event, notes, event_status
      `
      )
      .eq('id', eventId)
      .limit(1);

    if (eErr) {
      logger.error('getEventParticipantsWithJoins event error', eErr);
    } else {
      eventData = (events?.[0] as ParticipantEvent) || null;
    }
  }

  // merge
  const merged: ParticipantWithExtras[] = participants.map(p => ({
    ...p,
    profile: profileMap.get(p.user_id) || null,
    event: eventData,
  }));

  return merged;
}

export async function getEventParticipantsRaw(
  eventId: string
): Promise<EventParticipantRow[]> {
  const { data, error } = await supabase
    .from('event_participants')
    .select('*')
    .eq('event_id', eventId);

  if (error) {
    logger.error('getEventParticipantsRaw error', error);
    throw error;
  }
  return data || [];
}

export async function debugEventParticipantsSchema(eventId: string) {
  const { data, error } = await supabase
    .from('event_invitations')
    .select('*')
    .eq('event_id', eventId);

  if (error) {
    logger.error('Schema debug error:', error);
    return null;
  }

  logger.log(
    'event_participants actual columns:',
    data?.[0] ? Object.keys(data[0]) : []
  );
  return data?.[0];
}

export async function getEventResponses3(eventId: string): Promise<{
  counts: RSVPCounts;
  responders: EventAttendance[];
  eventLocation: EventLocation | undefined;
}> {
  try {
    logger.log('Events API: Fetching event responses', { eventId });

    // Thay đổi từ event_participants sang event_invitations
    const { data: participants, error } = await supabase
      .from('event_participants')
      .select(
        `
        id,
        event_id,
        user_id,
        role,
        attendance_status,
        rsvp_response,
        rsvp_at,
        invited_at,
        invited_by,
        notes
      `
      )
      .eq('event_id', eventId);

    if (error) {
      logger.error('Events API: Error fetching invitations', error);
      throw error;
    }

    // Lấy event location như cũ
    const { data: eventData } = await supabase
      .from('events')
      .select(
        'location_latitude, location_longitude, location_address, location_name'
      )
      .eq('id', eventId)
      .single();

    const eventLocation: EventLocation | undefined = eventData
      ? {
          latitude: eventData.location_latitude,
          longitude: eventData.location_longitude,
          address: eventData.location_address,
          name: eventData.location_name,
        }
      : undefined;

    // Lấy user_ids để query profiles
    const userIds = Array.from(
      new Set(participants.map(inv => inv.user_id))
    ).filter(Boolean);

    let profileMap = new Map();
    if (userIds.length > 0) {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select(
          'id, first_name, last_name, profile_photo_uri, date_of_birth, team_sort, is_sporthawk_admin'
        )
        .in('id', userIds);

      if (pErr) {
        logger.error('Events API: Error fetching profiles', pErr);
      } else {
        profileMap = new Map((profiles || []).map(p => [p.id, p]));
      }
    }

    // Map data với profiles - Cấu trúc mới cho event_invitations
    const responders: EventAttendance[] = (participants ?? []).map(p => ({
      id: p.id,
      user_id: p.user_id,
      event_id: p.event_id,
      role: p.role,
      attendance_status: p.attendance_status,
      rsvp_response: p.rsvp_response,
      rsvp_at: p.rsvp_at,
      invited_at: p.invited_at,
      invited_by: p.invited_by,
      notes: p.notes,
      profile: profileMap.get(p.user_id) || null,
    }));

    // Tính counts dựa trên invitation_status
    const counts: RSVPCounts = responders.reduce(
      (acc, r) => {
        if (r.attendance_status === 'attending') acc.yes += 1;
        else if (r.attendance_status === 'not_attending') acc.no += 1;
        else if (r.attendance_status === 'invited') acc.maybe += 1;
        else acc.none += 1;
        acc.total += 1;
        return acc;
      },
      { yes: 0, no: 0, maybe: 0, none: 0, total: 0 } as RSVPCounts
    );

    logger.log('Events API: Event responses fetched', {
      eventId,
      invitationCount: responders.length,
      counts,
    });

    return { counts, responders, eventLocation };
  } catch (e) {
    logger.error('Events API: Failed to fetch event responses', e);
    throw e;
  }
}

export async function getEventDetails(eventId: string): Promise<{
  counts: RSVPCounts;
  responders: InvitationResponder[];
  eventLocation: EventLocation | undefined;
}> {
  try {
    logger.log('Events API: Fetching event responses', { eventId });

    // Thay đổi từ event_participants sang event_invitations
    const { data: invitations, error } = await supabase
      .from('event_invitations')
      .select(
        `
        id,
        event_id,
        user_id,
        invitation_status,
        invited_at,
        invited_by
      `
      )
      .eq('event_id', eventId);

    if (error) {
      logger.error('Events API: Error fetching invitations', error);
      throw error;
    }

    // Lấy event location như cũ
    const { data: eventData } = await supabase
      .from('events')
      .select(
        'location_latitude, location_longitude, location_address, location_name'
      )
      .eq('id', eventId)
      .single();

    const eventLocation: EventLocation | undefined = eventData
      ? {
          latitude: eventData.location_latitude,
          longitude: eventData.location_longitude,
          address: eventData.location_address,
          name: eventData.location_name,
        }
      : undefined;

    // Lấy user_ids để query profiles
    const userIds = Array.from(
      new Set(invitations.map(inv => inv.user_id))
    ).filter(Boolean);

    let profileMap = new Map();
    if (userIds.length > 0) {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select(
          'id, first_name, last_name, profile_photo_uri, date_of_birth, team_sort, is_sporthawk_admin'
        )
        .in('id', userIds);

      if (pErr) {
        logger.error('Events API: Error fetching profiles', pErr);
      } else {
        profileMap = new Map((profiles || []).map(p => [p.id, p]));
      }
    }

    // Map data với profiles - Cấu trúc mới cho event_invitations
    const responders: InvitationResponder[] = (invitations ?? []).map(inv => ({
      id: inv.id,
      user_id: inv.user_id,
      invitation_status: inv.invitation_status,
      invited_at: inv.invited_at,
      invited_by: inv.invited_by,
      profile: profileMap.get(inv.user_id) || null,
    }));

    // Tính counts dựa trên invitation_status
    const counts: RSVPCounts = responders.reduce(
      (acc, r) => {
        if (r.invitation_status === 'attending') acc.yes += 1;
        else if (r.invitation_status === 'not_attending') acc.no += 1;
        else if (r.invitation_status === 'maybe') acc.maybe += 1;
        else acc.none += 1;
        acc.total += 1;
        return acc;
      },
      { yes: 0, no: 0, maybe: 0, none: 0, total: 0 } as RSVPCounts
    );

    logger.log('Events API: Event responses fetched', {
      eventId,
      invitationCount: responders.length,
      counts,
    });

    return { counts, responders, eventLocation };
  } catch (e) {
    logger.error('Events API: Failed to fetch event responses', e);
    throw e;
  }
}
