# Architecture Document: SportHawk MVP

**Version:** 2.0  
**Date:** 2025-09-03  
**Status:** Active - Brownfield Project Architecture  
**Project State:** ~10% Complete with Core Infrastructure Established

## 1. Introduction

This document describes the ACTUAL IMPLEMENTED architecture of the SportHawk MVP brownfield project. It serves as the technical blueprint for extending the existing system while preserving all working functionality.

### Document Principles

- Documents what **IS** implemented, not what should be
- Provides patterns for **EXTENDING** existing architecture
- References actual code examples from the codebase
- Defines constraints for brownfield development

## 2. System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Mobile Apps                        │
│          (iOS & Android via Expo SDK 53)            │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                │
│  │  Expo Router │  │ Sh Component │                │
│  │  Navigation  │  │    Library   │                │
│  └──────────────┘  └──────────────┘                │
│                                                      │
│  ┌──────────────────────────────────┐              │
│  │        API Layer (/lib/api)       │              │
│  └──────────────────────────────────┘              │
└─────────────────────┬───────────────────────────────┘
                      │ HTTPS
    ┌─────────────────▼───────────────────┐
    │         Supabase Platform           │
    │  ┌─────────┐  ┌──────────────┐    │
    │  │   Auth  │  │  PostgreSQL  │    │
    │  └─────────┘  └──────────────┘    │
    │  ┌─────────┐  ┌──────────────┐    │
    │  │ Storage │  │Edge Functions│    │
    │  └─────────┘  └──────────────┘    │
    └──────────────────────────────────────┘
                      │
    ┌─────────────────▼───────────────────┐
    │        External Services            │
    │   Stripe Connect | Expo Push        │
    └──────────────────────────────────────┘
```

### Technology Stack (Implemented)

| Layer            | Technology          | Version      | Purpose                  |
| ---------------- | ------------------- | ------------ | ------------------------ |
| Mobile App       | React Native + Expo | SDK 53       | Cross-platform mobile    |
| Language         | TypeScript          | Strict Mode  | Type safety              |
| Navigation       | Expo Router         | File-based   | Screen routing           |
| UI Components    | Custom Sh\* Library | -            | Reusable UI              |
| State Management | React Context       | -            | Auth state (UserContext) |
| Backend          | Supabase            | -            | BaaS platform            |
| Database         | PostgreSQL          | via Supabase | Data persistence         |
| Authentication   | Supabase Auth       | -            | User management          |
| File Storage     | Supabase Storage    | -            | Media files              |
| Serverless       | Edge Functions      | Deno/TS      | Business logic           |
| Payments         | Stripe Connect      | -            | Payment processing       |

## 3. Frontend Architecture

### Folder Structure (Actual)

```
/SportHawk_MVP_v4
├── /app                    # Screen files (Expo Router)
│   ├── /(auth)            # Authentication screens
│   ├── /(tabs)            # Tab navigation screens
│   ├── /events            # Event-related screens
│   ├── /teams             # Team-related screens
│   ├── /user              # User profile screens
│   └── _layout.tsx        # Root layout with Stack
├── /components            # Sh* prefixed components
│   ├── index.ts          # Barrel exports
│   └── [ShComponents]    # Individual components
├── /config               # Global configuration
│   ├── colors.ts         # Color palette
│   ├── icons.ts          # IconName enum
│   ├── spacing.ts        # Spacing values
│   ├── typography.ts     # Text styles
│   └── buttons.ts        # Button variants
├── /contexts             # React contexts
│   └── UserContext.tsx   # Authentication state
├── /lib                  # Libraries and integrations
│   ├── /api             # API layer (MANDATORY)
│   └── supabase.ts      # Supabase client
├── /types               # TypeScript definitions
│   └── database.ts      # Supabase types
└── /assets              # Static resources
    ├── /icons          # Icon files
    └── /videos         # Video files
```

### Path Aliases (tsconfig.json)

```typescript
{
  "@top/*": ["*"],           // Root directory
  "@app/*": ["app/*"],       // Screen files
  "@ass/*": ["assets/*"],    // Assets
  "@cmp/*": ["components/*"], // Components
  "@cfg/*": ["config/*"],    // Configuration
  "@ctx/*": ["contexts/*"],  // Contexts
  "@lib/*": ["lib/*"],       // Libraries
  "@typ/*": ["types/*"]      // Types
}
```

### Component Architecture

#### Component Naming Pattern

All custom components use "Sh" prefix:

- `ShButton` - Standard button component
- `ShText` - Text with typography config
- `ShFormFieldEmail` - Email input field
- `ShScreenContainer` - Screen wrapper
- `ShLoadingSpinner` - Standardized loading indicator

#### Component File Organization - MANDATORY

Every component MUST follow this structure:

```
components/
  ShComponentName/
    ShComponentName.tsx   # Component implementation
    index.ts             # Export file
```

**Component Implementation (ShComponentName.tsx):**

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colorPalette } from '@cfg/colors';
import { spacing } from '@cfg/spacing';

interface ShComponentNameProps {
  title: string;
}

export function ShComponentName({ title }: ShComponentNameProps) {
  return (
    <View style={styles.container}>
      {/* Component implementation */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colorPalette.background,
  },
});
```

**Component Export (index.ts):**

```typescript
export { ShComponentName } from './ShComponentName';
```

#### Barrel Export Pattern - Alphabetical Order Required

Reference: `/components/index.ts`

```typescript
export { ShAvatar } from './ShAvatar';
export { ShButton } from './ShButton';
export { ShCheckbox } from './ShCheckbox';
export { ShIcon } from './ShIcon';
export { ShLoadingSpinner } from './ShLoadingSpinner';
export { ShLogoAndTitle } from './ShLogoAndTitle';
// MUST maintain strict alphabetical order
```

#### Screen Implementation Patterns

**Zero Local Styles Policy:**
Screens MUST NOT contain StyleSheet definitions:

```typescript
// ❌ WRONG - Local styles in screen
export default function PaymentScreen() {
  return <View style={styles.container}>...</View>;
}
const styles = StyleSheet.create({ ... }); // FORBIDDEN

// ✅ CORRECT - All styling via Sh components
export default function PaymentScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.background }}>
      <ShScreenContainer>
        {/* Content using Sh components */}
      </ShScreenContainer>
    </SafeAreaView>
  );
}
```

**iOS SafeAreaView Requirement:**
All screens MUST wrap content for iOS compatibility:

```typescript
import { SafeAreaView } from 'react-native';

export default function ScreenName() {
  return (
    <>
      <Stack.Screen options={{ ... }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.background }}>
        <ShScreenContainer>
          {/* Screen content */}
        </ShScreenContainer>
      </SafeAreaView>
    </>
  );
}
```

**Loading State Patterns:**

```typescript
// Initialize to true for data-fetching screens
const [loading, setLoading] = useState(true);

if (loading) {
  return (
    <>
      <Stack.Screen options={{ title: 'Title', headerShown: true }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.background }}>
        <ShScreenContainer>
          <ShLoadingSpinner /> {/* Never use inline ActivityIndicator */}
        </ShScreenContainer>
      </SafeAreaView>
    </>
  );
}
```

### Navigation Architecture

#### Stack Navigation (Top)

When root layout has `headerShown: false`, screens must explicitly enable headers:

```typescript
<Stack.Screen
  options={{
    title: "Create Event",
    headerShown: true,  // Required when root has headerShown: false
    headerStyle: {
      backgroundColor: colorPalette.black,
    },
    headerTintColor: colorPalette.white,
    headerLeft: () => <CustomBackArrow />,
    headerRight: () => <ShHeaderButton ... />
  }}
/>
```

#### Tab Navigation (Bottom)

Reference: `/app/(tabs)/_layout.tsx`

```typescript
<Tabs>
  <Tabs.Screen name="home" options={{ tabBarIcon: ... }} />
  <Tabs.Screen name="teams" options={{ tabBarIcon: ... }} />
  // 5 tabs total: Home, Teams, Explore, Alerts, Profile
</Tabs>
```

## 4. Backend Architecture

### Supabase Configuration

#### Project Structure

```
EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
```

#### Database Schema Pattern

Reference: `/types/database.ts`

- Generated types from Supabase
- Strict TypeScript interfaces
- Row Level Security enabled

### API Layer Pattern

#### MANDATORY: No Direct Database Access in Screens

```typescript
// Pattern from /lib/api/users.ts
export const userApi = {
  async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: Partial<User>) {
    // Implementation
  },
};
```

#### Screen Usage Pattern

```typescript
// In screen files
import { userApi } from '@lib/api/users';

// NOT: import { supabase } from '@lib/supabase';
const user = await userApi.getUser(userId);
```

### Authentication Architecture

#### UserContext Pattern (Single Source of Truth)

Reference: `/contexts/UserContext.tsx`

- All auth operations through context
- Manages user state globally
- Handles token refresh
- Provides auth methods

#### Usage in Screens

```typescript
import { useUser } from '@ctx/UserContext';

function ProfileScreen() {
  const { user, signOut } = useUser();
  // Never import supabase directly for auth
}
```

## 5. Configuration System

### Design System Implementation

#### Color Configuration

Reference: `/config/colors.ts`

```typescript
export const colorPalette = {
  primary: '#eabd22', // Gold
  background: '#161615', // Dark base
  white: '#ffffff',
  // All colors as named constants
};

export type ColorName = keyof typeof colorPalette;
```

#### Typography Configuration

Reference: `/config/typography.ts`

```typescript
export const fontSizes = {
  small: 12,
  medium: 16,
  large: 20,
  // Correlates with Figma text styles
};

export const fontWeights = {
  regular: '400',
  semiBold: '600',
  bold: '700',
};
```

#### Spacing Configuration

Reference: `/config/spacing.ts`

```typescript
export const spacing = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  borderWidthThin: 1,
  borderRadiusSmall: 4,
  // No magic numbers in code
};
```

### Icon System

Reference: `/config/icons.ts`

```typescript
export enum IconName {
  Home = 'home',
  VerifyEmail = 'verify-email',
  ChevronLeft = 'chevron-left',
  // NEVER use string literals for icons
}
```

## 6. State Management

### Current Implementation

- **Authentication**: UserContext (global)
- **Form State**: Local component state
- **Navigation State**: Expo Router managed
- **API Cache**: React Query (planned)

### Data Flow Pattern

```
Screen → API Layer → Supabase → Response → Screen Update
         ↓
    UserContext (for auth operations only)
```

## 7. Extension Patterns

### Adding New Screens

1. **Create screen file** in appropriate `/app` folder
2. **Import Sh components** via `@top/components`
3. **Use config values** - no magic numbers
4. **Follow navigation pattern** from existing screens
5. **Use API layer** for data operations

Example Pattern:

```typescript
// /app/newfeature/screen.tsx
import { ShScreenContainer, ShText, ShButton } from '@top/components';
import { useUser } from '@ctx/UserContext';
import { newFeatureApi } from '@lib/api/newfeature';

export default function NewFeatureScreen() {
  // Implementation following existing patterns
}
```

### Adding New Components

1. **Create component** with Sh prefix
2. **Use config values** exclusively
3. **Export via** `/components/index.ts`
4. **Document props** with TypeScript

### Adding New API Endpoints

1. **Create new file** in `/lib/api/`
2. **Follow existing pattern** from other API files
3. **Handle errors** consistently
4. **Return typed data**

## 8. Brownfield Constraints

### DO NOT MODIFY

- Existing working screens without approval
- Core Sh component library interfaces
- UserContext authentication flow
- Database schema without migration
- Navigation structure

### MUST FOLLOW

- Existing folder structure
- Component naming (Sh prefix)
- API layer pattern
- Config value usage
- Path alias conventions

### EXTEND BY

- Adding new screens using patterns
- Creating new Sh components as needed
- Adding API endpoints following pattern
- Adding config values (never magic numbers)
- Using existing navigation patterns

## 9. Development Workflow

### Story Implementation Steps

1. Review requirements and Figma
2. Identify needed Sh components
3. Check existing API patterns
4. Implement following patterns
5. Test on both platforms
6. Verify no regressions
7. Run lint and TypeScript checks

### Code Review Checklist

- [ ] Uses existing Sh components
- [ ] No magic values (all from config)
- [ ] Follows API layer pattern
- [ ] Icons use IconName enum
- [ ] Navigation uses Stack/Tabs
- [ ] No direct Supabase imports in screens
- [ ] TypeScript compiles without errors
- [ ] Matches Figma exactly

## 10. Performance Considerations

### Current Optimizations

- Image optimization via `expo-image`
- Video via `expo-video` (not expo-av)
- Lazy loading for heavy screens
- Memoization of expensive computations

### Guidelines

- Keep screen components lightweight
- Move logic to API layer
- Use React.memo for list items
- Implement pagination for large lists

## 11. Security Architecture

### Authentication Flow

1. User enters credentials
2. UserContext handles auth
3. Supabase validates
4. Token stored securely
5. Auto-refresh managed

### Data Security

- Row Level Security on all tables
- API keys in environment variables
- No sensitive data in logs
- Secure token storage via Expo

## 12. Deployment Architecture

### Build Process

```bash
# Development
npm start

# Production builds via EAS
eas build --platform ios
eas build --platform android
```

### Environment Configuration

- Development: `.env.development`
- Production: `.env.production`
- Managed via EAS Build secrets

## Appendices

### A. Key Reference Files

- `/app/events/create-event.tsx` - Navigation pattern
- `/components/ShButton.tsx` - Component pattern
- `/lib/api/users.ts` - API pattern
- `/contexts/UserContext.tsx` - Auth pattern

### B. Database Tables (Existing)

- `users` - User profiles
- `teams` - Team entities
- `team_members` - Membership relations
- `events` - Event records
- `payments` - Payment records (planned)
- `payment_requests` - Payment requests (planned)

### C. External Dependencies

- Expo SDK 53
- @supabase/supabase-js
- @stripe/stripe-react-native
- expo-router
- React Native core libraries
