# QA Standards and Process

**Version:** 1.0  
**Date:** 2025-08-11  
**Status:** Active  
**Purpose:** Define QA standards, rejection criteria, and rework processes for SportHawk V4

## QA Persona Definition

### Role

The QA Persona is embodied by the AI assistant when operating under the BMAD framework. This persona is responsible for ensuring code quality, standards compliance, and preventing the issues that plagued V3.

### Activation

- Activated after dev agent reports story completion
- Can be explicitly requested: "QA review this implementation"
- Automatically engaged in Epic workflows

## QA Rejection Criteria

### Critical Issues (Immediate Rejection)

These issues MUST be fixed before any approval:

1. **No Figma Consultation**
   - Screen implemented without checking Figma first
   - No evidence of MCP Figma tool calls
   - Developer assumed design instead of verifying
   - Implementation before design review

   ```typescript
   // ❌ REJECT - Screen built without Figma reference
   // Developer should have called:
   // mcp__figma-dev-mode-mcp-server__get_image(nodeId)
   // mcp__figma-dev-mode-mcp-server__get_code(nodeId)
   ```

2. **StyleSheet Usage**
   - ANY use of StyleSheet.create() without explicit approval
   - Local stylesheets in screen files

   ```typescript
   // ❌ REJECT - No local stylesheets
   const styles = StyleSheet.create({
     container: { padding: 20 }
   });

   // ✅ ACCEPT - Inline with config values
   <View style={{ padding: spacing.lg }}>
   ```

3. **Wrong Component Usage**
   - Using React Native Text instead of ShText
   - Using React Native TextInput instead of ShFormField components
   - Using any RN visual component that has an Sh equivalent

   ```typescript
   // ❌ REJECT
   import { Text } from 'react-native';
   <Text>Hello</Text>

   // ✅ ACCEPT
   import { ShText } from '@cmp/index';
   <ShText>Hello</ShText>
   ```

4. **Magic Values**
   - Any hardcoded strings (except config keys)
   - Inline numeric values (except 0, 1, -1 for logic)
   - Hardcoded colors or dimensions
   - Values not from config files

   ```typescript
   // ❌ REJECT
   <View style={{ padding: 20, backgroundColor: '#eabd22' }}>

   // ✅ ACCEPT
   <View style={{ padding: spacing.lg, backgroundColor: colorPalette.primaryGold }}>
   ```

5. **Figma Mismatch**
   - Component doesn't match Figma design
   - Wrong colors, spacing, or typography
   - Missing UI elements
   - Incorrect layout structure

6. **App Stability**
   - Crashes in Expo Go
   - Infinite loops
   - Memory leaks
   - Unhandled promise rejections

7. **Navigation Broken**
   - Routes don't work
   - Back button failures
   - Deep links broken
   - Navigation state corruption

8. **TypeScript Violations**
   - Missing type definitions
   - Use of 'any' type
   - Type errors
   - Missing interface definitions

9. **Architecture Violations**
   - Direct Supabase calls instead of UserContext
   - Business logic in screen files
   - Components not using Sh prefix
   - State management outside proper contexts

### Major Issues (Must Fix)

These issues block approval but aren't critical failures:

1. **Component Standards**
   - Not using components from definition file
   - Creating duplicate components
   - Inconsistent component APIs
   - Missing component exports

2. **Naming Conventions**
   - Variables not camelCase
   - Components not PascalCase
   - Files not following conventions
   - Inconsistent naming patterns

3. **Configuration Usage**
   - Not using existing config values
   - Creating new configs without updating types
   - Duplicating configuration
   - Config values not typed

4. **Code Quality**
   - Linting failures
   - Unused imports
   - Unused variables
   - Dead code
   - Complex functions without decomposition

5. **Error Handling**
   - Missing try-catch blocks
   - Generic error messages
   - No user feedback on errors
   - Errors not logged to Crashlytics

### Minor Issues (Should Fix)

These are quality improvements that should be addressed:

1. **Code Formatting**
   - Inconsistent indentation
   - Missing semicolons (if style requires)
   - Line length violations
   - Import ordering

2. **Documentation**
   - Missing comments for complex logic
   - Outdated comments
   - Missing prop descriptions
   - No usage examples

3. **Performance**
   - Unnecessary re-renders
   - Missing React.memo where beneficial
   - Large bundle imports
   - Synchronous operations that could be async

4. **Development Artifacts**
   - console.log statements
   - Debug code
   - TODO comments without tickets
   - Commented-out code

## Rework Process

### Step 1: QA Rejection

When QA finds issues:

1. **Document Issues**

   ```markdown
   ## QA Review - [Screen/Component Name]

   ### Critical Issues

   - [ ] Magic value at line 45: hardcoded color '#000'
   - [ ] Crashes when user field is null

   ### Major Issues

   - [ ] Not using ShButton from component library
   - [ ] Missing error handling in API call

   ### Minor Issues

   - [ ] console.log on line 23
   - [ ] Function could be decomposed for clarity
   ```

2. **Provide Fix Guidelines**
   - Specific line numbers
   - Example of correct implementation
   - Reference to standards document

### Step 2: Dev Rework

Developer agent must:

1. Address ALL Critical issues
2. Address ALL Major issues
3. Consider Minor issues (document if not fixing)
4. Run linting and type checking
5. Test in Expo Go
6. Report completion with summary of changes

### Step 3: Re-Review

QA persona:

1. Reviews ONLY changed code (efficiency)
2. Verifies each reported issue is resolved
3. Checks no new issues introduced
4. Updates issue checklist

### Step 4: Resolution

**Approval Path:**

- All Critical/Major issues resolved
- Testing passes
- QA marks as APPROVED
- Story can close

**Escalation Path:**

- After 2 rejection cycles
- Unresolvable technical debate
- Time constraints
- Human makes final decision

## QA Workflow Commands

### For AI as QA Persona

```
"Perform QA review of [component/screen]"
"Check this implementation against standards"
"Verify Figma compliance for [screen]"
"Review magic values in [file]"
```

### QA Response Format

```markdown
# QA Review: [Component/Screen Name]

Date: [Date]
Status: [APPROVED/REJECTED/CONDITIONAL]

## Summary

[Brief overview of review]

## Issues Found

### Critical: [count]

[List issues]

### Major: [count]

[List issues]

### Minor: [count]

[List issues]

## Required Actions

[Specific steps to fix]

## Recommendation

[APPROVE/REJECT with reasoning]
```

## Testing Requirements

### Before QA Review

Dev must ensure:

1. Code compiles without errors
2. Linting passes (`npm run lint`)
3. Type checking passes
4. Basic functionality tested

### During QA Review

QA verifies:

1. Confirms Figma was consulted (checks for MCP tool usage)
2. Starts Expo Go: `npm run start`
3. Navigates to implementation
4. Tests happy path
5. Tests error cases
6. Verifies visual match to Figma

### After Approval

- Implementation tagged as QA-approved
- Can be merged to main branch
- Ready for integration testing

## Special Considerations

### Fast Track Approval

Allowed for:

- Documentation-only changes
- Config constant additions
- Type definition updates
- Comment additions

### Conditional Approval

When Minor issues exist but:

- Time critical
- Issues tracked for later
- Core functionality works
- No user impact

### Emergency Override

Human can override QA rejection when:

- Business critical deadline
- Acceptable technical debt
- Issues documented for fixing
- Risk acknowledged

## Metrics to Track

1. **Rejection Rate**: % of stories rejected on first review
2. **Rework Cycles**: Average cycles before approval
3. **Issue Categories**: Most common rejection reasons
4. **Time to Approval**: Average time from dev complete to QA approved
5. **Escaped Defects**: Issues found after QA approval

## Continuous Improvement

- Weekly review of rejection patterns
- Update standards based on common issues
- Refine criteria based on project needs
- Share learnings across team

## Change Log

| Date       | Version | Changes                                                                | Author            |
| ---------- | ------- | ---------------------------------------------------------------------- | ----------------- |
| 2025-08-11 | 1.0     | Initial QA standards and process                                       | BMad Orchestrator |
| 2025-08-11 | 1.1     | Added Figma-first requirement as Critical rejection criterion          | BMad Orchestrator |
| 2025-08-11 | 1.2     | Added StyleSheet ban and Sh component enforcement as Critical criteria | BMad Orchestrator |
