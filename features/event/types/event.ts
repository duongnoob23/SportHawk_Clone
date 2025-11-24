import { RSVPResponseType } from '@top/features/teams/types';
import { TimeFilterType } from '@top/hooks/useTimeFilter';
import { EventFormData } from '@top/stores/eventFormStore';

export interface DeleteEventData {
  eventId: string | undefined;
  reason: string;
  userId: string | undefined;
}

export interface EventDetailsData {
  eventId?: string;
  userId?: string;
  teamId?: string;
}

export interface EventInvitationData {
  eventId?: string;
  userId?: string;
}

export interface EventSquadData {
  eventId?: string;
}

export interface TeamMembersSimpleData {
  teamId?: string;
  eventId?: string;
}

export interface EventDetailType {
  eventId?: string;
  userId?: string;
  teamId?: string;
}

export interface EventInvitationsStatusType {
  userId?: string;
  eventId?: string;
}

export interface UpdateEventInvitationHandGestureType {
  id: string;
  userId: string;
  eventId: string;
  preResponse: InvitationStatusType;
  response: RSVPResponseType;
  teamId: string | undefined;
}

export interface UpdateEventByIdType {
  adminId: string;
  eventId?: string;
  formData: Partial<EventFormData>;
  teamId?: string;
  addArray: string[];
  removeArray: string[];
}

export interface UpsertEventsquadType {
  userId: string;
  teamId: string | undefined;
  eventId: string;
  selectedMembers: string[];
  preMatchMessage: string | null;
  selectedBy: string;
  addMember: string[];
  removeMember: string[] | undefined;
}

export interface UpdateEventInvitationHandGesturesType {
  userId?: string;
  eventId?: string;
  response?: RSVPResponseType;
  teamId?: string;
  eventFilter?: TimeFilterType;
}

export interface DeleteAllEventSquadType {
  eventId: string;
  userId: string;
  teamId: string;
}

export type InvitationStatusType =
  | 'pending'
  | 'sent'
  | 'accepted'
  | 'declined'
  | 'maybe';

export type Event = {
  created_by: string;
  description: string | null;
  end_time: string | null;
  event_date: string;
  event_status: 'active' | 'cancelled' | 'completed';
  event_type: 'training' | 'home_match' | 'away_match';
  id: string;
  is_home_event: boolean | null;
  location_address: string;
  location_name: string;
  notes: string;
  opponent: string | null;
  start_time: string;
  team_id: string;
  title: string;
};

export interface EventInvitationWithProfile {
  id: string;
  userId: string;
  eventId: string;
  profiles: {
    id: string;
    fcmToken: string | null;
    lastName: string;
    firstName: string;
    teamSort: string;
    createdAt: string;
    updatedAt: string;
    dateOfBirth: string;
    team_admins: any[]; // nếu biết kiểu cụ thể thì replace
    team_members: {
      id: string;
      teamId: string;
      position: string | null;
    }[];
    profilePhotoUri: string | null;
    isSporthawkAdmin: boolean | null;
    backgroundImageUri: string | null;
    startAccountDelete: string | null;
  };
  invitedAt: string;
  invitedBy: string;
  invitationStatus: string;
}

