export const INVITATION_STATUS = {
  NULL: null,
  PENDING: 'pending',
  SENT: 'sent',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  MAYBE: 'maybe',
} as const;

export type InvitationStatus =
  (typeof INVITATION_STATUS)[keyof typeof INVITATION_STATUS];

export const RSVP_RESPONSE = {
  YES: 'yes',
  NO: 'no',
  MAYBE: 'maybe',
  NONE: 'none',
  TOTAL: 'total',
  PENDING: 'pending',
} as const;

export type RSVPResponseKey = keyof typeof RSVP_RESPONSE;
export type RSVPResponseValue = (typeof RSVP_RESPONSE)[RSVPResponseKey];

export const EVENT_STATUS_FILTER = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export type EventStatusFilterKey = keyof typeof EVENT_STATUS_FILTER;
export type EventStatusFilterValue =
  (typeof EVENT_STATUS_FILTER)[EventStatusFilterKey];

export const EVENT_ACTION = {
  SEND_REMINDER: 'send_reminder',
  EDIT_EVENT: 'edit_event',
  SELECT_SQUAD: 'select_squad',
} as const;

export type EventActionKey = keyof typeof EVENT_ACTION;
export type EventActionValue = (typeof EVENT_ACTION)[EventActionKey];

export const SQUAD_MODE = {
  MEMBERS: 'members',
  LEADERS: 'leaders',
} as const;

export type SquadModeKey = keyof typeof SQUAD_MODE;
export type SquadModeValue = (typeof SQUAD_MODE)[SquadModeKey];

export const EVENT_TYPE = {
  HOME_MATCH: 'home_match',
  AWAY_MATCH: 'away_match',
  TRAINING: 'training',
  OTHER: 'other',
} as const;

export type EventTypeKey = keyof typeof EVENT_TYPE;
export type EventTypeValue = (typeof EVENT_TYPE)[EventTypeKey];
