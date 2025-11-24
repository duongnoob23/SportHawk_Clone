# Product Requirements Document (PRD): SportHawk MVP

**Version:** 2.0  
**Date:** 2025-09-03  
**Status:** Active - Brownfield Project  
**Project State:** ~10% Complete with Core UI/Design System Implemented

## 1. Executive Summary

### Current State

SportHawk is now a BROWNFIELD project with foundational infrastructure in place:

- ✅ Core Design System implemented (Sh\* components)
- ✅ Authentication flow complete
- ✅ Navigation structure established
- ✅ Supabase integration configured
- ✅ ~10% of screens implemented

### Development Approach

This PRD defines an EPIC-based incremental development approach where:

- Each EPIC delivers complete, tested functionality
- Development proceeds one story at a time
- Existing working code is preserved and extended
- All implementations follow established patterns

## 2. Goal, Objective and Context

### Overall Goal

SportHawk aims to be the ultimate hub for sports communities, starting with grassroots football clubs. The platform reduces administrative overhead for volunteer-run clubs while enabling members to easily connect and participate in club activities.

### Core Problem

Grassroots sports clubs face significant administrative burdens in managing:

- Event scheduling and squad selection
- Player availability tracking
- Payment collection and management
- Team communications

### Brownfield Objectives

1. **Preserve Working Foundation**: Maintain all existing functionality while extending
2. **Incremental Value Delivery**: Deploy features EPIC by EPIC
3. **Pattern Consistency**: Follow established architectural patterns
4. **Quality First**: One story at a time with full testing

### Context

- **Pilot Club**: Fremington FC (~18-20 teams)
- **Platform**: Native iOS and Android apps (Expo SDK 53)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Design**: Pixel-perfect Figma implementation

## 3. Success Metrics

### Development Metrics

- Zero regression bugs per EPIC
- 100% lint compliance before deployment
- All screens match Figma designs exactly
- API response times <2 seconds

### User Metrics (Post-Launch)

- Admin satisfaction score >4.0/5.0
- 75% of teams actively using core features weekly
- Task completion rate >90% for admin functions
- User retention rate >60%

## 4. Development Principles

### Core Principles (From Sep'2025 Guidelines)

1. **Pixel-Perfect UI**: Exact Figma implementation
2. **Extend, Don't Replace**: Build upon existing working code
3. **One Story at a Time**: Complete, test, then continue
4. **EPIC-Based Delivery**: Each EPIC is a deployable increment
5. **Senior Developer Approach**: 70% thinking/research, 30% coding
6. **No Magic Values**: All values from configuration

### Technical Constraints

- MUST use existing Sh\* component library
- MUST use established API patterns in `/lib/api`
- MUST follow path aliases from `tsconfig.json`
- MUST use Expo Stack/Tabs for navigation
- NEVER alter working code without explicit approval

### Implementation Hierarchy and Conflict Resolution

When conflicts exist between documentation sources:

1. **Written specifications in /docs folder** (HIGHEST PRIORITY)
2. **Figma designs** (visual reference only)
3. **User clarifications during development**

## 5. UI/UX Requirements

### Component Usage Requirements

All UI implementations MUST:

1. **Verify component interfaces** before use (see `/docs/architecture/component-interfaces.md`)
2. **Use exact prop names** - never assume (e.g., `value` not `selectedValue`, `onChange` not `onChangeValue`)
3. **Follow established patterns** from reference implementations
4. **Implement proper form lifecycle** with mount/unmount cleanup
5. **Track field interactions** before showing validation errors

### Form Development Standards

Every form MUST:

- Clear state on mount (except when returning from sub-navigation)
- Show validation errors ONLY after user interaction
- Use `touchedFields` state to track interactions
- Properly handle sub-screen navigation without losing data
- Use correct field types (DateTime when time is needed, not just Date)

### Navigation Requirements

All screens, especially sub-screens MUST:

- Have `headerShown: true` for proper navigation
- Include back navigation capability
- Use semantic colors (`baseDark` not `black`, `lightText` not `white`)
- Show proper loading states (initialized to `true` for data-fetching)
- Include action buttons in headers where appropriate

### Color System Requirements

Strict semantic color usage:

- Dark backgrounds: `colorPalette.baseDark` (NOT `black`)
- Light text: `colorPalette.lightText` (NOT `white`)
- Input text: `colorPalette.textLight` (NOT `textPrimary`)
- Primary actions: `colorPalette.primaryGold` (NOT hex values)
- Borders: `colorPalette.borderInputField` (NOT `border`)

### Validation UX Requirements

Form validation MUST:

1. Never show errors on initial load
2. Track which fields have been touched
3. Only display errors after field interaction
4. Show all errors when submit is attempted
5. Provide user-friendly error messages

### Reference Implementation Pattern

**MANDATORY for all new screens:**

1. Identify similar existing screen (e.g., `/app/events/create-event.tsx`)
2. Copy exact patterns and structure
3. Modify only business logic and specific fields
4. Document reference in PR description
5. Complete form development checklist (`/docs/dev-guidelines/form-development-checklist.md`)

### UI Testing Requirements

Before ANY UI submission:

- Verify all prop names match component interfaces
- Test all navigation paths including back navigation
- Ensure form clears properly on entry/exit
- Confirm errors only show after interaction
- Check all colors use semantic names
- Verify against Figma design
- Complete the form development checklist

## 6. Documentation Precedence

1. **Written Specifications** (/docs folder)
   - PRD documents (this document)
   - Epic definitions (epic-\*.md files)
   - Design specifications (design-\*.md files)
   - Story requirements in epic files
2. **Figma Designs** (visual reference only)
   - Use for layout and visual styling
   - Semantic style names via MCP tools
   - Component structure
3. **User Clarifications** (during development)
   - Override only with explicit approval
   - Must be documented in relevant .md file

#### Conflict Resolution Process

1. **Identify Discrepancy**: Note difference between sources
2. **Check Written Docs**: Review /docs folder for authoritative spec
3. **Follow Written Spec**: Implement per documentation, not Figma
4. **Request Clarification**: If unclear, ask before proceeding
5. **Document Decision**: Update relevant .md file if user overrides

#### Example

```
Scenario: Payment Request Creation Screen
Figma: Shows complex fee calculator with toggle
design-payments.md: Specifies simple "Amount *" field
Resolution: Implement simple Amount field per written spec
```

## 5. Existing Functionality (Baseline)

### Completed Components

**Core UI Components**

- ShButton, ShText, ShIcon, ShSpacer, ShCheckbox

**Authentication & Welcome**

- ShWelcomeVideo, ShWelcomeLogo, ShLogoAndTitle
- Complete auth flow (sign up, sign in, verify email)

**Form Fields**

- ShFormFieldEmail, ShFormFieldPassword, ShFormFieldName
- ShFormFieldText, ShFormFieldTextArea, ShFormFieldDate
- ShFormFieldDateTime, ShFormFieldTime, ShFormFieldChoice
- ShFormFieldEventType, ShFormFieldLocation, ShOTPInput

**Navigation & Layout**

- ShScreenContainer, ShNavItem, ShTextWithLink
- Bottom tabs structure, Stack navigation

**User & Team Components**

- ShAvatar, ShUserList, ShMemberListItem
- ShTeamListItem, ShProfileTabs

### Configuration System

- `/config/colors` - Named color palette
- `/config/icons` - IconName enum
- `/config/spacing` - Named spacing values
- `/config/typography` - Text variants
- `/config/buttons` - Button variants

### Infrastructure

- Supabase client configured
- UserContext for authentication
- Expo Router file-based routing
- TypeScript with strict mode

## 6. EPIC Roadmap

### EPIC 1: Team Payments - Stripe Integration ⏳

**Status**: Next Priority  
**Scope**: Complete payment request and collection system  
**Key Features**:

- Payment request creation (Treasurer)
- Member payment processing (Stripe)
- Payment history and management
- Notifications for payment events

[Detailed in: `/docs/prd/epic-payments-stripe-integration.md`]

### EPIC 2: Event Management System 📅

**Status**: Planning  
**Scope**: Complete event lifecycle  
**Key Features**:

- Event creation and editing
- Squad selection and announcement
- Availability tracking
- Event notifications

### EPIC 3: Team Structure & Permissions 👥

**Status**: Planning  
**Scope**: Organization hierarchy  
**Key Features**:

- Club and team creation
- Role-based permissions
- Member management
- Admin delegation

### EPIC 4: Discovery & Onboarding 🗺️

**Status**: Planning  
**Scope**: Club discovery and joining  
**Key Features**:

- Map-based club discovery
- Express interest flow
- Member onboarding wizard
- Team assignment

### EPIC 5: Communication Hub 💬

**Status**: Future  
**Scope**: Team communications  
**Key Features**:

- Team announcements
- Push notifications
- Message center
- File sharing

## 7. Technical Architecture Summary

### Technology Stack

- **Frontend**: React Native + Expo SDK 53
- **Language**: TypeScript (strict mode)
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments**: Stripe (via Supabase Edge Functions)
- **Navigation**: Expo Router (file-based)
- **Styling**: Sh\* Components → Config system → React Native StyleSheet
- **State**: React Context (UserContext)

### Key Architectural Decisions

1. **Component-First**: All UI through Sh\* components
2. **Config-Driven**: No magic values in code
3. **API Layer**: All data through `/lib/api`
4. **Context Pattern**: UserContext for auth state
5. **File-Based Routing**: Expo Router `/app` structure

### Development Workflow

1. Developer reviews EPIC requirements and Figma designs (via MCP)
2. Developer implements one story at a time following patterns
3. Developer runs lint (`npm run lint`) and type checks (`npx tsc --noEmit`)
4. Developer commits code for story
5. QA team tests on both iOS and Android platforms
6. QA verifies no regression bugs
7. If issues found, developer fixes and resubmits
8. When story passes QA, proceed to next story
9. Deploy when full EPIC is complete and tested

## 8. Non-Functional Requirements

### Performance

- App launch <3 seconds
- Screen transitions <500ms
- API responses <2 seconds
- Smooth 60fps animations

### Security

- Supabase Row Level Security
- Secure token storage
- PCI compliance via Stripe Elements
- No sensitive data in logs

### Reliability

- Graceful offline handling
- Error boundaries on all screens
- Automatic retry for failed requests
- Data persistence across sessions

### Maintainability

- 100% TypeScript coverage
- Consistent code formatting
- Component documentation
- Clear git commit messages

### Platform Support

- iOS 14+
- Android API 21+
- iPhone 6S and newer
- Modern Android devices

## 9. Quality Assurance

### Development Standards

- Follow `/docs/architecture/coding-standards.md`
- Pixel-perfect Figma implementation
- Cross-platform testing required
- Accessibility compliance (WCAG 2.1 AA)

### Testing Requirements

- Manual testing of all user flows
- Both iOS and Android testing
- Lint must pass (`npm run lint`)
- TypeScript must compile (`npx tsc`)
- No console errors or warnings

### Definition of Done

- [ ] Feature works as specified
- [ ] Matches Figma design exactly
- [ ] No magic values in code
- [ ] Uses existing components/patterns
- [ ] Tested on both platforms
- [ ] Lint and TypeScript pass
- [ ] No regression bugs
- [ ] Code reviewed and approved

## 10. Project Management

### Communication

- Daily progress updates
- Blockers raised immediately
- Design clarifications via Figma comments

### Documentation

- Update relevant docs with changes
- Document new patterns
- Maintain LESSONS_LEARNED.md

### Version Control

- Feature branches per story
- Clear commit messages
- PR review before merge
- No direct commits to main

## Appendices

### A. Reference Documents

- `/docs/architecture/coding-standards.md` - Mandatory coding standards
- `/docs/App Architecture - Code Style - Developer Guidelines - Sep'2025.md` - Development guidelines
- `/CLAUDE.md` - AI assistant instructions
- Master Figma Project - Visual source of truth

### B. Configuration Files

- `/tsconfig.json` - TypeScript and path aliases
- `/.env` - Environment variables (Supabase)
- `/app.json` - Expo configuration

### C. Key Patterns

- Navigation: See `/app/events/create-event.tsx`
- API calls: See `/lib/api/*`
- Form handling: See existing ShFormField\* components
- Screen structure: See completed auth screens
