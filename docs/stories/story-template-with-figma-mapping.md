# User Story: [STORY_ID] - [Story Title]

## 🚨 CRITICAL DEVELOPER INSTRUCTION - READ FIRST! 🚨

### YOUR PRIMARY IMPLEMENTATION SOURCE:

**→ `/docs/stories/[STORY_ID]-figma-translation-*.md`**

This Figma Translation document contains:

- ✅ **COMPLETE, TESTED component implementations**
- ✅ **All correct imports and constants identified**
- ✅ **Zero magic values - everything from config**
- ✅ **Ready-to-copy code blocks**

### IMPLEMENTATION PROCESS:

1. **OPEN** the Figma Translation document FIRST
2. **COPY** the complete component code provided
3. **DO NOT** write components from scratch
4. **PASTE** and integrate into your target file

> ⚠️ **WARNING**: Writing from scratch instead of using the Translation Layer will cause rework!

---

**Epic:** [Epic Name]  
**Sprint:** [Sprint Number]  
**Status:** Draft/Ready/In Progress/Complete  
**Story Points:** [Points]  
**Developer Assigned:** [Name]  
**Figma Translation Doc:** `/docs/stories/[STORY_ID]-figma-translation-*.md` ← **START HERE**

## Story Overview

**As a** [user type]  
**I want to** [action/goal]  
**So that** [business value/reason]

## Figma Design References

| Screen          | Figma Node ID            | Design Doc          | Reference Implementation |
| --------------- | ------------------------ | ------------------- | ------------------------ |
| [Screen 1 Name] | [Node ID e.g., 559-3204] | [/docs/design-*.md] | [/app/module/screen.tsx] |
| [Screen 2 Name] | [Node ID]                | [Doc path]          | [Reference path]         |

## 🎯 Figma-to-Component Mapping

### Screen: [Screen Name] (Node: [Figma Node ID])

**Reference Implementation:** `[/app/events/create-event.tsx or similar]`  
**Copy Pattern From:** `[Exact file to use as template]`

#### Component Mapping Table

| Figma Element  | SportHawk Component    | Props to Use                                       | Common Mistakes to Avoid                                                                    |
| -------------- | ---------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Title Field    | `ShFormFieldText`      | `label`, `required`, `value`, `onChangeText`       | ❌ Using `onChange` instead of `onChangeText`                                               |
| Due Date/Time  | `ShFormFieldDateTime`  | `label`, `required`, `value`, `onChange`           | ❌ Using `ShFormFieldDate` when time is needed<br>❌ Using `onDateChange` or `onChangeDate` |
| Amount         | `ShPaymentAmountInput` | `label`, `required`, `value`, `onChangeValue`      | ❌ Using `onChange`<br>❌ Not tracking touched state                                        |
| Type Selection | `ShFormFieldChoice`    | `label`, `options`, `value`, `onChangeValue`       | ❌ Using `selectedValue` prop<br>❌ Using `onValueChange`                                   |
| Members        | `ShNavItem`            | `label`, `subtitle`, `onPress`, `showDropdownIcon` | ❌ Using `ShFormFieldSelect`<br>❌ Not preserving form state on navigation                  |
| Description    | `ShFormFieldTextArea`  | `label`, `value`, `onChangeText`, `numberOfLines`  | ❌ Using `ShFormFieldText` with multiline                                                   |
| Read-only Team | `ShFormFieldReadOnly`  | `label`, `value`                                   | ❌ Using disabled `ShFormFieldText`                                                         |

#### Navigation & Structure Requirements

```typescript
// MUST include these structural elements (copy from reference)
- SafeAreaView wrapper with flex: 1
- Stack.Screen with headerShown: true
- Proper navigation headers (baseDark background, lightText color)
- ShScreenContainer wrapper
- ScrollView for form content
```

#### State Management Requirements

```typescript
// REQUIRED state management patterns
const [formData, setFormData] = useState<FormData>(initialState);
const [loading, setLoading] = useState(true); // Start true!
const [submitting, setSubmitting] = useState(false);
const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
const isNavigatingToSelection = useRef(false); // For sub-navigation

// REQUIRED lifecycle management
useEffect(() => {
  clearForm();
  initializeForm();
  return () => {
    if (!isNavigatingToSelection.current) {
      clearForm();
    }
  };
}, [params.teamId]);
```

#### Validation Pattern

```typescript
// MUST implement touched-field validation
<ShFormFieldText
  error={touchedFields.has('title') && !!errors.title}
  errorMessage={touchedFields.has('title') ? errors.title : undefined}
/>
```

#### Color Palette Requirements

| UI Element       | MUST Use                        | NOT                |
| ---------------- | ------------------------------- | ------------------ |
| Dark backgrounds | `colorPalette.baseDark`         | ❌ `black`, `#000` |
| Light text       | `colorPalette.lightText`        | ❌ `white`, `#fff` |
| Input text       | `colorPalette.textLight`        | ❌ `textPrimary`   |
| Primary actions  | `colorPalette.primaryGold`      | ❌ Hex values      |
| Borders          | `colorPalette.borderInputField` | ❌ `border`        |

### Sub-Screen: [Member Selection or similar]

**Copy Exactly From:** `[/app/events/edit-members.tsx]`

#### Critical Requirements

- [ ] `headerShown: true` - MANDATORY
- [ ] Back navigation capability
- [ ] Header right action (Select All/Deselect All)
- [ ] Footer with selection count and Done button
- [ ] Search bar with "Members" label above it
- [ ] Preserve parent form state when navigating

## Acceptance Criteria

### Functional Requirements

- [ ] All fields from Figma design are present
- [ ] Form validates according to business rules
- [ ] Data persists to database correctly
- [ ] Navigation flow matches design
- [ ] All sub-screens are accessible and escapable

### UI/UX Requirements

- [ ] Matches Figma design pixel-perfect
- [ ] Uses correct SportHawk components (as mapped above)
- [ ] Implements proper form lifecycle (clear on mount/unmount)
- [ ] Shows validation errors ONLY after field interaction
- [ ] Loading states initialized to `true` for data fetching
- [ ] All text uses semantic colors from colorPalette

### Technical Requirements

- [ ] Follows reference implementation pattern
- [ ] No StyleSheet in screen files
- [ ] All values from config (no magic values)
- [ ] TypeScript compiles without errors
- [ ] Lint passes without warnings
- [ ] Component props verified against `/docs/architecture/component-interfaces.md`

## Implementation Checklist

### Pre-Development

- [ ] Read this entire story document
- [ ] Open reference implementation file(s)
- [ ] Review `/docs/architecture/component-interfaces.md`
- [ ] Review `/docs/dev-guidelines/component-usage-guide.md`
- [ ] Verify all Figma node IDs are accessible

### During Development

- [ ] Copy structure from reference implementation
- [ ] Use exact component names from mapping table
- [ ] Verify prop names for each component
- [ ] Implement touchedFields state management
- [ ] Add proper navigation lifecycle
- [ ] Use semantic colors only

### Testing

- [ ] Form clears when entering from menu
- [ ] Form preserves data when navigating to sub-screens
- [ ] Validation only shows after interaction
- [ ] All navigation paths work (including back)
- [ ] Matches Figma design exactly
- [ ] Complete form development checklist

## API Endpoints Required

| Action             | Endpoint                 | Method | Payload                           |
| ------------------ | ------------------------ | ------ | --------------------------------- |
| [Create payment]   | `/api/payments`          | POST   | `{ title, amount, dueDate, ... }` |
| [Get team members] | `/api/teams/:id/members` | GET    | -                                 |

## Error Scenarios

| Scenario         | User Message                               | Handling                     |
| ---------------- | ------------------------------------------ | ---------------------------- |
| Network failure  | "Unable to save. Please check connection." | Show alert, retain form data |
| Validation error | Field-specific messages                    | Show inline under fields     |
| Server error     | "An error occurred. Please try again."     | Log error, show alert        |

## Notes for Developer

### ⚠️ CRITICAL: Common Pitfalls to Avoid

1. **Component Props**: NEVER assume prop names. Check `/docs/architecture/component-interfaces.md`
2. **Navigation**: ALL sub-screens need `headerShown: true` or users get trapped
3. **Validation**: NEVER show errors on initial load - implement touchedFields
4. **Form State**: MUST clear on mount except when returning from sub-navigation
5. **Field Types**: DateTime vs Date matters - check Figma for time display
6. **Colors**: Use semantic names only - no hex values or 'black'/'white'

### Reference Files Priority

1. Primary: `[Main reference implementation]`
2. Sub-screens: `[Sub-screen reference]`
3. Validation: Copy pattern from primary reference
4. Navigation: Copy Stack.Screen options exactly

### Questions Before Starting?

- Check component interfaces document
- Review the reference implementation
- Ask PO for clarification on any ambiguity

---

**Story Prepared By:** [PO Name]  
**Date:** [Date]  
**Version:** 1.0

## Sign-off

- [ ] PO Review Complete
- [ ] Developer Acknowledges Requirements
- [ ] QA Test Cases Prepared
