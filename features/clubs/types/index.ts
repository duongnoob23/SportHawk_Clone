
export type ClubType = {
  id: string;
  name: string;
  location_city: string | null;
  location_state: string | null;
  location_postcode: string | null;
  about_description: string | null;
  sports: string[];
  club_badge_url: string | null;
  background_image_url: string | null;
  contact_phone: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  teams: TeamType[];
  member_count: number;
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
};



export type TeamType = {
  id: string;
  name: string;
  motto: string | null;
  sport: string | null;
  club_id: string;
  age_group: string | null;
  is_active: boolean;
  match_day: string | null;
  team_sort: string | null;
  team_type: string | null;
  created_at: string;
  match_time: string | null;
  team_level: string | null;
  updated_at: string;
  home_ground: string | null;
  league_name: string | null;
  founded_year: number | null;
  team_members: TeamMemberType[];
  team_admins: TeamAdminType[];
  team_photo_url: string | null;
  training_day_1: string | null;
  training_day_2: string | null;
  training_time_1: string | null;
  training_time_2: string | null;
  home_ground_address: string | null;
  home_ground_latitude: number | null;
  home_ground_longitude: number | null;
};

export type TeamAdminType = {
  id: string;
  role: string | null;
  title: string | null;
  team_id: string;
  user_id: string;
  is_primary: boolean;
  assigned_at: string;
  assigned_by: string | null;
  permissions: string[] | null; // nếu "permissions" là JSON array, còn nếu là text thì để string | null
};


export type TeamMemberType = {
  id: string;
  left_at: string | null;
  team_id: string;
  user_id: string;
  added_by: string | null;
  position: string | null;
  joined_at: string;
  jersey_number: number | null;
  member_status: 'active' | 'inactive' | string;
};


export interface ClubDetailsResponse {
  id: string;
  name: string;
  slug: string;
  sportType: string | null;
  locationCity: string | null;
  locationCountry: string | null;
  locationState: string | null;
  locationPostcode: string | null;
  locationLatitude: number | null;
  locationLongitude: number | null;
  foundedYear: number | null;
  aboutDescription: string | null;
  clubBadgeUrl: string | null;
  backgroundImageUrl: string | null;
  websiteUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sports: string[] | null;
  location: string | null;
  createdBy: string | null;

  clubAdmins: ClubDetailsClubAdmin[];
  teams: ClubDetailsTeam[];
}

/* ---------- Club Admin ---------- */
export interface ClubDetailsClubAdmin {
  id: string;
  role: string | null;
  title: string | null;
  clubId: string;
  userId: string;
  profiles: ClubDetailsClubAdminProfile | null;
  isPrimary: boolean;
  assignedAt: string | null;
  assignedBy: string | null;
  permissions: Record<string, any> | null; // nếu là JSONB trong DB
}

/* ---------- Profile ---------- */
export interface ClubDetailsClubAdminProfile  {
  id: string;
  fcmToken: string | null;
  lastName: string | null;
  teamSort: string | null;
  createdAt: string;
  firstName: string | null;
  updatedAt: string;
  dateOfBirth: string | null;
  profilePhotoUri: string | null;
  isSporthawkAdmin: boolean;
  backgroundImageUri: string | null;
  startAccountDelete: string | null;
}

/* ---------- Team ---------- */
export interface ClubDetailsTeam {
  id: string;
  name: string;
  motto: string | null;
  sport: string | null;
  clubId: string;
  ageGroup: string | null;
  isActive: boolean;
  matchDay: string | null;
  teamSort: string | null;
  teamType: string | null;
  createdAt: string;
  matchTime: string | null;
  teamLevel: string | null;
  updatedAt: string;
  homeGround: string | null;
  leagueName: string | null;
  foundedYear: number | null;

  teamMembers: ClubDetailsTeamResponseTeamMember[];

  teamPhotoUrl: string | null;
  trainingDay1: string | null;
  trainingDay2: string | null;
  trainingTime1: string | null;
  trainingTime2: string | null;
  homeGroundAddress: string | null;
  homeGroundLatitude: number | null;
  homeGroundLongitude: number | null;
}

/* ---------- Team Member ---------- */
export interface ClubDetailsTeamResponseTeamMember {
  id: string;
  leftAt: string | null;
  teamId: string;
  userId: string;
  addedBy: string | null;
  position: string | null;
  joinedAt: string | null;
  jerseyNumber: string | null;
  memberStatus: string;
}


export interface Team {
  id: string;
  name: string;
  sport: string;
  age_group?: string;
  team_sort?: string;
}

export interface  Admin {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}
