import { supabase } from '@lib/supabase';
import { logger } from '@lib/utils/logger';
import { CreateEventData } from '@top/lib/api/events';
import { EVENT_STATUS_FILTER } from '../constants/eventResponse';
import { EVENT_DETAIL_QUERY } from '../queries/eventDetailQuery';
import type {
  EditEventType,
  EventDetailData,
  EventInvitation,
  EventSquad,
  EventSquadsSelectData,
  InvitationInput,
  LeaderData1,
  MemberData1,
} from '../types';
import {
  DeleteAllEventSquadType,
  DeleteEventData,
  EventDetailType,
  EventInvitationsStatusType,
  EventSquadData,
  TeamMembersSimpleData,
  UpdateEventByIdType,
  UpdateEventInvitationHandGesturesType,
  UpdateEventInvitationHandGestureType,
  UpsertEventsquadType,
} from '../types/event';
import {
  formatDateToYMD,
  formatTimeToHMS,
  mapRsvpToInvitationStatus,
} from '../utils';

// ✅
export async function createEvent(data: CreateEventData, userId: string) {
  try {
    logger.log('Events API: Creating event', {
      team_id: data.team_id,
      title: data.title,
      status: data.event_status,
      type: data.event_type,
    });

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
        location_address: data.location_address,
        location_latitude: data.location_latitude,
        location_longitude: data.location_longitude,
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
      }

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
    return eventData.id;
  } catch (error) {
    logger.error('Events API: Failed to create event', error);
    throw error;
  }
}

// ✅
export const getEventDetail = async (
  payload: EventDetailType
): Promise<EventDetailData> => {
  const { eventId, userId, teamId } = payload;
  try {
    const { data: detailData, error } = await supabase
      .from('events')
      .select(EVENT_DETAIL_QUERY)
      .eq('id', eventId)
      .single()
      .overrideTypes<EventDetailData>();

    if (error) {
      console.error('JOIN ERROR:', error);
      throw error;
    }

    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId)
      .eq('member_status', 'active');
    const { data: teamLeaders, error: leaderError } = await supabase
      .from('team_admins')
      .select('user_id')
      .eq('team_id', teamId);

    if (teamError) {
      console.error('TEAM MEMBERS ERROR:', teamError);
      throw teamError;
    }
    if (leaderError) {
      console.error('TEAM LEADERS ERROR:', leaderError);
      throw leaderError;
    }
    const validUserIds = teamMembers?.map(m => m.user_id) ?? [];
    const validAdminIds = teamLeaders?.map(m => m.user_id) ?? [];

    if (detailData?.event_invitations?.length) {
      detailData.event_invitations = detailData.event_invitations.filter(
        inv =>
          validUserIds.includes(inv.userId) ||
          validAdminIds.includes(inv.userId)
      );
    }
    return detailData;
  } catch (error) {
    console.error('error in getEventDetail', error);
    throw error;
  }
};

// ✅
export const getEventSquad = async (payload: EventSquadData) => {
  try {
    const { eventId } = payload;
    const { data, error } = await supabase
      .from('event_squads')
      .select(
        `
        id,
        userId:user_id,
        position,
        squadRole:squad_role,
        selectionNotes:selection_notes
      `
      )
      .eq('event_id', eventId);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get squad members:', error);
    throw error;
  }
};

// ✅
export const updateEventById = async (
  payloadData: UpdateEventByIdType
): Promise<any> => {
  const { adminId, eventId, formData, addArray, removeArray } = payloadData;
  if (!eventId) throw new Error('eventId is required');
  const notesParts: string[] = [];
  if (formData.kitColor) notesParts.push(`Kit Color: ${formData.kitColor}`);
  if (formData.meetTime)
    notesParts.push(
      `Meet: ${new Date(formData.meetTime).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    );

  if (formData.answerBy)
    notesParts.push(
      `Answer by: ${new Date(formData.answerBy).toLocaleDateString('en-GB')} ${new Date(
        formData.answerBy
      ).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
    );
  if (formData.preMatchMessage)
    notesParts.push(`Message: ${formData.preMatchMessage}`);

  let title = '';
  if (
    formData.eventType === 'home_match' ||
    formData.eventType === 'away_match'
  ) {
    title =
      formData.awayTeamName && formData.homeTeamName
        ? `${formData.homeTeamName} vs ${formData.awayTeamName}`
        : formData.homeTeamName || formData.awayTeamName || 'Match';
  } else if (formData.eventType === 'training') {
    title = 'Training';
  } else if (formData.eventType === 'other') {
    title = formData.eventTitle || 'Event';
  }

  const payload: Record<string, any> = {
    event_type: formData.eventType || null,
    title: title || null,
    description: formData.description || null,
    location_name: formData.location || null,
    location_address: formData.locationAddress || null,
    location_latitude: formData.locationLatitude || null,
    location_longitude: formData.locationLongitude || null,
    event_date: formData.eventDate ? formatDateToYMD(formData.eventDate) : null,
    start_time: formData.startTime ? formatTimeToHMS(formData.startTime) : null,
    end_time: formData.endTime ? formatTimeToHMS(formData.endTime) : null,
    opponent: formData.awayTeamName || null,
    team_id: formData.teamId || null,
    notes: notesParts.length > 0 ? notesParts.join('\n') : null,
    updated_at: new Date().toISOString(),
  };

  Object.keys(payload).forEach(key => {
    if (payload[key] === null || payload[key] === undefined) {
      delete payload[key];
    }
  });

  const { data, error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', eventId)
    .select()
    .single();

  const status = 'pending';

  const { data: invitationUpdate, error: updateError } = await supabase
    .from('event_invitations')
    .update({ invitation_status: status })
    .eq('event_id', eventId);

  const invitedAt = new Date().toISOString();

  const insertPayload = addArray.map(userId => ({
    event_id: eventId,
    user_id: userId,
    invited_by: adminId,
    invited_at: invitedAt,
    invitation_status: status,
  }));

  const { data: invitationInsert, error: insertError } = await supabase
    .from('event_invitations')
    .insert(insertPayload);

  const { data: invitationDelete, error: deleteError } = await supabase
    .from('event_invitations')
    .delete()
    .in('user_id', removeArray)
    .eq('event_id', eventId);

  if (insertError) {
    logger.error('❌ Insert invitations error:', insertError);
    throw insertError;
  }

  if (deleteError) {
    logger.error('❌ Delete invitations error:', deleteError);
    throw deleteError;
  }

  if (error) {
    logger.error('❌ Update event error:', error);
    throw error;
  }

  if (updateError) {
    logger.error('❌ Update invitations error:', updateError);
    throw updateError;
  }

  if (error) {
    logger.error('❌ Update event error:', error);
    throw error;
  }

  return data;
};

// ✅
export const getTeamMembersSimple = async (
  payload: TeamMembersSimpleData
): Promise<{ memberData: MemberData1[]; userIds: string[] }> => {
  try {
    const { teamId, eventId } = payload;
    const { data: teamMemberData, error } = await supabase
      .from('team_members')
      .select(
        `
        id,
        teamId:team_id,
        userId:user_id,
        position,
        memberStatus:member_status,
        profiles:profiles!team_members_user_id_fkey1 (
          id,
          firstName:first_name,
          lastName:last_name,
          profilePhotoUri:profile_photo_uri
        )
      `
      )
      .eq('team_id', teamId)
      .eq('member_status', 'active')
      .overrideTypes<MemberData1[]>();

    const { data: userInInvitations } = await supabase
      .from('event_invitations')
      .select('*')
      .eq('event_id', eventId);

    const userIds = userInInvitations?.map(item => item.user_id) ?? [];
    if (error) throw error;

    const memberDataWithFlag = teamMemberData.map(member => ({
      ...member,
      isChoose: userIds.includes(member.userId),
    }));

    return { memberData: memberDataWithFlag, userIds };
  } catch (error) {
    logger.error('Error in getTeamMembersSimple:', error);
    throw error;
  }
};

// ✅
export const getTeamAdminsSimple = async (
  teamId: string,
  eventId: string
): Promise<{ leaderData: LeaderData1[]; userIds: string[] }> => {
  try {
    const { data: teamAdminData, error } = await supabase
      .from('team_admins')
      .select(
        `
        id,
        teamId:team_id,
        userId:user_id,
        role,
        title,
        isPrimary:is_primary,
        profiles:profiles!team_admins_user_id_fkey1 (
          id,
          firstName:first_name,
          lastName:last_name,
          profilePhotoUri:profile_photo_uri
        )
      `
      )
      .eq('team_id', teamId)
      .order('is_primary', { ascending: false })
      .overrideTypes<LeaderData1[]>();

    const { data: userInInvitations } = await supabase
      .from('event_invitations')
      .select('*')
      .eq('event_id', eventId);

    const userIds = userInInvitations?.map(item => item.user_id) ?? [];

    if (error) throw error;

    const leaderDataWithFlag = (teamAdminData ?? []).map(admin => ({
      ...admin,
      isChoose: userIds.includes(admin.userId),
    }));

    return {
      leaderData: leaderDataWithFlag,
      userIds,
    };
  } catch (error) {
    console.error('Error in getTeamAdminsSimple:', error);
    throw error;
  }
};

export const getTeamMembersWithTeamId = async (
  teamId: string
): Promise<{ memberData: MemberData1[]; userIds: string[] }> => {
  try {
    if (teamId === 'all') {
      return { memberData: [], userIds: [] };
    }
    const { data: teamMemberData, error } = await supabase
      .from('team_members')
      .select(
        `
        id,
        teamId:team_id,
        userId:user_id,
        position,
        memberStatus:member_status,
        profiles:profiles!team_members_user_id_fkey1 (
          id,
          firstName:first_name,
          lastName:last_name,
          profilePhotoUri:profile_photo_uri
        )
      `
      )
      .eq('team_id', teamId)
      .eq('member_status', 'active')
      .overrideTypes<MemberData1[]>();

    if (error) throw error;

    const memberDataWithFlag = (teamMemberData ?? []).map(member => ({
      ...member,
      isChoose: true,
    }));

    return { memberData: memberDataWithFlag, userIds: [] };
  } catch (error) {
    logger.error('Error in getTeamMembersWithTeamId:', error);
    throw error;
  }
};

export const getTeamLeadersWithTeamId = async (
  teamId: string
): Promise<{ leaderData: LeaderData1[]; userIds: string[] }> => {
  try {
    if (teamId === 'all') {
      return { leaderData: [], userIds: [] };
    }
    const { data: teamAdminData, error } = await supabase
      .from('team_admins')
      .select(
        `
        id,
        teamId:team_id,
        userId:user_id,
        role,
        title,
        isPrimary:is_primary,
        profiles:profiles!team_admins_user_id_fkey1 (
          id,
          firstName:first_name,
          lastName:last_name,
          profilePhotoUri:profile_photo_uri
        )
      `
      )
      .eq('team_id', teamId)
      .order('is_primary', { ascending: false })
      .overrideTypes<LeaderData1[]>();

    if (error) throw error;

    const leaderDataWithFlag = (teamAdminData ?? []).map(admin => ({
      ...admin,
      isChoose: true,
    }));

    return {
      leaderData: leaderDataWithFlag,
      userIds: [],
    };
  } catch (error) {
    console.error('Error in getTeamLeadersWithTeamId:', error);
    throw error;
  }
};

// ✅
export const upsertInvitations = async (input: InvitationInput) => {
  const {
    eventId,
    invitedMembers,
    invitedBy,
    addedMembers = [],
    removedMembers = [],
  } = input;

  if (removedMembers.length > 0) {
    const { error: deleteError } = await supabase
      .from('event_invitations')
      .delete()
      .eq('event_id', eventId)
      .in('user_id', removedMembers);

    if (deleteError) throw deleteError;
  }

  if (addedMembers.length > 0) {
    const invitations = addedMembers.map(userId => ({
      event_id: eventId,
      user_id: userId,
      invited_by: invitedBy,
      invitation_status: 'pending',
      invited_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('event_invitations')
      .insert(invitations);

    if (insertError) throw insertError;
  }

  return { success: true };
};

// ✅
export const getEventEdit = async (
  eventId: string
): Promise<{ editEventData: EditEventType }> => {
  try {
    const { data: editEventData, error } = await supabase
      .from('events')
      .select(
        `
        id,
        teamId:team_id,
        createdBy:created_by,
        title,
        eventType:event_type,
        description,
        eventDate:event_date,
        startTime:start_time,
        endTime:end_time,
        locationName:location_name,
        locationAddress:location_address,
        locationLatitude:location_latitude,
        locationLongitude:location_longitude,
        opponent,
        isHomeEvent:is_home_event,
        maxParticipants:max_participants,
        notes,
        eventStatus:event_status,
        cancelledReason:cancelled_reason,
        cancelledAt:cancelled_at,
        cancelledBy:cancelled_by,
        weatherConsideration:weather_consideration,
        createdAt:created_at,
        updatedAt:updated_at,
        feedbackRequested:feedback_requested,
        type,
        location,
        status
      `
      )
      .eq('id', eventId)
      .single()
      .overrideTypes<EditEventType>();

    if (error) throw error;
    if (!editEventData) throw new Error('Event not found');

    return {
      editEventData,
    };
  } catch (error) {
    console.error('❌ getEventEdit error:', error);
    throw error;
  }
};

// ✅
export const deleteEvent = async (payload: DeleteEventData) => {
  try {
    const status = EVENT_STATUS_FILTER.CANCELLED;
    const { data, error } = await supabase
      .from('events')
      .update({
        event_status: status,
        cancelled_reason: payload.reason || 'Cancel Event',
        cancelled_at: new Date().toISOString(),
        cancelled_by: payload.userId,
      })
      .eq('id', payload.eventId)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Event not found');

    return data;
  } catch (error) {
    console.error('❌ deleteEvent error:', error);
    throw error;
  }
};

// ✅
export const getUpdateEventInvitationHandGestures = async (
  payload: UpdateEventInvitationHandGesturesType
) => {
  try {
    const { eventId, userId, response, teamId, eventFilter } = payload;
    const status = mapRsvpToInvitationStatus(response);
    const { data: updateInvitationsData, error: updateInvitationsError } =
      await supabase
        .from('event_invitations')
        .update({
          invitation_status: status,
          invited_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .select('invitation_status');

    if (updateInvitationsError) {
      throw updateInvitationsError;
    }
    return updateInvitationsData;
  } catch (error) {
    console.error('error in updateHandGestrue', error);
    throw error;
  }
};

// ✅
export const getEventInvitationsStatus = async (
  payload: EventInvitationsStatusType
) => {
  try {
    const { userId, eventId } = payload;
    const { data: invitationsStatusData, error: invitationsStatusError } =
      await supabase
        .from('event_invitations')
        .select(
          `
          id,
          eventId:event_id,
          userId:user_id,
          invitedBy:invited_by,
          invitedAt:invited_at,
          invitationStatus:invitation_status
        `
        )
        .eq('user_id', userId)
        .eq('event_id', eventId)
        .maybeSingle();

    if (invitationsStatusError) {
      throw invitationsStatusError;
    }

    return invitationsStatusData;
  } catch (error) {
    console.error('error in getEventInvitationsStatus', error);
    throw error;
  }
};

// ✅

export const getEventSquadsSelect = async (
  eventId: string,
  userId: string
): Promise<EventSquadsSelectData> => {
  try {
    const { data: isSelectedData, error: isSelectedError } = await supabase
      .from('event_squads')
      .select(
        `
        id,
        userId:user_id,
        eventId:event_id,
        position,
        squadRole:squad_role,
        selectedAt:selected_at,
        selectedBy:selected_by,
        selectionNotes:selection_notes
      `
      )
      .eq('event_id', eventId)
      .overrideTypes<EventSquad[]>();

    if (isSelectedError) throw isSelectedError;

    const { data: isStatusData, error: isStatusError } = await supabase
      .from('event_invitations')
      .select(
        `
        id,
        eventId:event_id,
        userId:user_id,
        invitedBy:invited_by,
        invitedAt:invited_at,
        invitationStatus:invitation_status
      `
      )
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single()
      .overrideTypes<EventInvitation>();

    if (isStatusError) throw isStatusError;

    // đảm bảo trả object đúng shape
    return {
      eventSquads: isSelectedData ?? [],
      eventInvitations: isStatusData,
    };
  } catch (error) {
    console.error('❌ error in getEventSquadsSelect:', error);
    throw error;
  }
};

// ✅
export const getUpsertEventsquad = async (payload: UpsertEventsquadType) => {
  try {
    const {
      userId,
      teamId,
      eventId,
      preMatchMessage,
      selectedBy,
      addMember,
      removeMember,
    } = payload;
    if (!eventId) {
      throw new Error('eventId is required');
    }

    const { data: currentRecords, error: currentError } = await supabase
      .from('event_squads')
      .select('user_id')
      .eq('event_id', eventId);

    if (currentError) throw currentError;

    const currentIds = currentRecords?.map(r => r.user_id) || [];

    let removedCount = 0;
    if (removeMember && removeMember.length > 0) {
      const { error: deleteError, count } = await supabase
        .from('event_squads')
        .delete({ count: 'exact' })
        .eq('event_id', eventId)
        .in('user_id', removeMember);

      if (deleteError) throw deleteError;
      removedCount = count ?? 0;
    }

    let insertedData: any[] = [];
    let addedCount = 0;
    if (addMember && addMember.length > 0) {
      const newIds = addMember.filter(id => !currentIds.includes(id));
      if (newIds.length > 0) {
        const squadMembers = newIds.map(userId => ({
          event_id: eventId,
          user_id: userId,
          selected_by: selectedBy,
          selected_at: new Date().toISOString(),
          position: null,
          squad_role: null,
          selection_notes: preMatchMessage,
        }));

        const { data: newSquadMembers, error: insertError } = await supabase
          .from('event_squads')
          .insert(squadMembers)
          .select();

        if (insertError) throw insertError;
        insertedData = newSquadMembers;
        addedCount = newSquadMembers.length;
      }
    }

    const { data: finalRecords, error: finalError } = await supabase
      .from('event_squads')
      .select('id')
      .eq('event_id', eventId);

    if (finalError) throw finalError;

    const finalCount = finalRecords?.length || 0;

    const didUpdate = addedCount > 0 || removedCount > 0;

    return {
      success: didUpdate,
      updated: didUpdate ? 'changed' : 'no-change',
      updatedMembers: insertedData,
      totalCount: finalCount,
      previousCount: currentIds.length,
      removedCount,
      addedCount,
      message: didUpdate
        ? `✅ Updated squad: removed ${removedCount}, added ${addedCount}, total now ${finalCount}`
        : '⚪ No changes detected',
      eventId,
    };
  } catch (error) {
    console.error('Failed to upsert squad members:', error);
    throw error;
  }
};

export type Props = {
  eventId: string;
  userId: string;
};

// ✅
export const getUpdateEventInvitationHandGesture = async (
  payload: UpdateEventInvitationHandGestureType
): Promise<Props> => {
  const { id, eventId, userId, response } = payload;
  const status = mapRsvpToInvitationStatus(response);

  const { data, error } = await supabase
    .from('event_invitations')
    .update({ invitation_status: status })
    .match({ id: id })
    .select();

  if (error) {
    console.error('Update error:', error);
    throw error;
  }
  console.log('Update result:', data);
  return { eventId, userId };
};

// ✅
export const getDeleteAllEventSquad = async (
  payload: DeleteAllEventSquadType
) => {
  try {
    const { eventId, userId, teamId } = payload;
    if (!eventId) throw new Error('Missing eventId in getDeleteAllEventSquad');

    const { data, error } = await supabase
      .from('event_squads')
      .delete()
      .eq('event_id', eventId);

    if (error) {
      console.error('❌ Delete Eventsquad error:', error);
      throw error;
    }
    return { data, eventId };
  } catch (error) {
    console.error('❌ Delete Eventsquad error in try/catch:', error);
    throw error;
  }
};
