export const PROFILE_FIELDS = `
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
  startAccountDelete:start_account_delete,
  
  team_members:team_members_user_id_fkey1 (
    id,
    teamId:team_id,
    position
  ),

  team_admins:team_admins_user_id_fkey1 (
    id,
    teamId:team_id,
    role
  )
`;

export const INVITATION_FIELDS = `
  id,
  userId:user_id,
  eventId:event_id,
  invitedAt:invited_at,
  invitedBy:invited_by,
  invitationStatus:invitation_status,
  profiles (${PROFILE_FIELDS})
`;

export const SQUAD_FIELDS = `
  id,
  userId:user_id,
  eventId:event_id,
  position,
  squadRole:squad_role,
  selectedAt:selected_at,
  selectedBy:selected_by,
  selectionNotes:selection_notes
`;

export const CLUB_FIELDS = `
  id,
  name,
  sports,
  contactPhone:contact_phone,
  locationCity:location_city,
  locationState:location_state,
  locationPostcode:location_postcode,
  locationLatitude:location_latitude,
  locationLongitude:location_longitude,
  clubBadgeUrl:club_badge_url,
  backgroundImageUrl:background_image_url,
  aboutDescription:about_description
`;


export const TEAM_FIELDS = `
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
  teamPhotoUrl:team_photo_url,
  trainingDay1:training_day_1,
  trainingDay2:training_day_2,
  trainingTime1:training_time_1,
  trainingTime2:training_time_2,
  homeGroundAddress:home_ground_address,
  homeGroundLatitude:home_ground_latitude,
  homeGroundLongitude:home_ground_longitude,
   clubs!teams_club_id_fkey (
    ${CLUB_FIELDS}
  )

`;

export const EVENT_DETAIL_QUERY = `
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
  status,

  teams (
   ${TEAM_FIELDS}
  ),

  event_invitations (
    ${INVITATION_FIELDS}
  ),

  event_squads (
    ${SQUAD_FIELDS}
  )
`;
