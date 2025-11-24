# DO NOT USE - as this is an old summary document

# SportHawk MVP v4 - Project Summary

**Date:** 2025-08-20  
**Version:** 4.0  
**Status:** Active Development

## Executive Overview

SportHawk is a mobile-first sports community platform designed to streamline club management and connect sports enthusiasts. The MVP focuses on reducing administrative overhead for volunteer-run grassroots sports clubs while enabling members to easily discover and participate in club activities.

**Target Launch:** June 13, 2025  
**Pilot Club:** Fremington FC (~18-20 teams)  
**Platforms:** iOS & Android (React Native/Expo)  
**Backend:** Supabase (PostgreSQL, Auth, Storage, Functions)

## Technology Stack

### Frontend

- **Framework:** React Native with Expo SDK 53
- **Language:** TypeScript (strict mode)
- **Navigation:** Expo Router (file-based routing)
- **Styling:** React Native StyleSheet with centralized config
- **State Management:** React Context (UserContext)
- **Video Player:** expo-video
- **Maps:** react-native-maps

### Backend

- **Platform:** Supabase BaaS
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth (email/password, Google, Apple)
- **Storage:** Supabase Storage
- **Edge Functions:** Deno/TypeScript
- **Payment Processing:** Stripe Connect API
- **Push Notifications:** Expo Push Service

### Development Environment

- **Project ID:** vwqfwehtjnjenzrhzgol
- **Supabase URL:** https://vwqfwehtjnjenzrhzgol.supabase.co
- **Build System:** Expo EAS Build
- **Version Control:** Git (monorepo structure)

## Project Structure

```
/SportHawk_MVP_v4
├── /app                  # Expo Router pages & layouts
│   ├── _layout.tsx      # Root layout with Stack navigation
│   ├── index.tsx        # Welcome/landing screen
│   ├── /(auth)          # Authentication screens
│   │   ├── SignIn.tsx
│   │   ├── SignUp.tsx
│   │   ├── VerifyEmail.tsx
│   │   └── ForgotPassword.tsx
│   ├── /(app)           # Protected app screens
│   │   ├── home.tsx
│   │   ├── profile.tsx
│   │   └── settings.tsx
│   ├── /clubs           # Club-related screens
│   └── /teams           # Team-related screens
├── /components          # Reusable UI components (Sh prefix)
├── /config              # Centralized configuration
│   ├── colors.ts        # Color palette with TypeScript types
│   ├── typography.ts    # Font styles and weights
│   ├── spacing.ts       # Layout dimensions
│   └── icons.ts         # Icon name enums
├── /contexts            # React contexts
│   └── UserContext.tsx  # Centralized auth state
├── /lib                 # External integrations
│   └── supabase.ts      # Supabase client
├── /assets              # Static resources
│   ├── /icons           # SVG icons
│   ├── /images          # PNG/JPG images
│   └── /video           # Video assets
├── /types               # TypeScript definitions
│   └── database.ts      # Database schema types
└── /docs                # Project documentation
```

## Database Architecture

### Core Tables (32 total)

- **profiles** - User profiles linked to auth.users
- **clubs** - Sports clubs/organizations
- **teams** - Teams within clubs
- **club_members** - Club membership associations
- **team_members** - Team membership associations
- **club_admins** - Club administrator roles
- **team_admins** - Team administrator roles
- **events** - Matches, training, meetings
- **event_participants** - Event attendance tracking
- **payment_requests** - Payment collection system
- **notifications** - User notifications
- **broadcast_messages** - Club/team announcements
- **device_tokens** - Push notification tokens

### Security Model

- **Row Level Security (RLS):** Enabled on all tables
- **Role-based Access:** Super admin, club admin, team admin, member
- **Key Functions:**
  - `user_is_club_admin()`
  - `user_is_team_member_in_club()`
  - `user_is_primary_club_admin()`
  - `is_super_admin()`
- **Authentication:** Supabase Auth with email verification (OTP)

### Security Advisories (Current)

- 7 function search_path warnings (mutable search paths)
- 1 leaked password protection warning (disabled)
- All tables have RLS policies configured

## Component Library

All custom components follow the "Sh" prefix convention and are exported through barrel exports:

### Core Components (23 total)

- **ShButton** - Configurable button with variants
- **ShText** - Typography component with variants
- **ShIcon** - Icon wrapper with size/color props
- **ShScreenContainer** - Standard screen wrapper
- **ShMapView** - Map integration component
- **ShWelcomeVideo** - Video player for onboarding
- **ShOTPInput** - 6-digit verification code input
- **ShFormField\*** - Form input components (Email, Password, Name, Date, Choice)
- **ShAvatar** - User profile image display
- **ShTeamListItem** - Team list row component
- **ShUserList** - User listing component
- **ShStatsCard** - Statistics display card
- **ShProfileTabs** - Profile view tab navigation

## Navigation Architecture

### Routing Structure

- **Stack Navigation:** Expo Stack (top-level navigation)
- **File-based Routing:** Expo Router in `/app` directory
- **Protected Routes:** `/(app)` group requires authentication
- **Public Routes:** `/(auth)` group for authentication flows

### Key Navigation Rules

- **NO custom back buttons** - Stack handles automatically
- **Bottom navigation:** Must use Expo Tabs exclusively
- **Deep linking:** Configured with `sporthawk://` scheme

## Authentication Flow

### UserContext (Single Source of Truth)

```typescript
interface UserContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  authChecked: boolean;
  userSignIn: () => Promise<{}>;
  userSignOut: () => Promise<void>;
  userSignUp: () => Promise<void>;
  userVerify: () => Promise<void>;
  // ... additional auth methods
}
```

### Auth Workflow

1. Email/Password registration with profile creation
2. Email verification via 6-digit OTP
3. Social sign-in (Google, Apple) with profile completion
4. Password reset via email deep links
5. Session persistence with AsyncStorage

## Design System

### Color Palette

- **Primary:** Gold (#eabd22)
- **Base:** Dark (#161615)
- **Text:** Light (#eceae8), Mid (#b8b6b3), Secondary (#6b6b6a)
- **Semantic:** Success, Error, Info, Warning colors
- **Map Styles:** Dark and light theme configurations

### Typography Configuration

- **Font Weights:** 400 (regular) to 700 (bold)
- **Font Sizes:** 11px to 34px
- **Text Variants:** 15 predefined variants (H1-H5, Body, Caption, etc.)

### Development Rules

- **NO magic values** - Everything from config files
- **NO TODO comments** without explicit permission
- **Complete implementation** required before marking complete
- **Pixel-perfect** implementation matching Figma designs
- **Component-based** architecture (logic in components, not screens)
- **Test requirements:** npm run lint must pass

## API Integrations

### Supabase Services

- **Auth:** User authentication and session management
- **Database:** PostgreSQL with real-time subscriptions
- **Storage:** File uploads for profile photos, club logos
- **Edge Functions:** Server-side logic (Deno/TypeScript)

### External APIs

- **Stripe Connect:** Payment processing for club fees
- **Expo Push Service:** Push notifications
- **Google Maps:** iOS and Android map integration
- **Firebase:** Analytics and crash reporting

## Development Commands

```bash
# Start development
npm start

# Platform-specific
npm run ios
npm run android

# Code quality
npm run lint

# Build for production
eas build --platform ios
eas build --platform android
```

## Current State & Next Steps

### Completed Features

- Core authentication flow with email verification
- User profile management
- Basic navigation structure
- Component library foundation
- Database schema with RLS policies
- Map integration setup

### In Progress

- Club and team management interfaces
- Event scheduling system
- Payment request functionality
- Push notification implementation

### Upcoming (Priority Order)

1. Complete admin dashboard for club/team management
2. Implement event creation and squad selection
3. Add payment request creation and tracking
4. Enable push notifications for announcements
5. Implement discovery features (map search, filters)
6. Add broadcast messaging system

## Key Considerations

### Performance

- Minimize re-renders with proper memoization
- Lazy load heavy components (maps, videos)
- Optimize image sizes with expo-image
- Batch database operations where possible

### Security

- All user operations through UserContext
- Never expose service role keys
- Validate inputs on both client and server
- Use RLS policies for data access control
- Regular security advisor checks via MCP

### Maintainability

- Follow established patterns exactly
- Document complex logic inline
- Use TypeScript strict mode
- Maintain centralized configuration
- Regular updates to LESSONS_LEARNED.md

## Support & Documentation

### Key Documentation Files

- `/CLAUDE.md` - AI assistant guidelines
- `/docs/prd.md` - Product requirements
- `/docs/architecture.md` - System architecture
- `/docs/front-end-architecture.md` - Frontend specifics
- `/LESSONS_LEARNED.md` - Development insights

### Environment Variables Required

```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
```

## Contact & Resources

- **Project Owner:** SportHawk Ltd
- **Pilot Club:** Fremington FC
- **Target Users:** ~18-20 teams, volunteer admins, players, parents
- **Support Model:** Direct support from SportHawk team during MVP

---

_This summary represents the current state of the SportHawk MVP v4 as of 2025-08-20. The project is actively under development with a target launch date of June 13, 2025._
