/**
 * Centralized route definitions for the SportHawk app
 * All navigation paths should reference these constants instead of using magic strings
 */

export const Routes = {
  // Root
  Welcome: '/' as const,

  // Auth Routes
  SignIn: '/(auth)/SignIn' as const,
  SignUp: '/(auth)/SignUp' as const,
  SignOut: '/(auth)/SignOut' as const,
  ForgotPassword: '/(auth)/ForgotPassword' as const,
  VerifyEmail: '/(auth)/VerifyEmail' as const,
  ResetPassword: '/(auth)/ResetPassword' as const,

  // App Tab Routes
  Home: '/(app)/home' as const,
  Teams: '/(app)/teams' as const,
  Explore: '/(app)/explore' as const,
  Alerts: '/(app)/alerts' as const,
  Profile: '/(app)/profile' as const,
  Settings: '/(app)/settings' as const,

  // User Routes
  UserSettings: '/user/settings' as const,
  EditProfile: '/user/edit-profile' as const,
  AboutUser: '/user/about' as const,
  BlockedUsers: '/user/blocked-users' as const,
  HelpFeedback: '/user/help-feedback' as const,
  Invitations: '/user/invitations' as const,
  ManageAccount: '/user/manage-account' as const,
  ChangePassword: '/user/change-password' as const,
  DeleteAccount: '/user/delete-account' as const,
  ManageClubs: '/user/manage-clubs' as const,
  ManagePosts: '/user/manage-posts' as const,
  PaymentHistory: '/user/payment-history' as const,
  Permissions: '/user/permissions' as const,
  SavedClubs: '/user/saved-clubs' as const,
  Support: '/user/support' as const,
  FAQ: '/user/faq' as const,
  TermsService: '/user/terms-service' as const,

  // Design System Routes
  DesignSystem: '/(design)' as const,
  DesignColors: '/(design)/colors_showcase' as const,
  DesignTypography: '/(design)/typography_showcase' as const,
  DesignButtons: '/(design)/buttons_showcase' as const,
  DesignIcons: '/(design)/icon_showcase' as const,

  // Events Routes
  CreateEvent: '/events/create-event' as const,
  EditEvent: '/events/edit-event' as const,
  EventDetails: '/events/details' as const,
  EditSquad: '/events/edit-squad' as const,
  EditMembers: '/events/edit-members' as const,
  EditLeaders: '/events/edit-leaders' as const,
  EditSelectSquad: '/events/edit-select-squad' as const,
  // Payment Routes
  PaymentCreate: '/payments/create-payment' as const,
  PaymentEditMembers: '/payments/edit-members' as const,
  PaymentSuccess: '/payments/success' as const,

  // Dynamic Routes (functions that return route strings)
  ClubDetails: (clubId: string) => `/clubs/${clubId}` as const,
  ClubAbout: (clubId: string) => `/clubs/${clubId}/about` as const,
  ClubTeams: (clubId: string) => `/clubs/${clubId}/teams` as const,
  TeamAbout: (teamId: string) => `/teams/${teamId}/about` as const,
  TeamMembers: (teamId: string) => `/teams/${teamId}/members` as const,
  TeamAdminSettings: (teamId: string) =>
    `/teams/${teamId}/admin/settings` as const,
  TeamAdminMembers: (teamId: string) =>
    `/teams/${teamId}/admin/members` as const,
  TeamAdminAdmins: (teamId: string) => `/teams/${teamId}/admin/admins` as const,
  TeamAdminEvents: (teamId: string) => `/teams/${teamId}/admin/events` as const,
  TeamAdminAlerts: (teamId: string) => `/teams/${teamId}/admin/alerts` as const,
  TeamAdminPayments: (teamId: string) =>
    `/teams/${teamId}/admin/payments` as const,

  // Authenticated Routes (used in push with params)
  ExpressInterest: '/(authenticated)/express-interest' as const,

  // Test Routes
  TestAuth: '/test-auth' as const,
} as const;

// Type for all route keys
export type RouteKey = keyof typeof Routes;

// Type for route values
export type RouteValue = (typeof Routes)[RouteKey];
