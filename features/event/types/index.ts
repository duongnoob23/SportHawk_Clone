import { IconName } from '@con/icons';
import { RSVPResponseType } from '@top/features/teams/types';

export type UserEvent = {
  id: string;
  event_id: string;
  user_id: string;
  role?: string | null;
  rsvp_response?: RSVPResponseType;
  rsvp_at?: string | null;
  event: {
    id: string;
    team_id: string;
    title: string;
    event_type: string;
    event_date: string;
    created_by: string;
    start_time: string;
    end_time?: string | null;
    location_name?: string | null;
    opponent?: string | null;
    is_home_event?: boolean | null;
    notes?: string | null;
    event_status?: string | null;
    teams: {
      id: string;
      name: string;
      sport: string;
      team_photo_url?: string | null;
    } | null;
  };
};

export type EventDropdownItem = 'send_reminder' | 'edit_event' | 'select_squad';
export type EventDropdownOption = {
  name: string;
  value: IconName;
};

export type RSVPCounts = {
  yes: number;
  no: number;
  maybe: number;
  none: number;
  total: number;
  pending: number;
};

export type EventResponder = {
  user_id: string;
  attendance_status: 'invited' | 'going' | 'not_going' | 'maybe' | string;
  created_at: string;
  invited_at: string | null;
  invited_by: string | null;
  notes?: string | null;
  role?: string | null;
  rsvp_at: string | null;
  rsvp_response: 'yes' | 'no' | 'maybe' | null;
  updated_at: string;
  profile?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    profile_photo_uri?: string | null;
  } | null;
};

export type EventLocation = {
  latitude: number | null;
  longitude: number | null;
  address?: string | null;
  name?: string | null;
};

export type NotificationType = {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  related_entity_type?: string;
  related_entity_id?: string;
  priority?: 'low' | 'normal' | 'high';
  is_read: boolean;
  read_at?: string;
  delivery_method?: 'push' | 'email' | 'sms' | 'in_app';
  delivery_status?: 'pending' | 'sent' | 'delivered' | 'failed';
  delivery_attempts?: number;
  last_delivery_attempt?: string;
  created_at: string;
  expires_at?: string;
};

export type getInsertNotificationInput = {
  user_id: string;
  title: string;
  message: string;
  notification_type?: string;
  data?: Record<string, any>;
  related_entity_type?: string;
  related_entity_id?: string;
  priority?: 'low' | 'normal' | 'high';
  delivery_method?: 'push' | 'email' | 'sms' | 'in_app';
  delivery_status?: 'pending' | 'sent' | 'delivered' | 'failed';
  expires_at?: string;
};

export type InvitationResponder = {
  id: string;
  user_id: string;
  invitation_status:
    | 'pending'
    | 'accepted'
    | 'maybe'
    | 'send'
    | 'declined'
    | string;
  invited_at: string;
  invited_by: string;
  profile: {
    first_name: string;
    last_name: string;
    profile_photo_uri: string | null;
    id: string;
  } | null;
};

export type attendanceType =
  | 'invited'
  | 'attending'
  | 'not_attending'
  | 'attended'
  | 'no_show';
export type EventAttendance = {
  id: string;
  event_id: string;
  user_id: string;
  role: string; // ví dụ: "coach" | "player" | ...
  attendance_status: attendanceType; // ví dụ: "invited" | "accepted" | "declined" | ...
  rsvp_response: RSVPResponseType;
  rsvp_at: string | null; // ISO datetime
  invited_at: string; // ISO datetime
  invited_by: string;
  notes: string | null;
  profile: {
    first_name: string;
    last_name: string;
    profile_photo_uri: string | null;
    id: string;
  } | null;
};

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  profile_photo_uri: string | null;
  date_of_birth: string; // bạn có thể đổi thành Date nếu parse trước
  team_sort: string;
  is_sporthawk_admin: boolean | null;
  position: string | null;
  role: string | null;
}

export type ResponderType = {
  id: string;
  user_id: string;
  invitation_status: InvitationStatusType;
  invited_at: string; // ISO date string
  invited_by: string;
  profile: Profile;
};

export type Team = {
  id: string;
  name: string;
  sport: string;
  team_photo_url: string;
};

export type Event = {
  id: string;
  notes: string;
  teams: Team;
  title: string;
  team_id: string;
  end_time: string;
  opponent: string;
  event_date: string;
  event_type: string;
  start_time: string;
  description: string;
  event_status: string;
  is_home_event: boolean;
  location_name: string;
  location_address: string | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
};

export type EvenDetails = {
  id: string;
  event_id: string;
  user_id: string;
  role: string;
  attendance_status: string;
  rsvp_response: string | null;
  rsvp_at: string | null;
  invited_at: string;
  invited_by: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  event: Event;
};

export type Test = EvenDetails[];

export type EventNotes = {
  kitColor?: string;
  meetTime?: string;
  answerBy?: string;
};

export type InvitationStatusType =
  | 'pending'
  | 'accepted'
  | 'maybe'
  | 'send'
  | 'declined'
  | string
  | undefined;

export type InvitationType = {
  id: string | number;
  event_id: string | number;
  user_id: string | number;
  invitation_status: InvitationStatusType; // nếu có enum thì thay cho string
  invited_at: string | Date;
  invited_by: string | number;
};

export interface EventDataResponse {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  notes: string | null;

  event_date: string; // yyyy-mm-dd
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss

  event_type: string; // ví dụ: "home_match" | "training"
  event_status: string; // ví dụ: "active" | "cancelled"...
  status: string; // trường này bạn có trong JSON luôn (nếu khác event_status thì để riêng)

  is_home_event: boolean;
  opponent: string | null;
  max_participants: number | null;

  location: string | null; // bạn có 2 field "location" và "location_name"
  location_name: string | null;
  location_address: string | null;
  location_latitude: number | null;
  location_longitude: number | null;

  weather_consideration: boolean;
  feedback_requested: boolean;

  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  created_by: string;

  cancelled_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  cancelled_reason: string | null; // JSON bạn gửi có cả field này
}

export interface EventDataResponse1 {
  counts: {
    maybe: number;
    no: number;
    none: number;
    total: number;
    yes: number;
  };

  dataInvitations: {
    event_id: string;
    id: string;
    invitation_status: string; // "pending" | "accepted" | ...
    invited_at: string; // ISO datetime
    invited_by: string;
    user_id: string;
  };

  eventData: {
    id: string;
    team_id: string;
    title: string;
    description: string | null;
    notes: string | null;

    event_date: string; // yyyy-mm-dd
    start_time: string; // HH:mm:ss
    end_time: string; // HH:mm:ss

    event_type: string; // "home_match" | "training" | ...
    type?: string; // có trong JSON (ví dụ: "training")
    event_status: string; // "active" | "cancelled" | ...
    status: string; // trùng/khác với event_status thì vẫn để riêng

    is_home_event: boolean;
    opponent: string | null;
    max_participants: number | null;

    location: string | null;
    location_name: string | null;
    location_address: string | null;
    location_latitude: number | null;
    location_longitude: number | null;

    weather_consideration: boolean;
    feedback_requested: boolean;

    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    created_by: string;

    cancelled_at: string | null;
    cancelled_by: string | null;
    cancellation_reason: string | null;
    cancelled_reason: string | null;
  };

  isSelected: boolean;

  responders: {
    id: string;
    invitation_status: string;
    invited_at: string; // ISO datetime
    invited_by: string;
    user_id: string;
    profile: any; // JSON chỉ ghi "[Object]", nên để any hoặc tạo interface chi tiết nếu biết schema
  }[];

  teamData: {
    id: string;
    club_id: string;
    name: string;
    team_type: string;
    team_level: string;
    team_sort: string;
    age_group: string;
    sport: string;
    league_name: string;
    motto: string | null;
    founded_year: number | null;
    is_active: boolean;

    home_ground: string | null;
    home_ground_address: string | null;
    home_ground_latitude: number | null;
    home_ground_longitude: number | null;

    match_day: string | null;
    match_time: string | null;

    training_day_1: string | null;
    training_day_2: string | null;
    training_time_1: string | null;
    training_time_2: string | null;

    team_photo_url: string | null;

    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
  };
}

export interface TeamType {
  id: string;
  club_id: string;
  name: string;
  sport: string;
  age_group: string;
  motto: string | null;

  team_type: string;
  team_level: string;
  team_sort: string;

  league_name: string;
  founded_year: number | null;
  is_active: boolean;

  home_ground: string | null;
  home_ground_address: string | null;
  home_ground_latitude: number | null;
  home_ground_longitude: number | null;

  match_day: string | null;
  match_time: string | null;

  training_day_1: string | null;
  training_day_2: string | null;
  training_time_1: string | null;
  training_time_2: string | null;

  team_photo_url: string | null;

  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

export type MemberData = {
  id: string;
  user_id: string;
  profile: ProfileData | null;
  position?: string | null;
};

export type MemberData1 = {
  id: string;
  teamId: string;
  userId: string;
  position: string | null;
  memberStatus: string;
  isChoose?: boolean;
  profiles: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profilePhotoUri: string | null;
  };
};

export type ProfileData = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_photo_uri: string | null;
};

export type LeaderData = {
  id: string;
  user_id: string;
  profile: ProfileData | null;
  role?: string | null;
};

export type LeaderData1 = {
  id?: string;
  teamId?: string;
  userId: string;
  role?: string | null;
  title?: string | null;
  isPrimary?: boolean;
  isChoose?: boolean;
  profiles?: {
    id?: string;
    firstName?: string | null;
    lastName?: string | null;
    profilePhotoUri?: string | null;
  };
};

export interface EditEventType {
  id: string;
  notes: string | null;
  title: string | null;
  teamId: string;
  endTime: string | null; // Format: 'HH:mm:ss'
  opponent: string | null;
  eventDate: string; // Format: 'YYYY-MM-DD'
  eventType: string; // e.g. 'home_match', 'training', etc.
  startTime: string | null; // Format: 'HH:mm:ss'
  description: string | null;
  eventStatus: string; // e.g. 'active', 'cancelled'
  isHomeEvent: boolean;
  locationName: string | null;
  locationAddress: string | null;
  createdBy: string;
  locationLatitude: number | null;
  locationLongitude: number | null;
  maxParticipants: number;
  cancelledReason: string;
  cancelledAt: string;
  cancelledBy: string;
  weatherConsideration: string;
  createdAt: string;
  updatedAt: string;
  feedbackRequested: string;
  type: string;
  location: string;
  status: string;
}

export type ProfileDetail = {
  id: string;
  fcmToken: string | null;
  lastName: string;
  firstName: string;
  teamSort: string | null;
  createdAt: string;
  updatedAt: string;
  dateOfBirth: string | null;
  profilePhotoUri: string | null;
  isSporthawkAdmin: boolean | null;
  backgroundImageUri: string | null;
  startAccountDelete: string | null;
  team_members?: {
    id: string;
    teamId: string;
    position: string | null;
  }[];
  team_admins?: {
    id: string;
    teamId: string;
    role: string | null;
  }[];
};

export type EventSquadsSelectData = {
  eventSquads: EventSquad[];
  eventInvitations: EventInvitations | null; // Allow null when no invitation found
};

export type EventSquad = {
  id: string;
  userId: string;
  eventId: string;
  position: string | null;
  squadRole: string | null;
  selectedAt: string;
  selectedBy: string;
  selectionNotes: string | null;
};

export type EventInvitations = {
  id: string;
  eventId: string;
  userId: string;
  invitedBy: string;
  invitedAt: string;
  invitationStatus: string | null;
};

// Type alias for single EventInvitation (matches Supabase query result with camelCase transformation)
export type EventInvitation = {
  id: string;
  eventId: string;
  userId: string;
  invitedBy: string;
  invitedAt: string;
  invitationStatus: string | null;
};

export type ClubsDetailType = {
  id: string;
  name: string;
  sports: string[]; // ví dụ: ["Football"]
  contactPhone: string | null;
  locationCity: string | null;
  locationState: string | null;
  locationPostcode: string | null;
  locationLatitude: number | null;
  locationLongitude: number | null;
  clubBadgeUrl: string | null;
  backgroundImageUrl: string | null;
  aboutDescription: string | null;
};

export type TeamDetail = {
  id: string;
  name: string;
  motto: string | null;
  sport: string;
  clubId: string;
  ageGroup: string | null;
  isActive: boolean;
  matchDay: string | null;
  teamSort: string | null;
  teamType: string | null;
  createdAt: string;
  updatedAt: string;
  matchTime: string | null;
  teamLevel: string | null;
  homeGround: string | null;
  leagueName: string | null;
  foundedYear: number | null;
  teamPhotoUrl: string | null;
  trainingDay1: string | null;
  trainingDay2: string | null;
  trainingTime1: string | null;
  trainingTime2: string | null;
  homeGroundAddress: string | null;
  homeGroundLatitude: number | null;
  homeGroundLongitude: number | null;
  clubs: ClubsDetailType;
};

export type EventDetailData = {
  id: string;
  teamId: string;
  createdBy: string;
  title: string;
  eventType: string;
  description: string | null;
  eventDate: string;
  startTime: string;
  endTime: string;
  locationName: string | null;
  locationAddress: string | null;
  locationLatitude: number | null;
  locationLongitude: number | null;
  opponent: string | null;
  isHomeEvent: boolean;
  maxParticipants: number | null;
  notes: string | null;
  eventStatus: string;
  cancelledReason: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  weatherConsideration: boolean;
  createdAt: string;
  updatedAt: string;
  feedbackRequested: boolean;
  type: string;
  location: string | null;
  status: string;
  teams: TeamDetail;
  event_invitations: EventInvitation[];
  event_squads: EventSquad[];
  counts?: {
    yes: number;
    no: number;
    maybe: number;
    none: number;
    total: number;
  };
};

export interface InvitationInput {
  eventId: string;
  invitedMembers: string[];
  invitedLeaders: string[];
  invitedBy: string;
  addedMembers?: string[];
  removedMembers?: string[];
}

export interface SelectAllButtonProps {
  onPress: () => void;
  leaders?: LeaderData1[];
}
