# Developer Pre-Flight Checklist

## Before Starting Any Story

- [ ] Read ONLY the specific story file
- [ ] Run story validation script: `./scripts/validate-story-docs.sh [STORY-ID]`
- [ ] Verify validation passes (no ERRORS, review any WARNINGS)
- [ ] Run database schema validation for story requirements
- [ ] Identify ALL components needed for implementation
- [ ] DO NOT load unnecessary documentation

## Planning Phase (REQUIRES USER REVIEW)

Present to user for approval BEFORE any coding:

### Component Usage Plan

- [ ] List all Sh components to be used with their complete prop interfaces
- [ ] Example format:

  ```typescript
  ShPaymentDetailHeader:
    - title: string          // Screen title
    - onBack: () => void     // Navigation callback
    - showMenu: boolean      // Show menu icon
    - onMenu?: () => void    // Menu action callback

  ShSectionContent:
    - title: string          // Section heading
    - content?: string       // Optional content
    - defaultContent: string // Fallback if no content
  ```

- [ ] Get user confirmation on component selection and prop usage
- [ ] Verify all required props are understood

### Figma → App Mapping

- [ ] Extract ALL Figma semantic styles from design node
- [ ] Present complete mapping table:
  ```
  | Figma Style Name     | App Constant                | Status    | Notes |
  |---------------------|----------------------------|-----------|--------|
  | Subheading Text     | ShTextVariant.Subheading   | ✅ Exists |        |
  | Primary Gold        | colorPalette.primary       | ✅ Exists |        |
  | Body Text           | ShTextVariant.Body         | ✅ Exists |        |
  | [Missing Style]     | [Proposed name]            | ❌ Create | Need user input |
  ```
- [ ] Get user approval for any new style constants needed
- [ ] Document any missing Figma semantic names that need creation

## Defensive Development Planning (NEW - MANDATORY)

Before writing ANY code, document:

### The "What Will Break?" Analysis

- [ ] List 5-10 ways this feature could fail
- [ ] For each failure mode, define:
  - Prevention strategy (how to avoid it)
  - Detection method (how to know it happened)
  - Recovery plan (what to do when it happens)
- [ ] Document critical assumptions that, if wrong, would break everything
- [ ] Get user approval on failure handling approach

### Test Planning (Write BEFORE Implementation)

- [ ] Write test names for all failure scenarios
- [ ] Write test names for happy path scenarios
- [ ] Identify what each test proves/prevents
- [ ] Tests must include:
  - External service failures (Stripe down, Supabase timeout)
  - Invalid user input scenarios
  - Partial failure recovery
  - State verification before and after operations

## While Coding

### Absolute Rules

- [ ] NO magic values - all constants from /config files
- [ ] NO StyleSheet in screen files (SafeAreaView flex:1 is ONLY exception)
  - [ ] If exception needed: STOP, present detailed reasoning to user for approval
- [ ] NO inline styles anywhere
- [ ] NO hardcoded colors, sizes, or spacing
- [ ] Component-only architecture for ALL styling

### Import Conventions

- [ ] Use @top for root-level imports
- [ ] Use @cfg for config imports
- [ ] Use @lib for lib folder imports
- [ ] Use @hks for hooks imports
- [ ] NEVER use relative paths (../../../)

### When Stuck or Uncertain

- [ ] STOP immediately - do not guess
- [ ] Clearly describe the issue
- [ ] List what information is needed
- [ ] Ask specific questions
- [ ] Wait for user guidance before proceeding

### Database Operations

- [ ] Verify foreign key relationships exist before using them
- [ ] Check exact column names in database schema
- [ ] Test queries with execute_sql before implementing
- [ ] ALL database changes in local migration files FIRST
- [ ] NEVER make direct database changes without local file tracking

### Defensive Logging (MANDATORY)

Every function that could fail must include:

- [ ] Log state BEFORE attempting operation
- [ ] Log the operation being attempted with context
- [ ] Log success with proof/verification
- [ ] Log failure with full error context and state
- [ ] Include correlation IDs for request tracking
- [ ] Example pattern:
  ```typescript
  logger.info('Starting operation', { stateBefore, attemptedChange });
  try {
    const result = await operation();
    logger.info('Operation succeeded', { stateBefore, stateAfter: result });
  } catch (error) {
    logger.error('Operation failed', { stateBefore, attempted, error });
  }
  ```

### Version Control Discipline

- [ ] ALL changes in local files FIRST
- [ ] Commit after each working component/function
- [ ] Test locally before declaring complete
- [ ] Update relevant story documentation with changes

## Before Declaring "Done"

### Required Validations

- [ ] Run story validation: `./scripts/validate-story-docs.sh [STORY-ID]` (verify still clean)
- [ ] Run: `npm run lint` (MUST PASS - zero errors)
- [ ] Run: `npx tsc --noEmit` (MUST PASS - zero type errors)
- [ ] Verify no hardcoded values in any new code (validation script should confirm)
- [ ] Check all imports use @ prefix paths
- [ ] Confirm all Figma styles are properly mapped
- [ ] Review PO checklist compliance: `/docs/dev-guidelines/po-story-preparation-checklist.md`

### Functionality Testing (WITH EVIDENCE)

- [ ] Test actual functionality in the app
- [ ] Verify all acceptance criteria from story
- [ ] Check responsive behavior
- [ ] Test ALL error states (not just happy path)
- [ ] Document test results:
  ```
  ✅ Payment with valid card: Success (pi_test123)
  ✅ Payment with insufficient funds: Handled gracefully, user notified
  ✅ Payment with Stripe timeout: Queued for retry, user informed
  ✅ Database transaction rollback: Verified atomic operations
  ```
- [ ] Verify logs capture enough detail for production debugging
- [ ] Confirm error messages are user-friendly

### Completion Declaration

- [ ] Status: "Ready for review" (NEVER say "Perfect!", "Excellent!", or "Flawless!")
- [ ] Provide summary: "Completed [X] components, [Y] files modified. Lint and type checks passed."
- [ ] List any deviations from standards (should be zero)
- [ ] Note any areas needing user review

## Common Mistakes to Avoid

### Top 10 Violations (Auto-check these)

1. ❌ `backgroundColor: 'rgba(0,0,0,0.3)'` → ✅ `backgroundColor: colorPalette.cardBackground`
2. ❌ `padding: 20` → ✅ `padding: spacing.xl`
3. ❌ `import from '../../../'` → ✅ `import from '@top/components'`
4. ❌ `IconName.ArrowLeft` → ✅ `IconName.BackArrow` (verify exact name)
5. ❌ `StyleSheet.create` in screens → ✅ Component-only styles
6. ❌ `fontSize: 16` → ✅ `fontSize: fontSizes.md`
7. ❌ `profiles:created_by` without FK → ✅ Verify FK exists first
8. ❌ `onChangeValue` → ✅ Check actual component prop name
9. ❌ `flex: 1` on content containers → ✅ Use intrinsic height
10. ❌ Declaring "Perfect!" → ✅ "Ready for review, checks passed"

## Exception Request Template

When requesting StyleSheet exception:

```
EXCEPTION REQUEST:
- Component: [name]
- Reason: [detailed technical justification]
- Alternatives tried: [list what didn't work]
- Impact if denied: [what happens without exception]
- Proposed implementation: [exact code]
```

## Remember

- User is always available for questions
- Better to ask than to guess
- Every mistake costs more time than asking
- The goal is ZERO debugging, not fast completion
