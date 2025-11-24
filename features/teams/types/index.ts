import { InvitationStatusType } from '@top/features/event/types';

export type UserTeam = {
  id: string;
  name: string;
  sport: string;
  team_photo_url: string | null;
  club_id: string;
  // User can be BOTH admin AND member
  is_admin: boolean;
  admin_role?: string | null;
  is_primary_admin?: boolean;
  is_member: boolean;
  position?: string | null;
  jersey_number?: number | null;
  club: {
    id: string;
    name: string;
    club_badge_url: string | null;
  };
};

export type TabType = 'events' | 'payments' | 'members' | 'admins';
export type RSVPResponseType = 'yes' | 'no' | 'maybe' | 'none' | null;

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

export type EventCounts = {
  thisWeek: number;
  nextWeek: number;
  next30Days: number;
  all: number;
};

export type PaymentRequest = {
  id: string;
  title: string;
  amountPence: number;
  dueDate: string | null;
  paymentType: 'required' | 'optional';
  paymentStatus: 'pending' | 'paid' | 'overdue';
  teamName: string;
  createdAt: string;
};

export type PaymentFilter = 'all' | 'upcoming' | 'required';

export type InvitationType = {
  event_id: string;
  id: string;
  invitation_status: InvitationStatusType;
  invited_by: string;
  user_id: string;
};

export interface Club {
  id: string;
  name: string;
  slug: string;
  sports: string[];
  location: {
    address: string;
  };
  is_active: boolean;
  created_at: string;
  created_by: string;
  sport_type: string;
  updated_at: string;
  twitter_url: string | null;
  website_url: string | null;
  facebook_url: string | null;
  founded_year: number | null;
  contact_email: string;
  contact_phone: string;
  instagram_url: string | null;
  location_city: string | null;
  club_badge_url: string | null;
  location_state: string | null;
  location_country: string | null;
  about_description: string;
  location_latitude: number | null;
  location_postcode: string;
  location_longitude: number | null;
  background_image_url: string | null;
}

export interface Team {
  id: string;
  club_id: string;
  name: string;
  team_type: string;
  sport: string;
  league_name: string;
  team_level: string;
  team_sort: string;
  age_group: string;
  home_ground: string;
  home_ground_address: string;
  home_ground_latitude: number;
  home_ground_longitude: number;
  founded_year: number;
  motto: string;
  team_photo_url: string;
  training_day_1: string | null;
  training_time_1: string | null;
  training_day_2: string | null;
  training_time_2: string | null;
  match_day: string | null;
  match_time: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  clubs: Club;
}

export interface TeamResponse {
  data: Team;
}

export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  joined_at: string;
  profiles?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface MembersListHeaderProps {
  teamName: string;
  teamType: string | null;
  teamLogo: string | null;
  pendingInterestCount: number;
  searchValue: string;
  onSearchChange: (text: string) => void;
  onAddMembersPress: () => void;
}

export interface InterestExpression {
  id: string;
  team_id: string;
  user_id: string;
  interest_status: string;
  expressed_at: string;
  message: string | null;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_photo_uri: string | null;
    favorite_position: string | null;
  };
}

export interface SearchResult {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_photo_uri: string | null;
  favorite_position: string | null;
}

export type TeamMemberData = {
  id: string;
  teamId: string;
  userId: string;
  position: string | null;
  jerseyNumber: number | null;
  memberStatus: 'active' | 'inactive';
  joinedAt: string;
  leftAt: string | null;
  addedBy: string | null;
  profiles: {
    id: string;
    firstName: string;
    lastName: string;
    teamSort: string | null;
    profilePhotoUri: string | null;
    dateOfBirth: string | null;
    backgroundImageUri: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export type GetTeamsType = {
  data: TeamDataType | null;
};

export type TeamDataType = {
  id: string;
  clubId: string;
  name: string;
  teamType: string;
  sport: string;
  leagueName: string | null;
  teamLevel: string | null;
  teamSort: string | null;
  ageGroup: string | null;
  homeGround: string | null;
  homeGroundAddress: string | null;
  homeGroundLatitude: number | null;
  homeGroundLongitude: number | null;
  foundedYear: number | null;
  motto: string | null;
  teamPhotoUrl: string | null;
  trainingDay1: string | null;
  trainingTime1: string | null;
  trainingDay2: string | null;
  trainingTime2: string | null;
  matchDay: string | null;
  matchTime: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  clubs: {
    id: string;
    name: string;
    slug: string | null;
    sports: string[] | null;
    location: { address: string } | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    sportType: string | null;
    websiteUrl: string | null;
    facebookUrl: string | null;
    twitterUrl: string | null;
    instagramUrl: string | null;
    foundedYear: number | null;
    contactEmail: string | null;
    contactPhone: string | null;
    locationCity: string | null;
    locationState: string | null;
    locationCountry: string | null;
    locationPostcode: string | null;
    locationLatitude: number | null;
    locationLongitude: number | null;
    clubBadgeUrl: string | null;
    backgroundImageUrl: string | null;
    aboutDescription: string | null;
  };
};
