# SportHawk MVP V4 Development Plan

**Version:** 1.1  
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
- QA persona review of every story

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
2. **Figma-First Design**: ALWAYS consult Figma via MCP before implementing ANY screen
3. **Test-As-You-Go**: Every feature must work in Expo Go before proceeding
4. **Component-First**: Build and verify components before assembling screens
5. **Documentation-as-Code**: Component definitions drive implementation
6. **No Magic Values**: All values must come from configuration files
   - **ICON NAMES**: Must use IconName enum, never string literals (e.g., IconName.VerifyEmail not "mail-check")
   - If icon doesn't exist in enum, STOP and request it to be added
7. **No Local StyleSheets**: NO StyleSheet.create() without explicit human approval
8. **Sh Components Rule**: Use Sh components for all visual elements except allowed RN containers
9. **QA-Verified Development**: QA persona reviews every story after dev completion
10. **Navigation Rules - CRITICAL**:
    - **TOP NAVIGATION**: MUST use Expo Stack component exclusively - NO custom back buttons
    - **BOTTOM NAVIGATION**: MUST use Expo Tabs component exclusively
    - **IGNORE** top navigation bars shown in Figma designs - Stack handles this automatically
    - **NEVER** implement custom back buttons (TouchableOpacity with chevron icons, etc.)
    - Configure Stack.Screen options for titles, headerShown, etc. instead of custom implementations
11. **NO TODO COMMENTS Rule - CRITICAL**:
    - **NEVER** leave TODO comments in code without explicit user permission
    - **NEVER** mark development as complete with outstanding TODOs
    - All functionality MUST be fully implemented before marking complete
    - If unable to implement, ask for permission and provide clear justification
    - Development is NOT complete if any TODOs remain in the code

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
8. Configure Firebase project and add to app:
   - Create Firebase project in console
   - Add iOS and Android apps
   - Download google-services.json and GoogleService-Info.plist
   - Install Firebase SDK packages
   - Initialize Firebase in app entry point
   - Verify Crashlytics and Analytics are receiving data

**Success Criteria**:

- All database tables have appropriate RLS policies
- UserContext fully implemented with all auth methods
- Auth flow from signup → verify → login → home works via UserContext
- User session persists across app restarts
- Firebase monitoring operational
- No magic values in existing code

### Epic 1: Figma-Driven Component Discovery & Documentation

**Objective**: Systematically create all required components with full documentation

**Process for Each Screen** (following sequence 0-25):

1. **MANDATORY Figma Analysis** (MUST DO FIRST)
   - Use MCP to fetch screen design via node ID from sequenced_screen_list.md
   - Get visual image using mcp**figma-dev-mode-mcp-server**get_image
   - Get code specs using mcp**figma-dev-mode-mcp-server**get_code
   - Extract component requirements from Figma
   - Identify visual specifications from Figma
   - NEVER implement a screen without Figma consultation

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
5. NO StyleSheet.create() - use inline styles with config values only
6. Allowed RN components: SafeAreaView, ScrollView, View, Alert, TouchableOpacity only
7. All other visual components MUST be Sh components (no Text, TextInput, etc.)
8. Test in Expo Go before marking complete

**Development Workflow per Story**:

1. Dev agent implements the story
2. Dev agent reports completion
3. QA persona performs quality assurance review
4. AI starts Expo Go for initial testing
5. Human performs manual testing
6. Story marked complete only after all checks pass

**Quality Checklist per Screen**:

- [ ] All components from definition file used
- [ ] No magic values (lint check)
- [ ] Works in Expo Go (AI verified)
- [ ] Works in Expo Go (Human verified)
- [ ] Navigation connects properly
- [ ] Matches Figma design
- [ ] QA persona approval received

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

### Allowed React Native Components

**Container/Layout Components (ALLOWED)**:

- `SafeAreaView` - For safe area handling
- `ScrollView` - For scrollable content
- `View` - For layout containers
- `TouchableOpacity` - For touchable areas
- `Alert` - For system alerts

**Visual Components (FORBIDDEN - Use Sh equivalents)**:

- ❌ `Text` → Use `ShText`
- ❌ `TextInput` → Use `ShFormField*` components
- ❌ `Button` → Use `ShButton`
- ❌ `Image` → Use `ShIcon` or create `ShImage`
- ❌ `Switch` → Create `ShSwitch` if needed
- ❌ `ActivityIndicator` → Create `ShLoader` if needed

**StyleSheet (FORBIDDEN)**:

- ❌ `StyleSheet.create()` - Never use
- ✅ Inline styles with config values only

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

### QA Process

**Every story follows this QA workflow:**

1. **Dev Completion**: Dev agent reports story done
2. **QA Review**: QA persona performs comprehensive review
   - Code quality check
   - Standards compliance
   - Magic values detection
   - Component usage verification
3. **Automated Testing**: AI starts Expo Go and performs basic checks
4. **Manual Testing**: Human tester validates functionality
5. **Sign-off**: Story only closed after QA approval

### Testing Workflow

1. **AI Testing Phase**:
   - AI starts Expo Go using `npm run start`
   - Navigates to implemented screen
   - Performs basic interaction tests
   - Reports any crashes or errors
2. **Human Testing Phase**:
   - Human takes over from AI
   - Performs thorough manual testing
   - Tests edge cases and user flows
   - Validates against requirements
3. **QA Approval**:
   - QA persona reviews all test results
   - Approves or requests fixes
   - Documents any issues found

### Per-Component QA

1. Matches Figma design specifications
2. Uses configuration values only
3. Exports through barrel file
4. Has TypeScript types
5. QA persona review completed

### Per-Screen QA

1. Figma design was consulted BEFORE implementation
2. Component definition file complete
3. Only uses documented components
4. Matches Figma visual design exactly
5. Passes linting (no magic values)
6. Works in Expo Go (AI test)
7. Works in Expo Go (Human test)
8. Navigation functions correctly
9. QA persona approval documented

### Per-Epic QA

1. All screens in sequence range complete
2. Flow testing passes (AI + Human)
3. No regression in previous screens
4. Performance acceptable
5. QA persona final sign-off

## Agent Roles and Responsibilities

### Development Agent

- Implements stories according to specifications
- Follows coding standards strictly
- Reports completion to QA persona
- Fixes issues identified by QA
- Ensures no magic values in code

### QA Persona (AI-Embodied under BMAD)

- AI embodies the QA persona when requested
- Reviews every story after dev completion
- Checks for magic values and standards compliance
- Verifies component usage against definitions
- Validates implementation against Figma designs
- Approves stories or requests fixes
- Documents QA findings and issues
- Ensures testing is completed before approval

### QA Rejection Criteria & Rework Process

**Automatic Rejection Criteria:**

1. **Critical (Immediate Rejection)**:
   - Any magic values (inline styles, hardcoded strings/numbers)
   - Component not matching Figma design
   - App crashes in Expo Go
   - Navigation broken
   - Missing TypeScript types
   - Direct Supabase calls instead of UserContext

2. **Major (Fix Required)**:
   - Components not from definition file
   - Inconsistent naming conventions
   - Missing configuration usage
   - Failed linting
   - Poor error handling

3. **Minor (Fix Recommended)**:
   - Code formatting issues
   - Missing comments for complex logic
   - Inefficient implementations
   - Console.log statements left in code

**Rework Process:**

1. **QA Rejection**:
   - QA documents specific issues found
   - Categorizes by severity (Critical/Major/Minor)
   - Provides clear fix requirements
2. **Dev Rework**:
   - Dev agent addresses all Critical and Major issues
   - Dev agent considers Minor recommendations
   - Dev agent reports completion of fixes
3. **Re-Review**:
   - QA re-reviews only the changed code
   - Verifies issues are resolved
   - Either approves or requests additional fixes
4. **Escalation**:
   - After 2 rejection cycles, human intervention required
   - Human decides whether to accept with issues or continue rework

### Testing Process

1. **AI Testing**:
   - AI starts Expo Go using `npm run start`
   - Performs automated navigation and basic checks
   - Reports any crashes or obvious issues
2. **Human Testing**:
   - Manual testing by human operator
   - Validates all functionality and edge cases
   - Confirms visual match to Figma designs
3. **QA Sign-off**:
   - Final approval from QA persona
   - Story closed only after QA approval

## Technical Assumptions

- **Core Technology Stack:** The **latest stable Expo SDK** (at the time of writing, v53.0.0), React Native, TypeScript, Supabase (PostgreSQL, Auth, Storage, Functions), Stripe, Firebase (Crashlytics & Analytics). **`expo-video` MUST be used for video playback.**
- **Repository & Service Architecture:** Monorepo (Expo app + Supabase functions). Serverless Functions within a BaaS model.
- **Development Methodology & Tools:** A strong component-based architecture is required. Screen files in `/app` must be simple compositions of reusable `Sh...` components. Styling and logic must be encapsulated within these components. The `ad-expo-react-native-style-guide.md` is mandatory.
- **Quality Assurance Process:** Every story must be reviewed by QA persona after dev completion. Testing involves AI starting Expo Go for initial verification, followed by human manual testing.
- **Testing Requirements (Summary):** Unit testing (Jest, 70-80%), Integration testing (App-Supabase), Manual testing of all ACs on all mobile platforms, and UAT with Fremington FC. **Test-Driven Development (TDD) is not a requirement.**
- **Testing Workflow:** AI starts Expo Go and performs initial verification, followed by human tester conducting thorough manual testing. QA persona reviews test results and approves/rejects.

## Monitoring and Analytics

### Firebase Integration

- **Crashlytics**: Real-time crash reporting and analysis
- **Analytics**: User behavior tracking and custom events
- **Performance Monitoring**: App performance metrics
- **Implementation**: Integrated at app initialization

## Risk Mitigation

### Risk: Component Sprawl

**Mitigation**: Regular component audit, combine similar components

### Risk: Figma Drift

**Mitigation**: Document analysis date, re-check if designs change

### Risk: Magic Values Creeping In

**Mitigation**: Automated linting, QA reviews, reject non-compliant code

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
- Firebase monitoring operational
- QA approval for all stories

## Appendices

### A. Reference Documents

- `/docs/sequenced_screen_list.md` - Screen priorities
- `/docs/_all-screens-titles-and-figma-ids.md` - Figma reference
- `/docs/ad-expo-react-native-style-guide.md` - Coding standards
- `/CLAUDE.md` - AI assistant instructions
- `/docs/authentication-context-spec.md` - Auth implementation

### B. Lessons from V3

1. Never skip Epic Zero
2. ALWAYS consult Figma BEFORE implementing screens
3. Test in Expo Go continuously
4. Enforce standards programmatically
5. Build sequentially, not in parallel
6. Human decisions, AI execution
7. QA review prevents quality drift
8. Visual design comes from Figma, not assumptions

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
- [ ] QA persona reviewed

## Change Log

| Date       | Version | Changes                                                                             | Author            |
| ---------- | ------- | ----------------------------------------------------------------------------------- | ----------------- |
| 2025-08-11 | 1.0     | Initial development plan based on V3 learnings                                      | BMad Orchestrator |
| 2025-08-11 | 1.1     | Added QA persona workflow, testing process, and Firebase monitoring                 | BMad Orchestrator |
| 2025-08-11 | 1.2     | MANDATORY Figma-first approach added after V4 implementation error                  | BMad Orchestrator |
| 2025-08-11 | 1.3     | Banned StyleSheet.create(), mandated Sh components, clarified allowed RN components | BMad Orchestrator |
