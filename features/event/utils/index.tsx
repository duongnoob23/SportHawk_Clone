import { InvitationStatus } from '@top/features/teams/constants';
import { RSVPResponseType } from '@top/features/teams/types';
import {
  EVENT_TYPE,
  INVITATION_STATUS,
  RSVP_RESPONSE,
} from '../constants/eventResponse';
import {
  EventDetailData,
  EventInvitation,
  EventNotes,
  EventSquad,
  RSVPCounts,
  UserEvent,
} from '../types';
type InvitationStatusType = 'accepted' | 'declined' | 'maybe' | 'pending';
function mapInvitationStatusToRsvp(status: InvitationStatusType) {
  switch (status) {
    case INVITATION_STATUS.ACCEPTED:
      return RSVP_RESPONSE.YES;
    case INVITATION_STATUS.DECLINED:
      return RSVP_RESPONSE.NO;
    case INVITATION_STATUS.MAYBE:
      return RSVP_RESPONSE.MAYBE;
    default:
      return RSVP_RESPONSE.PENDING;
  }
}

export const countInvitationStatus = (eventData: any): RSVPCounts => {
  const counts: RSVPCounts = {
    yes: 0,
    no: 0,
    maybe: 0,
    none: 0,
    total: 0,
    pending: 0,
  };

  if (!eventData?.event_invitations) return counts;

  for (const invite of eventData.event_invitations) {
    const mapped = mapInvitationStatusToRsvp(invite.invitationStatus);
    if (mapped === RSVP_RESPONSE.YES) counts.yes++;
    else if (mapped === RSVP_RESPONSE.NO) counts.no++;
    else if (mapped === RSVP_RESPONSE.MAYBE) counts.maybe++;
    else counts.none++;
  }

  counts.total = eventData.event_invitations.length;

  return counts;
};

export const checkInvitationsStatus = (
  event_squads: EventSquad[],
  userId: string
) => {
  if (event_squads.length == 0) {
    return 0;
  } else {
    if (event_squads.find(item => item.userId === userId)) {
      return 2;
    } else {
      return 1;
    }
  }
};

export const userInvitationStatus = (
  detailDataFix: EventDetailData,
  userId: string | undefined
): EventInvitation => {
  const result = detailDataFix.event_invitations.find(
    item => item.userId === userId
  );
  return result!;
};

export function parseAnswerBy(raw?: string): string | null {
  if (!raw) return null;

  const [datePart, timePart] = raw.split(' ');
  if (!datePart || !timePart) return null;

  const [day, month, year] = datePart.split('/');
  return new Date(`${year}-${month}-${day}T${timePart}:00`).toISOString();
}

export const formatDateToYMD = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTimeToHMS = (time: string | Date): string => {
  const d = new Date(time);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export const mapRsvpToInvitationStatus = (
  response?: RSVPResponseType
): InvitationStatus => {
  switch (response) {
    case RSVP_RESPONSE.YES:
      return InvitationStatus.Accepted;
    case RSVP_RESPONSE.MAYBE:
      return InvitationStatus.Maybe;
    case RSVP_RESPONSE.NO:
      return InvitationStatus.Declined;
    default:
      return InvitationStatus.Pending;
  }
};

export function parseEventNotes(notes: string | null | undefined): EventNotes {
  if (!notes) return {};

  const lines = notes.split('\n');
  const result: EventNotes = {};

  lines.forEach(line => {
    if (line.startsWith('Kit Color:')) {
      result.kitColor = line.replace('Kit Color:', '').trim();
    }
    if (line.startsWith('Meet:')) {
      result.meetTime = line.replace('Meet:', '').trim();
    }
    if (line.startsWith('Answer by:')) {
      result.answerBy = line.replace('Answer by:', '').trim();
    }
  });

  return result;
}

export function getEventTitle(event?: EventDetailData) {
  if (event) {
    switch (event.eventType) {
      case EVENT_TYPE.HOME_MATCH:
      case EVENT_TYPE.AWAY_MATCH:
        return `${event.teams.name} vs ${event.opponent}`;
      case EVENT_TYPE.TRAINING:
        return 'Training';
      default:
        return event.title;
    }
  }
}
// export function getEventEditTitle(event?: EditEventType) {
//   if (event) {
//     switch (event.eventType) {
//       case EVENT_TYPE.HOME_MATCH:
//       case EVENT_TYPE.AWAY_MATCH:
//         return `${event.teams.name} vs ${event.opponent}`;
//       case EVENT_TYPE.TRAINING:
//         return 'Training';
//       default:
//         return event.title;
//     }
//   }
// }

export type FormattedInvitationType = {
  id: string;
  event_id: string;
  user_id: string;
  invited_by: string;
  invited_at: string;
  invitation_status: string;
  event: {
    id: string;
    notes?: string | null;
    teams?: {
      id: string;
      name: string;
      sport: string;
      team_photo_url?: string | null;
    };
    title: string;
    team_id: string;
    end_time?: string | null;
    opponent?: string | null;
    created_by?: string | null;
    event_date: string;
    event_type: string;
    start_time?: string | null;
    description?: string | null;
    event_status: string;
    is_home_event?: boolean | null;
    location_name?: string | null;
    location_address?: string | null;
  };
  hasSquad: boolean;
};

export function formatEventInvitation(
  detailDataFix: EventDetailData
): UserEvent {
  return {
    id: '', // string
    event_id: detailDataFix.id, // string
    user_id: '', // string
    role: null, // vì type có role?: string | null
    rsvp_response: null, // type có rsvp_response?: string | null
    rsvp_at: null, // type có rsvp_at?: string | null

    event: {
      id: detailDataFix.id, // string
      team_id: detailDataFix.teamId, // string
      title: detailDataFix.title, // string
      event_type: detailDataFix.eventType, // string
      created_by: detailDataFix.createdBy,
      event_date: detailDataFix.eventDate, // string
      start_time: detailDataFix.startTime ?? '', // string
      end_time: detailDataFix.endTime ?? null, // string | null
      location_name: detailDataFix.locationName ?? null, // string | null
      opponent: detailDataFix.opponent ?? null, // string | null
      is_home_event: detailDataFix.isHomeEvent ?? null, // boolean | null
      notes: detailDataFix.notes ?? null, // string | null
      event_status: detailDataFix.eventStatus ?? null, // string | null

      teams: detailDataFix.teams
        ? {
            id: detailDataFix.teams.id ?? null,
            name: detailDataFix.teams.name ?? null,
            sport: detailDataFix.teams.sport ?? null,
            team_photo_url: detailDataFix.teams.teamPhotoUrl ?? null,
          }
        : null, // vì type định nghĩa teams: {...} | null
    },
  };
}
