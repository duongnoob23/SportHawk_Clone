// Default values used throughout the app

export const defaults = {
  // Team defaults
  foundedYear: '2020',
  memberCountPlaceholder: '0',
  defaultSport: 'Football',

  // User defaults
  defaultRole: 'Member',
  defaultAdminRole: 'Admin',

  // Text placeholders
  noTeamsFound: 'No teams found',
  noMembersYet: 'No members yet',
  teamNotFound: 'Team not found',
  comingSoonText: 'Members list coming soon',
  noAdmins: 'No admins',
  noMembers: 'No members',
} as const;

export type DefaultKey = keyof typeof defaults;
