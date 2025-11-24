# SportHawk MVP v4 - Project Summary

**Date:** 2025-08-24  
**Version:** 4.0  
**Status:** Active Development - Mid-Phase Implementation

## Executive Overview

SportHawk is a mobile-first sports community platform designed to streamline club management and connect sports enthusiasts. The MVP focuses on reducing administrative overhead for volunteer-run grassroots sports clubs while enabling members to easily discover and participate in club activities.

**Target Launch:** June 13, 2025  
**Pilot Club:** Fremington FC (~18-20 teams)  
**Platforms:** iOS & Android (React Native/Expo)  
**Backend:** Supabase (PostgreSQL, Auth, Storage, Functions)

## Technology Stack

### Frontend

- **Framework:** React Native with Expo SDK 53
- **Language:** TypeScript (strict mode enabled)
- **Navigation:** Expo Router (file-based routing)
- **Styling:** React Native StyleSheet with centralized config
- **State Management:** React Context (UserContext)
- **Video Player:** expo-video
- **Maps:** react-native-maps
- **Image Handling:** expo-image with SVG support

### Backend

- **Platform:** Supabase BaaS
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth (email/password, social pending)
- **Storage:** Supabase Storage
- **Edge Functions:** Deno/TypeScript
- **Payment Processing:** Stripe Connect API (planned)
- **Push Notifications:** Expo Push Service (planned)

### Development Environment

- **Project ID:** vwqfwehtjnjenzrhzgol
- **Supabase URL:** https://vwqfwehtjnjenzrhzgol.supabase.co
- **Build System:** Expo EAS Build
- **Version Control:** Git
- **EAS Project ID:** 35d580bc-83c3-49e1-812a-3f174507464f

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
│   ├── /(app)           # Protected app screens with tabs
│   │   ├── _layout.tsx  # Tab navigation
│   │   ├── home.tsx     # Home dashboard
│   │   ├── explore.tsx  # Club/team discovery
│   │   ├── teams.tsx    # User's teams
│   │   ├── alerts.tsx   # Notifications
│   │   └── profile.tsx  # User profile
│   ├── /clubs           # Club-related screens
│   │   └── [id]/teams.tsx
│   ├── /teams           # Team-related screens
│   │   └── [id]/        # Team detail pages
│   ├── /events          # Event management
│   │   ├── [id].tsx     # Event detail
│   │   └── create.tsx   # Create event
│   └── /(design)        # Design system showcase
├── /components          # Reusable UI components (Sh prefix)
├── /config              # Centralized configuration
│   ├── colors.ts        # Color palette with TypeScript types
│   ├── typography.ts    # Font styles and weights
│   ├── spacing.ts       # Layout dimensions
│   ├── buttons.ts       # Button variants
│   └── icons.ts         # Icon name enums
├── /contexts            # React contexts
│   └── UserContext.tsx  # Centralized auth & user state
├── /hooks               # Custom React hooks
│   └── useUser.ts       # User authentication hook
├── /lib                 # External integrations
│   ├── supabase.ts      # Supabase client
│   └── utils/           # Utility functions
│       └── logger.ts    # Logging utility
├── /assets              # Static resources
│   ├── /icons           # SVG icons
│   ├── /images          # PNG/JPG images
│   └── /video           # Video assets
├── /types               # TypeScript definitions
│   └── database.ts      # Database schema types (auto-generated)
└── /docs                # Project documentation
```

## Database Architecture

### Core Tables (30+ tables)

- **profiles** - User profiles linked to auth.users
- **clubs** - Sports clubs/organizations
- **teams** - Teams within clubs
- **club_members** - Club membership associations
- **team_members** - Team membership associations
- **club_admins** - Club administrator roles
- **team_admins** - Team administrator roles
- **events** - Matches, training sessions, meetings
- **event_participants** - Event attendance tracking
- **payment_requests** - Payment collection system
- **notifications** - User notifications
- **broadcast_messages** - Club/team announcements
- **device_tokens** - Push notification tokens
- **admin_logs** - Administrative action tracking

### Security Model

- **Row Level Security (RLS):** Enabled on all tables
- **Role-based Access:** Super admin, club admin, team admin, member
- **Key Functions:**
  - `user_is_club_admin()`
  - `user_is_team_member_in_club()`
  - `user_is_primary_club_admin()`
  - `is_super_admin()`
  - `check_team_membership()` (SECURITY DEFINER)
- **Authentication:** Supabase Auth with email verification (6-digit OTP)

## Component Library

All custom components follow the "Sh" prefix convention:

### Core Components (25+ components)

- **ShButton** - Configurable button with 6 variants
- **ShText** - Typography with 15 text variants
- **ShIcon** - Icon wrapper (name, size, color props)
- **ShScreenContainer** - Standard screen wrapper
- **ShMapView** - Map integration component
- **ShWelcomeVideo** - Video player for onboarding
- **ShOTPInput** - 6-digit verification code input
- **ShFormField\*** - Form components (Email, Password, Name, Date, Choice)
- **ShAvatar** - User profile image display
- **ShTeamListItem** - Team list row component
- **ShEventListItem** - Event list display
- **ShUserList** - User listing component
- **ShStatsCard** - Statistics display card
- **ShProfileTabs** - Profile view tab navigation
- **ShLogoAndTitle** - App branding component
- **ShSpacer** - Consistent spacing component

## Navigation Architecture

### Routing Structure

- **Stack Navigation:** Expo Stack for top-level navigation (NO custom back buttons)
- **Tab Navigation:** Expo Tabs for bottom navigation (5 tabs)
- **File-based Routing:** Expo Router in `/app` directory
- **Protected Routes:** `/(app)` group requires authentication
- **Public Routes:** `/(auth)` group for authentication flows
- **Deep linking:** Configured with `sporthawk://` scheme

### Current App Flow

1. **Landing** → Welcome screen with video
2. **Auth** → Sign In/Sign Up/Verify Email
3. **Main App** → Tab navigation with:
   - Home (dashboard)
   - Explore (club/team discovery)
   - Teams (user's teams)
   - Alerts (notifications)
   - Profile (user settings)

## Authentication Flow

### UserContext (Single Source of Truth)

All authentication and user state managed through UserContext:

- User authentication state
- Profile data management
- Session persistence
- Sign in/out/up methods
- Email verification handling

### Auth Workflow

1. Email/Password registration with profile creation
2. Email verification via 6-digit OTP
3. Session persistence with AsyncStorage
4. Password reset via email (planned)
5. Social sign-in (Google, Apple - planned)

## Design System

### Color Palette

- **Primary:** Gold (#eabd22)
- **Base:** Dark (#161615)
- **Surface:** Card (#1e1e1d), Border (#333332)
- **Text:** Light (#eceae8), Mid (#b8b6b3), Secondary (#6b6b6a)
- **Semantic:** Success, Error, Info, Warning colors
- **Input Fields:** Specific border and background colors

### Typography Configuration

- **Font Weights:** 400 (regular) to 700 (bold)
- **Font Sizes:** 11px to 34px (xs to xxxl)
- **Text Variants:** 15 predefined variants
- **Line Heights:** Configured per variant

### Development Rules (MANDATORY)

- **NO magic values** - Everything from config files
- **NO TODO comments** without explicit permission
- **FIGMA IS SOURCE OF TRUTH** - Check comprehensively before coding
- **Complete implementation** required before marking complete
- **Component interfaces are sacred** - Don't modify existing components
- **UserContext for all auth** - Never import supabase directly in screens
- **Test with `npm run lint`** before declaring complete

## Current Implementation Status

### Completed Features ✅

- Core authentication flow with email verification
- User profile management with all fields
- Tab navigation structure
- Home screen with feature overview
- Explore screen with club discovery (Fremington FC)
- Teams listing for user's teams
- Event listing and detail views
- Event creation form with date/time pickers
- Profile screen with settings
- Component library foundation (25+ components)
- Database schema with RLS policies
- Map integration for location display

### In Progress 🚧

- Event management refinements
- Team member listings
- Club/team admin interfaces
- Payment request functionality

### Upcoming Features 📋

1. Push notifications for alerts
2. Broadcast messaging system
3. Payment processing with Stripe
4. Social authentication (Google, Apple)
5. Advanced search and filtering
6. Media upload for clubs/teams
7. Match statistics tracking
8. Training session scheduling

## Recent Updates (Last 10 Commits)

- Fix to remove (app) from top navigation
- Home page implementation
- Event detail page with team integration
- Profile improvements and sign out functionality
- Events list implementation
- Event creation fixes
- Avatar display improvements
- Location handling for events
- iOS modal date/time pickers

## Key Challenges & Solutions

### Current Technical Debt

- **Magic values:** Being addressed through strict config enforcement
- **Type safety:** Improved with generated database types
- **Component consistency:** Enforced through Sh prefix convention
- **Navigation patterns:** Standardized with Expo Router/Stack/Tabs

### Lessons Learned (Critical)

- Figma specifications must be checked comprehensively (no assumptions)
- Existing component interfaces must not be modified
- Config values must be used for ALL styling values
- UserContext is the only source for authentication
- Test before declaring complete
- Research before implementing fixes

## Performance Considerations

- Minimize re-renders with proper memoization
- Lazy load heavy components (maps, videos)
- Optimize images with expo-image
- Batch database operations
- Use RLS policies for efficient data access

## Security Measures

- All tables protected with RLS policies
- Role-based access control implemented
- SECURITY DEFINER functions for sensitive operations
- No service role keys exposed
- Input validation on client and server
- Regular security advisor checks

## Development Commands

```bash
# Start development
npm start

# Platform-specific development
npm run ios
npm run android

# Code quality (MANDATORY before commits)
npm run lint

# Build for production
eas build --platform ios
eas build --platform android
```

## Environment Variables Required

```
EXPO_PUBLIC_SUPABASE_URL=https://vwqfwehtjnjenzrhzgol.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=[pending]
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=[pending]
```

## Support & Documentation

### Key Documentation Files

- `/CLAUDE.md` - AI assistant guidelines & rules
- `/LESSONS_LEARNED.md` - Critical development violations to avoid
- `/docs/prd.md` - Product requirements document
- `/docs/architecture.md` - System architecture
- `/docs/front-end-architecture.md` - Frontend specifics
- `/PROJECT_SUMMARY_2025-08-20.md` - Previous project summary

### MCP Integrations Available

- **Supabase MCP** - Database operations, migrations, type generation
- **GitHub MCP** - Repository management, commits, PRs
- **Figma MCP** - Design specifications, UI requirements

## Contact & Resources

- **Project Owner:** SportHawk Ltd
- **Pilot Club:** Fremington FC
- **Target Users:** ~400-500 initial users (18-20 teams)
- **Support Model:** Direct support during MVP phase

## Critical Success Factors

1. **Code Quality:** No magic values, follow config patterns
2. **User Experience:** Pixel-perfect Figma implementation
3. **Performance:** Fast load times, smooth navigation
4. **Reliability:** Comprehensive error handling
5. **Security:** Proper RLS policies, role-based access

---

_This summary represents the current state of SportHawk MVP v4 as of 2025-08-24. The project is in active development with significant progress on core features, targeting a June 13, 2025 launch._
