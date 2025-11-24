# SportHawk MVP V4 Development Plan

**Version:** 1.0  
**Date:** 2025-08-11  
**Status:** Active  
**Author:** BMad Orchestrator with Human Lead

## Executive Summary

This document outlines the revised development approach for SportHawk MVP V4, incorporating lessons learned from V3's failure. The new approach emphasizes:

- Figma-driven component discovery
- Interactive component creation with human approval
- Systematic documentation of screen compositions
- Zero magic values enforcement
- Continuous testing in Expo Go

## Background: V3 Failure Analysis

### Critical Issues Identified

1. **Epic Dependencies**: Epic 2 depended on Epic 6, breaking Expo Go compatibility
2. **Context Confusion**: Dev agents couldn't distinguish brownfield vs greenfield
3. **Missing Infrastructure**: Epic Zero (foundation) was not properly implemented
4. **Standards Violations**: 10,000+ magic values despite explicit coding standards

### Root Causes

- AI agents operated without understanding project context
- Documentation-heavy approach with insufficient working code
- Lack of incremental testing
- No enforcement mechanism for coding standards

## V4 Development Philosophy

### Core Principles

1. **Human-Led, AI-Assisted**: Humans make architectural decisions; AI executes bounded tasks
2. **Test-As-You-Go**: Every feature must work in Expo Go before proceeding
3. **Component-First**: Build and verify components before assembling screens
4. **Documentation-as-Code**: Component definitions drive implementation
5. **No Magic Values**: All values must come from configuration files

### Development Sequence

Follow `/docs/sequenced_screen_list.md` strictly (Ashton's prioritized list dated Aug 2, 2025)

## Epic Structure

### Epic 0: Foundation QA & Setup

**Objective**: Ensure solid foundation before feature development

**Tasks**:

1. Database schema review and QA (carried from V3)
2. Verify Supabase RLS policies
3. Complete UserContext implementation with Supabase auth
4. Ensure auth flow works end-to-end via UserContext
5. Wrap app layouts with UserProvider
6. Review existing components against style guide
7. Validate configuration system (colors, spacing, typography)

**Success Criteria**:

- All database tables have appropriate RLS policies
- UserContext fully implemented with all auth methods
- Auth flow from signup → verify → login → home works via UserContext
- User session persists across app restarts
- No magic values in existing code

### Epic 1: Figma-Driven Component Discovery & Documentation

**Objective**: Systematically create all required components with full documentation

**Process for Each Screen** (following sequence 0-25):

1. **Figma Analysis**
   - Use MCP to fetch screen design via node ID
   - Extract component requirements
   - Identify visual specifications

2. **Component Definition Documentation**
   - Create `/docs/screen-components/[seq]-[screen-name].md`
   - Document all required components
   - Mark existing vs needed components
   - Include props, configuration, and navigation

3. **Interactive Component Creation**
   - For each missing component:
     - AI presents component specification from Figma
     - Human approves/modifies specification
     - AI creates component following Sh pattern
     - Test component in isolation
     - Update component definition file

4. **Component Library Management**
   - Add to `/components/` with Sh prefix
   - Export through `/components/index.ts`
   - Follow existing patterns from ShButton, ShText, etc.

**Documentation Structure**:

```
/docs/screen-components/
  000-app-open-loading.md
  000-welcome.md           # Document existing
  001-sign-up.md          # Document existing
  002-sign-in.md
  003-forgot-password.md
  ... (continue through sequence)
```

**Component Definition Template**:

```markdown
# [Screen Name] ([Node ID])

Sequence: [number]
Status: [Planning|In Progress|Components Complete|Implemented|Tested]

## Figma Analysis

- Node ID: [id]
- Last analyzed: [date]

## Required Components

### [Category]

- [x] ComponentName - Status
  - Special requirements
  - Variants needed

## Component Props & Configuration

[TypeScript interfaces and config]

## Navigation

- Previous: [screen]
- Success: [screen]
- Alternative: [screen]

## Implementation Notes

[Specific requirements from Ashton's list]
```

### Epic 2: Screen Assembly

**Objective**: Build screens using only verified components

**Implementation Rules**:

1. Only use components documented in definition files
2. Follow `index.tsx` and `SignUp.tsx` patterns exactly
3. All values from configuration files
4. No inline styles or magic numbers
5. Test in Expo Go before marking complete

**Quality Checklist per Screen**:

- [ ] All components from definition file used
- [ ] No magic values (lint check)
- [ ] Works in Expo Go
- [ ] Navigation connects properly
- [ ] Matches Figma design

### Epic 3: Navigation & Flow Integration

**Objective**: Connect screens into complete user flows

**Flow Groups** (per sequenced list):

1. **Authentication Flow** (Seq 0-4)
   - App Open → Welcome → Sign Up/In → Verify → Complete

2. **Core User Flow** (Seq 5-14)
   - Profile → Events → Event Details → Squad Management

3. **Payment Flow** (Seq 15-20)
   - Payment list → Create → Details → Admin views

4. **Member Management** (Seq 21-23)
   - Members → Manage → Add

5. **Discovery Flow** (Seq 24-25)
   - Explore Map → Team About → Join

## Implementation Timeline

### Week 1: Foundation & Authentication

- Days 1-2: Epic 0 (Foundation QA)
- Days 3-5: Screens 0-4 (Auth flow complete)
- Deliverable: Working authentication in TestFlight

### Week 2: Core Features

- Days 1-3: Screens 5-9 (Profile & Events basics)
- Days 4-5: Screens 10-14 (Events advanced)
- Deliverable: Event management working

### Week 3: Payments & Discovery

- Days 1-2: Screens 15-20 (Payments)
- Days 3-4: Screens 21-25 (Members & Explore)
- Day 5: Integration testing
- Deliverable: MVP feature complete

## Technical Standards

### Authentication Architecture

- **UserContext** (`/contexts/UserContext.tsx`): Centralized auth state management
  - Wraps entire app via root `_layout.tsx`
  - Provides user session state
  - Handles all Supabase auth operations (signIn, signUp, signOut, verify)
  - Manages session persistence and recovery
  - Single source of truth for auth state

- **useUser Hook** (`/hooks/useUser.ts`): Clean interface to UserContext
  - Used in screens to access user state
  - Used in screens to trigger auth actions
  - Throws error if used outside UserProvider

### Component Naming

- All custom components prefixed with `Sh`
- Descriptive names: `ShFormFieldEmail`, not `ShInput1`
- Variants as enums: `ShButtonVariant.Primary`

### Configuration Structure

```
/config/
  colors.ts       # ColorName type, colorPalette object
  spacing.ts      # Spacing constants
  typography.ts   # ShTextVariant enum, typography config
  buttons.ts      # ShButtonVariant enum, button styles
```

### File Organization

```
/app/                 # Expo Router screens
  (auth)/            # Auth screens
  (tabs)/            # Main app tabs
  _layout.tsx        # Root layout

/components/         # Reusable components
  ShButton/
    ShButton.tsx
    index.ts
  index.ts           # Barrel export

/docs/
  screen-components/ # Component definitions
  sequenced_screen_list.md
```

### Code Patterns

**Authentication Context Pattern**:

```typescript
// UserContext wraps the app in _layout files
// Provides centralized auth state and methods
import { UserProvider } from '@ctx/UserContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack>
        {/* screens */}
      </Stack>
    </UserProvider>
  );
}
```

**Screen Pattern** (from index.tsx):

```typescript
import { components } from '@top/components';
import { config } from '@cfg/[specific-config]';
import { useUser } from '@hks/useUser';

export default function ScreenName() {
  const { user, userSignIn, userSignOut } = useUser();
  // Handlers using context methods
  // Return JSX using only Sh components
}
```

**Component Pattern** (from existing Sh components):

```typescript
import { config } from '@cfg/[specific-config]';

interface ShComponentProps {
  // Strongly typed props
}

export const ShComponent: React.FC<ShComponentProps> = props => {
  // Implementation using config values
};
```

## Quality Assurance

### Per-Component QA

1. Matches Figma design specifications
2. Uses configuration values only
3. Exports through barrel file
4. Has TypeScript types

### Per-Screen QA

1. Component definition file complete
2. Only uses documented components
3. Passes linting (no magic values)
4. Works in Expo Go
5. Navigation functions correctly

### Per-Epic QA

1. All screens in sequence range complete
2. Flow testing passes
3. No regression in previous screens
4. Performance acceptable

## Risk Mitigation

### Risk: Component Sprawl

**Mitigation**: Regular component audit, combine similar components

### Risk: Figma Drift

**Mitigation**: Document analysis date, re-check if designs change

### Risk: Magic Values Creeping In

**Mitigation**: Automated linting, PR reviews, reject non-compliant code

### Risk: Expo Go Breakage

**Mitigation**: Test every screen before moving to next

## Success Criteria

### MVP Success (June 13, 2025)

- All screens in sequence 0-25 implemented
- Authentication flow complete
- Event management functional
- Payment requests working
- Club discovery via map operational
- Deployed to TestFlight/Play Store
- Fremington FC pilot feedback positive

### Technical Success

- Zero magic values in codebase
- All screens work in Expo Go
- Component definition files complete
- Figma designs accurately implemented
- Code follows established patterns

## Appendices

### A. Reference Documents

- `/docs/sequenced_screen_list.md` - Screen priorities
- `/docs/_all-screens-titles-and-figma-ids.md` - Figma reference
- `/docs/ad-expo-react-native-style-guide.md` - Coding standards
- `/CLAUDE.md` - AI assistant instructions

### B. Lessons from V3

1. Never skip Epic Zero
2. Test in Expo Go continuously
3. Enforce standards programmatically
4. Build sequentially, not in parallel
5. Human decisions, AI execution

### C. Component Creation Checklist

- [ ] Figma design analyzed
- [ ] Component spec documented
- [ ] Human approval received
- [ ] Component created with Sh prefix
- [ ] Configuration values used
- [ ] TypeScript types defined
- [ ] Exported through barrel
- [ ] Definition file updated
- [ ] Tested in isolation

## Change Log

| Date       | Version | Changes                                        | Author            |
| ---------- | ------- | ---------------------------------------------- | ----------------- |
| 2025-08-11 | 1.0     | Initial development plan based on V3 learnings | BMad Orchestrator |
