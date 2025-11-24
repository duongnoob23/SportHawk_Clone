# Coding Standards - SportHawk MVP

**Version:** 1.0  
**Date:** 2025-09-03  
**Status:** Active - Brownfield Project Standards

## Overview

This document defines the mandatory coding standards for the SportHawk MVP brownfield project. These standards are derived from hard-learned lessons and MUST be followed to maintain code quality and consistency.

## Core Development Principles

### 1. Reference Implementation Pattern - MANDATORY

**BEFORE creating ANY new screen or feature:**

1. **IDENTIFY** a similar existing implementation to use as reference
2. **DOCUMENT** the reference file in your PR/commit message
3. **COPY** the exact pattern and structure from the reference
4. **MODIFY** only the business-specific logic and fields
5. **VERIFY** consistency with the reference implementation

**Example:**

```
Creating: /app/payments/create-payment.tsx
Reference: /app/events/create-event.tsx
Copy: Navigation pattern, form structure, validation approach
Modify: Specific fields for payments vs events
```

### 2. Senior Developer Protocol - MANDATORY

**STOP AND THINK before ANY code changes:**

1. **STOP 1**: What exactly is the error message telling me?
2. **STOP 2**: What have I verified vs assumed?
3. **STOP 3**: What would I check BEFORE changing code?
4. **Get approval**: "May I proceed with [specific action]?"

### 3. Research-First Development

**70% Research, 30% Coding**

- **NEVER** use trial-and-error debugging
- **ALWAYS** search for known issues first (WebSearch, official docs)
- **ALWAYS** understand existing patterns before creating new ones
- **ALWAYS** perform root cause analysis for errors

### 4. Brownfield Constraints

- **DO NOT** alter or break existing working code
- **EXTEND** existing patterns, don't replace them
- **TEST** after each change to ensure nothing breaks
- **BUILD** incrementally - one story/screen at a time

## Code Style Rules

### NO Magic Values Policy - CRITICAL

**NEVER write hardcoded values directly in code**

```typescript
// ❌ WRONG - Magic values
backgroundColor: 'white';
borderWidth: 1;
fontWeight: '600';
padding: 16;

// ✅ CORRECT - Config values
backgroundColor: colorPalette.white;
borderWidth: spacing.borderWidthThin;
fontWeight: fontWeights.semiBold;
padding: spacing.medium;
```

**Required Config Imports:**

- Colors: `import { colorPalette } from '@cfg/colors'`
- Spacing: `import { spacing } from '@cfg/spacing'`
- Typography: `import { fontWeights, fontSizes } from '@cfg/typography'`
- Buttons: `import { buttonStyles } from '@cfg/buttons'`

**If a value doesn't exist in config:**

1. STOP coding immediately
2. Add it to the appropriate config file
3. Only then use it in your component

### Icon Usage - CRITICAL

```typescript
// ❌ NEVER use string literals
icon="mail-check"
icon="chevron-left"

// ✅ ALWAYS use IconName enum
icon={IconName.VerifyEmail}
icon={IconName.ChevronLeft}
```

- If icon doesn't exist in `IconName` enum, STOP and request addition
- Do NOT proceed with string literals as "temporary" solution

### TODO Comments Policy

- **NEVER** leave TODO comments without explicit user permission
- **NEVER** mark development complete with outstanding TODOs
- If functionality cannot be implemented:
  1. Ask for permission before adding TODO
  2. Provide clear justification
  3. Get explicit approval

### Comments in Code

- **DO NOT** add comments unless explicitly requested
- Code should be self-documenting through clear naming
- Use TypeScript types for documentation

## Navigation Architecture - MANDATORY

### Top Navigation Pattern - UPDATED

**Reference Implementation:** `/app/events/create-event.tsx`

```typescript
// ✅ CORRECT - Standard header pattern
<Stack.Screen
  options={{
    title: "Create Request",
    headerShown: true,
    headerStyle: {
      backgroundColor: colorPalette.baseDark, // NOT black
    },
    headerTintColor: colorPalette.lightText, // NOT white
    headerTitleStyle: {
      fontWeight: fontWeights.regular,
      fontSize: fontSizes.body,
    },
    headerLeft: () => (
      <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: spacing.md }}>
        <ShIcon name={IconName.BackArrow} size={spacing.iconSizeMedium} color={colorPalette.lightText} />
      </TouchableOpacity>
    ),
    headerRight: () => (
      <TouchableOpacity onPress={handleSubmit} style={{ marginRight: spacing.md }}>
        {submitting ? (
          <ActivityIndicator size="small" color={colorPalette.primaryGold} />
        ) : (
          <ShText variant={ShTextVariant.Body} style={{ color: colorPalette.primaryGold }}>
            Action
          </ShText>
        )}
      </TouchableOpacity>
    ),
  }}
/>
```

**IMPORTANT:** Do NOT use `ShHeaderButton` - it's deprecated. Use TouchableOpacity pattern above.
**NEVER** implement custom navigation bars shown in Figma - Stack handles this automatically

### Bottom Navigation

```typescript
// ✅ CORRECT - Use Expo Tabs
<Tabs.Screen
  name="home"
  options={{
    tabBarIcon: ({ color }) => <ShIcon name={IconName.Home} color={color} />
  }}
/>
```

## Component Architecture

### Component Property Discovery - CRITICAL

**BEFORE using ANY component:**

1. **READ** the component's TypeScript interface definition
2. **VERIFY** exact prop names (e.g., `value` not `selectedValue`, `onChange` not `onChangeValue`)
3. **CHECK** if required functionality already exists
4. **USE** existing props correctly (e.g., `required` for asterisks)
5. **NEVER** modify working components to add features that already exist
6. **NEVER** assume prop names - always verify in component file

**Common Component Interface Mistakes to Avoid:**

```typescript
// ❌ WRONG - Assuming prop names
<ShFormFieldChoice
  selectedValue={value}      // Wrong: should be 'value'
  onValueChange={handler}     // Wrong: should be 'onChangeValue'
/>

<ShFormFieldDateTime
  onDateChange={handler}      // Wrong: should be 'onChange'
  value={date || undefined}   // Wrong: should use null not undefined
/>

// ✅ CORRECT - Verified prop names
<ShFormFieldChoice
  value={value}
  onChangeValue={handler}
/>

<ShFormFieldDateTime
  onChange={handler}
  value={date || null}
/>
```

**Example:** Form fields already have `required` prop for asterisks - don't add manually!

### Naming Convention

All custom components MUST be prefixed with "Sh":

- `ShButton`
- `ShText`
- `ShFormFieldEmail`
- `ShSpacer`

### Component Usage Pattern

```typescript
// ✅ CORRECT - Use barrel imports with path aliases
import { ShText, ShButton, ShFormFieldEmail, ShSpacer } from '@top/components';
import { ShTextVariant } from '@cfg/typography';
```

### Text Rendering Pattern

```typescript
// ❌ WRONG - String literal variant
<ShText variant="heading">Sign In</ShText>

// ✅ CORRECT - Named variant from config
import { ShTextVariant } from '@cfg/typography';
<ShText variant={ShTextVariant.Heading}>Sign In</ShText>
```

### Button Usage Pattern

```typescript
// ❌ WRONG - Native button or TouchableOpacity
<Button title="Submit" onPress={handleSubmit} />
<TouchableOpacity onPress={handleSubmit}>
  <Text>Submit</Text>
</TouchableOpacity>

// ✅ CORRECT - ShButton component with proper variant
<ShButton title="Submit" onPress={handleSubmit} />
```

### Screen Structure

Screens should be simple compositions of Sh components:

```typescript
// ✅ CORRECT - Simple screen composition
import { ShTextVariant } from '@cfg/typography';

export default function PaymentScreen() {
  return (
    <ShScreenContainer>
      <ShText variant={ShTextVariant.Heading}>Payment Details</ShText>
      <ShSpacer size="medium" />
      <ShFormFieldEmail onChangeText={setEmail} />
      <ShButton title="Submit" onPress={handleSubmit} />
    </ShScreenContainer>
  );
}
```

### Form State Management - CRITICAL

#### Form Lifecycle Pattern

**Reference Implementation:** `/app/events/create-event.tsx`

All forms MUST implement proper lifecycle management:

```typescript
// ✅ CORRECT - Complete form lifecycle
const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
const isNavigatingToSelection = useRef(false);

useEffect(() => {
  // Clear form on fresh entry
  clearForm();
  initializeForm();

  // Cleanup: clear form when navigating away (except to sub-screens)
  return () => {
    if (!isNavigatingToSelection.current) {
      clearForm();
    }
    isNavigatingToSelection.current = false;
  };
}, [params.teamId]);

// When navigating to sub-screen (e.g., member selection)
const handleSelectMembers = () => {
  isNavigatingToSelection.current = true; // Preserve form data
  router.push({ pathname: Routes.MemberSelection });
};
```

#### Form Validation UX

**NEVER show validation errors before user interaction:**

```typescript
// ❌ WRONG - Shows errors immediately
<ShFormFieldText
  error={!!getValidationErrors().email}
  errorMessage={getValidationErrors().email}
/>

// ✅ CORRECT - Shows errors only after field touched
const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

<ShFormFieldText
  onChangeText={(text) => {
    setTouchedFields(prev => new Set(prev).add('email'));
    updateField('email', text);
  }}
  error={touchedFields.has('email') && !!getValidationErrors().email}
  errorMessage={touchedFields.has('email') ? getValidationErrors().email : undefined}
/>
```

### Screen Implementation Rules - CRITICAL

#### Zero Local Styles Policy - COMPONENT-ONLY ARCHITECTURE

**Screen files must be pure component composition:**

```typescript
// ❌ WRONG - ANY styling in screen files
import { StyleSheet } from 'react-native';

export default function PaymentScreen() {
  return (
    <View style={styles.container}>...</View> // ❌ StyleSheet
    <View style={{ padding: 16 }}>...</View> // ❌ Inline styles
  );
}

// ❌ WRONG - Inline styles beyond SafeAreaView
<View style={{
  padding: spacing.lg,
  backgroundColor: colorPalette.surface,
  borderRadius: 12
}}>

// ✅ CORRECT - Pure component composition
export default function PaymentScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.background }}>
      <ShScreenContainer>
        <ShPaymentHeader title="Payments" onBack={handleBack} />
        <ShPaymentList items={payments} />
        <ShPaymentFooter total={total} />
      </ShScreenContainer>
    </SafeAreaView>
  );
}
```

**The Acid Test:** Remove all imports except components - the screen should still be readable as a story.

**Screen files may ONLY contain:**

- Component composition
- Business logic
- State management
- API calls
- Navigation logic

**Screen files MUST NOT contain:**

- StyleSheet.create()
- Local style objects (except inline flex: 1 for SafeAreaView)
- Custom styling logic

#### iOS SafeAreaView Requirements

**All screens MUST wrap content in SafeAreaView:**

```typescript
// ✅ CORRECT - SafeAreaView wrapper
import { SafeAreaView } from 'react-native';

export default function PaymentScreen() {
  return (
    <>
      <Stack.Screen options={{ ... }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.background }}>
        <ShScreenContainer>
          {/* Content */}
        </ShScreenContainer>
      </SafeAreaView>
    </>
  );
}
```

#### Navigation Header Configuration

**ALL sub-screens (edit-members, etc.) MUST have proper navigation:**

```typescript
// ✅ CORRECT - Complete sub-screen navigation
<Stack.Screen
  options={{
    title: 'Select Members',
    headerShown: true,  // MANDATORY for sub-screens
    headerBackTitle: '',
    presentation: 'card',
    headerStyle: {
      backgroundColor: colorPalette.baseDark,  // NOT black
    },
    headerTintColor: colorPalette.lightText,   // NOT white
    headerTitleStyle: {
      fontWeight: fontWeights.regular,
      fontSize: fontSizes.body,
    },
    // Back navigation is automatic with Stack
    headerRight: () => (
      <TouchableOpacity onPress={handleAction} style={{ marginRight: spacing.md }}>
        <ShText variant={ShTextVariant.Body} style={{ color: colorPalette.primaryGold }}>
          Action
        </ShText>
      </TouchableOpacity>
    ),
  }}
/>
```

**Common Navigation Mistakes:**

- Missing `headerShown: true` - leaves users trapped
- Not including proper header styling
- Forgetting to add action buttons where needed

#### Loading State Patterns

**Initialize loading states to true for data-fetching screens:**

```typescript
// ❌ WRONG - Starts false, shows content before data loads
const [loading, setLoading] = useState(false);

// ✅ CORRECT - Starts true, shows spinner until ready
const [loading, setLoading] = useState(true);

if (loading) {
  return (
    <>
      <Stack.Screen options={{ title: 'Screen Title', headerShown: true }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.background }}>
        <ShScreenContainer>
          <ShLoadingSpinner />
        </ShScreenContainer>
      </SafeAreaView>
    </>
  );
}
```

**Always use standardized loading components:**

```typescript
// ❌ WRONG - Inline ActivityIndicator
<ActivityIndicator size="large" color={colorPalette.primary} />

// ✅ CORRECT - Standardized component
<ShLoadingSpinner />
```

## API & Database Access

### No Direct Database Access in Screens

```typescript
// ❌ WRONG - Direct Supabase import in screen
import { supabase } from '@lib/supabase';
const { data } = await supabase.from('users').select();

// ✅ CORRECT - Use API layer
import { userApi } from '@lib/api/users';
const { data } = await userApi.getUsers();
```

### Authentication Pattern

```typescript
// ❌ WRONG - Direct auth calls in screens
import { supabase } from '@lib/supabase';
await supabase.auth.signIn();

// ✅ CORRECT - Use UserContext
import { useUser } from '@ctx/UserContext';
const { signIn } = useUser();
```

## Path Aliases Usage

**Mandatory path aliases** (defined in `tsconfig.json`):

- `@top/*` → Root directory
- `@app/*` → `/app/*`
- `@ass/*` → `/assets/*`
- `@cmp/*` → `/components/*`
- `@cfg/*` → `/config/*`
- `@ctx/*` → `/contexts/*`
- `@lib/*` → `/lib/*`
- `@typ/*` → `/types/*`

## Figma Implementation Rules

### Mandatory Figma Style Extraction

**CRITICAL**: Figma uses semantic style names that MUST be extracted and mapped to our config system.

#### Style Extraction Protocol

Before implementing ANY UI:

1. **Open Figma design** using `get_code` MCP tool
2. **Extract semantic style names** using `get_variable_defs` MCP tool for:
   - EVERY text element (font styles)
   - EVERY color usage (named colors)
   - EVERY button (component variants)
   - EVERY icon (semantic icon names)
   - EVERY spacing value (layout tokens)
   - EVERY container (card/modal styles)
3. **Document ALL semantic names found**, not just text:
   - Text: "Subheading Text", "Body Text"
   - Colors: "Primary Gold", "Base Dark"
   - Buttons: "Button/Primary", "Size/Large"
   - Icons: "Icon/Navigation/Back"
   - Spacing: "Spacing/Medium", "Padding/Screen"
4. **Map EVERYTHING to config**:
   - Text styles → ShTextVariant enum
   - Colors → colorPalette
   - Buttons → buttonStyles
   - Icons → IconName enum
   - Spacing → spacing config
5. **Verify all mappings exist** in config files
6. **Get approval** before coding

#### Example Style Extraction

```typescript
// Step 1: Use get_code for node
mcp__figma-dev-mode-mcp-server__get_code(nodeId: "559:2954")

// Step 2: Use get_variable_defs to get semantic names
mcp__figma-dev-mode-mcp-server__get_variable_defs(nodeId: "559:2954")
// Returns: {"Subheading Text": "Font(family: 'Inter', style: Medium, size: 20, weight: 500, lineHeight: 100)"}

// Step 3: Map to ShTextVariant
// "Subheading Text" → ShTextVariant.SubHeading
```

#### Figma Style Name Mapping

Figma styles MUST be mapped to our configuration:

| Figma Style Name | ShTextVariant            | Typography Config                 |
| ---------------- | ------------------------ | --------------------------------- |
| Subheading Text  | ShTextVariant.SubHeading | fontSizes.lg, fontWeights.medium  |
| Body Text        | ShTextVariant.Body       | fontSizes.md, fontWeights.regular |
| Small Text       | ShTextVariant.Small      | fontSizes.sm, fontWeights.regular |
| Label Text       | ShTextVariant.Label      | fontSizes.sm, fontWeights.medium  |

**If a Figma style doesn't have a corresponding ShTextVariant:**

1. STOP implementation
2. Add new variant to `/config/typography.ts`
3. Update ShTextVariant enum
4. Only then proceed with implementation

### Mandatory Figma Verification

Before implementing ANY UI:

1. **Extract semantic style names** using `get_variable_defs`
2. **Document ALL style names** used in the design
3. **Map each style** to ShTextVariant or color config
4. **Verify mappings** exist in our config files
5. **Get approval** before coding

### Pixel-Perfect Implementation

- Implementation MUST match Figma exactly
- Use semantic style names, NOT raw values
- Use MCP to verify against Figma node IDs
- If Figma doesn't show bold, it's NOT bold
- IGNORE navigation bars in Figma (Stack handles this)

## Documentation Hierarchy - CRITICAL

### Specification Precedence

When conflicts exist between documentation sources, follow this hierarchy:

1. **Written specifications in /docs folder** (HIGHEST PRIORITY)
   - PRD documents
   - design-\*.md files
   - Epic and story definitions
2. **Figma designs** (visual reference)
3. **User clarifications during development**

**Example Resolution:**

```
Figma shows: Complex fee calculator with toggle
design-payments.md specifies: Simple "Amount *" field
Resolution: Implement the simple Amount field per written spec
```

### Conflict Resolution Process

1. **Identify discrepancy** between Figma and written specs
2. **Check written documentation** in /docs folder
3. **Follow written spec** as authoritative source
4. **Document the decision** if user overrides
5. **Never assume** - ask for clarification if unclear

## TypeScript Requirements

### Strict Mode

- TypeScript strict mode is ENABLED
- Fix all type errors before committing
- No `any` types without explicit justification

### Type Definitions

```typescript
// ✅ CORRECT - Proper typing
interface PaymentRequest {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
}

// ❌ WRONG - Weak typing
const payment: any = { ... };
```

## Testing & Validation

### Developer Validation Checklist

Before submitting code for review:

1. **Run linting**: `npm run lint` - fix ALL issues
2. **Check TypeScript**: `npx tsc --noEmit`
3. **Verify no magic values** in changed code
4. **Verify text uses ShTextVariant** enum values
5. **Verify buttons use ShButton** component
6. **Verify against Figma** design using MCP tools

### Testing Strategy

Testing will be performed by the QA team on:

- iOS devices (iPhone 6S and newer)
- Android devices (API 21+)
- Both small and large screen sizes

### Build Commands

```bash
# Development
npm start

# Platform specific
npm run ios
npm run android

# Linting (MANDATORY before marking complete)
npm run lint
```

## File Organization

### Folder Structure

```
/app              # Screens/pages (Expo Router)
  /(auth)         # Auth screens
  /(tabs)         # Tab navigation screens
/components       # Sh* prefixed components
/config           # Global configuration
/contexts         # React contexts
/lib              # Libraries and APIs
  /api            # API layer (MANDATORY for DB access)
/types            # TypeScript definitions
```

### Component File Structure

#### Folder and File Organization

**Every Sh component MUST follow this structure:**

```
components/
  ShComponentName/
    ShComponentName.tsx   # Component implementation
    index.ts             # Export file
```

**Component file (ShComponentName.tsx):**

```typescript
// 1. Imports (grouped by type)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colorPalette } from '@cfg/colors';
import { ShText } from '@cmp/ShText';

// 2. Types/Interfaces
interface ShComponentNameProps {
  title: string;
}

// 3. Component
export function ShComponentName({ title }: ShComponentNameProps) {
  return <View>...</View>;
}

// 4. Styles (using config values)
const styles = StyleSheet.create({
  container: {
    backgroundColor: colorPalette.background,
  },
});
```

**Index file (index.ts):**

```typescript
export { ShComponentName } from './ShComponentName';
```

#### Component Index Alphabetical Ordering

**The /components/index.ts file MUST maintain strict alphabetical order:**

```typescript
// ✅ CORRECT - Alphabetical ordering
export { ShAvatar } from './ShAvatar';
export { ShButton } from './ShButton';
export { ShCheckbox } from './ShCheckbox';
export { ShIcon } from './ShIcon';
export { ShLoadingSpinner } from './ShLoadingSpinner';
export { ShLogoAndTitle } from './ShLogoAndTitle';

// ❌ WRONG - Out of order
export { ShButton } from './ShButton';
export { ShAvatar } from './ShAvatar'; // Should be before ShButton
export { ShIcon } from './ShIcon';
```

## Boolean Naming Convention

```typescript
// ❌ AMBIGUOUS
const deleted = true;
const active = false;

// ✅ CLEAR with verb prefix
const isDeleted = true;
const isActive = false;
const hasPermission = true;
const didComplete = false;
```

## Error Handling

### Graceful Degradation

```typescript
try {
  const result = await apiCall();
  // Handle success
} catch (error) {
  console.error('PaymentScreen: Failed to load payments', error);
  // Show user-friendly error
  showError('Unable to load payments. Please try again.');
}
```

### Debug Logging

- Include meaningful console.logs during development
- Prefix with screen/component name
- Remove or comment before production

## Penalties for Violations

1. **First violation**: Document in LESSONS_LEARNED.md
2. **Pattern of violations**: Loss of development autonomy
3. **Skipping research**: Marked as junior developer behavior
4. **Breaking existing code**: Immediate rollback required

## Summary Checklist

Before ANY code submission:

- [ ] **Reference implementation identified** and documented
- [ ] **Component interface verified** - exact prop names checked in component file
- [ ] **Form lifecycle implemented** - proper mount/unmount/cleanup
- [ ] **Validation UX correct** - errors only shown after field touched
- [ ] **Sub-screens have navigation** - headerShown: true, proper styling
- [ ] No magic values - all from config
- [ ] Text uses ShText with ShTextVariant enum
- [ ] Buttons use ShButton component (never TouchableOpacity/Button)
- [ ] Icons use IconName enum
- [ ] Form fields use correct prop names (verified, not assumed)
- [ ] Navigation uses TouchableOpacity pattern (not ShHeaderButton)
- [ ] Colors use semantic names (baseDark not black, lightText not white, primaryGold not gold)
- [ ] Input text uses colorPalette.textLight (not textPrimary)
- [ ] Sub-forms use ShNavItem (not ShFormFieldSelect)
- [ ] No TODO comments
- [ ] Follows Sh component pattern
- [ ] Uses API layer for data
- [ ] Matches Figma exactly (or written spec if conflict exists)
- [ ] Lint passes (`npm run lint`)
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] Doesn't break existing code
- [ ] **NO StyleSheet in screen files** - zero local styles
- [ ] **SafeAreaView wraps all screen content** (iOS compatibility)
- [ ] **Navigation headers follow standard pattern** when needed
- [ ] **Loading states initialized to true** for data screens
- [ ] **Components follow folder/file structure** (ComponentName/ComponentName.tsx + index.ts)
- [ ] **Component exports in alphabetical order** in index.ts
- [ ] **Written specs checked** when Figma conflicts exist
- [ ] **Field types match design** (DateTime not Date when time is needed)
