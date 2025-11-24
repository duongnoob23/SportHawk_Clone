# UI Patterns and Component Guidelines

**Version:** 1.1  
**Date:** 2025-09-03  
**Status:** Active - UI Pattern Guidelines

## Overview

This document defines the standard UI patterns and component usage guidelines for the SportHawk application. All new features MUST follow these patterns to ensure consistency and prevent common implementation mistakes.

## 🚨 CRITICAL: Reference Implementation Pattern

**BEFORE creating any new screen:**

1. Identify a similar existing screen as your reference
2. Copy the exact pattern and structure
3. Modify only the business logic and specific fields
4. Document your reference in the PR description

## ⚠️ Common Mistakes Prevention Guide

### Component Interface Mistakes

**ALWAYS verify exact prop names before using components:**

```typescript
// ❌ WRONG - Assuming prop names
<ShFormFieldChoice
  selectedValue={value}      // Wrong: should be 'value'
  onValueChange={handler}    // Wrong: should be 'onChangeValue'
/>

<ShFormFieldDateTime
  onDateChange={handler}     // Wrong: should be 'onChange'
  onChangeDate={handler}     // Wrong: should be 'onChange'
  value={date || undefined}  // Wrong: should use null not undefined
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

### Form State Management Mistakes

**ALWAYS implement proper form lifecycle:**

```typescript
// ✅ CORRECT - Complete form lifecycle
const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
const isNavigatingToSelection = useRef(false);

useEffect(() => {
  clearForm(); // Clear on mount
  initializeForm();

  return () => {
    // Clear on unmount (except sub-navigation)
    if (!isNavigatingToSelection.current) {
      clearForm();
    }
  };
}, [params.teamId]);
```

### Validation UX Mistakes

**NEVER show validation errors before user interaction:**

```typescript
// ❌ WRONG - Shows errors immediately on load
<ShPaymentAmountInput
  error={!!getValidationErrors().amount}
  errorMessage={getValidationErrors().amount}
/>

// ✅ CORRECT - Shows errors only after field touched
<ShPaymentAmountInput
  onChangeValue={(value) => {
    setTouchedFields(prev => new Set(prev).add('amount'));
    updateField('amount', value);
  }}
  error={touchedFields.has('amount') && !!getValidationErrors().amount}
  errorMessage={touchedFields.has('amount') ? getValidationErrors().amount : undefined}
/>
```

## Navigation Headers

### Standard Screen Header Pattern

**Reference Implementation:** `/app/events/create-event.tsx`

**DO:**

```typescript
<Stack.Screen
  options={{
    headerShown: true,
    title: 'Screen Title',
    headerStyle: {
      backgroundColor: colorPalette.baseDark, // NOT black
    },
    headerTintColor: colorPalette.lightText, // NOT white
    headerTitleStyle: {
      fontWeight: fontWeights.regular,
      fontSize: fontSizes.body,
    },
    headerLeft: () => (
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ paddingLeft: spacing.md }}
      >
        <ShIcon
          name={IconName.BackArrow}
          size={spacing.iconSizeMedium}
          color={colorPalette.lightText}
        />
      </TouchableOpacity>
    ),
    headerRight: () => (
      <TouchableOpacity
        onPress={handleSubmit}
        style={{ marginRight: spacing.md }}
        disabled={loading || submitting}
      >
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

**DON'T:**

- Use `ShHeaderButton` component (deprecated)
- Use `colorPalette.black` or `colorPalette.white` directly
- Create custom header components without following the pattern

## Form Patterns

### Form Field Requirements

**Required Field Indicators:**

- Use the `required` prop (NOT `isRequired`)
- The component will automatically add a gold asterisk
- Do NOT manually add asterisks to labels

**DO:**

```typescript
<ShFormFieldText
  label="Title"
  required  // This adds the gold asterisk automatically
  value={formData.title}
  onChangeText={(text) => updateField('title', text)}
  placeholder="Enter title"
  error={errors.title}
/>
```

**DON'T:**

```typescript
// DON'T do this - the component handles it
<ShFormFieldText
  label="Title *"  // DON'T add asterisk manually
  isRequired      // DON'T use isRequired
  ...
/>
```

### Sub-Form Navigation Pattern

**Reference Implementation:** `/app/events/create-event.tsx` (Members selection)

For fields that navigate to sub-forms (like member selection), use `ShNavItem`:

**DO:**

```typescript
<ShNavItem
  label={`Members ${count > 0 ? `(${count})` : '(0)'}`}
  subtitle={count > 0 ? `${count} selected` : 'Select team members'}
  onPress={handleNavigateToSubForm}
  required
  showDropdownIcon
/>
```

**DON'T:**

```typescript
// DON'T use ShFormFieldSelect for navigation
<ShFormFieldSelect
  label="Members"
  value={memberCount > 0 ? `${memberCount} members` : undefined}
  onPress={handleSelectMembers}
/>
```

## Color System

### Semantic Color Usage

**ALWAYS use semantic color names:**

| Use Case         | Correct                         | Wrong                     |
| ---------------- | ------------------------------- | ------------------------- |
| Dark backgrounds | `colorPalette.baseDark`         | `colorPalette.black`      |
| Light text       | `colorPalette.lightText`        | `colorPalette.white`      |
| Primary actions  | `colorPalette.primaryGold`      | `#eabd22`                 |
| Read-only text   | `colorPalette.stoneGrey`        | `#9e9b97`                 |
| Backgrounds      | `colorPalette.surface`          | `colorPalette.background` |
| Input borders    | `colorPalette.borderInputField` | `colorPalette.border`     |

## Component Selection Matrix

| UI Need                | Use Component          | Don't Use                  |
| ---------------------- | ---------------------- | -------------------------- |
| Text input             | `ShFormFieldText`      | TextInput                  |
| Date selection         | `ShFormFieldDate`      | DatePicker                 |
| Single choice          | `ShFormFieldChoice`    | RadioButton                |
| Navigation to sub-form | `ShNavItem`            | ShFormFieldSelect          |
| Amount input           | `ShPaymentAmountInput` | ShFormFieldText            |
| Read-only display      | `ShFormFieldReadOnly`  | Disabled ShFormFieldText   |
| Loading state          | `ShLoadingSpinner`     | ActivityIndicator directly |
| Spacing                | `ShSpacer`             | View with margins          |

## Form Implementation Checklist

Before submitting any form-related PR, verify:

- [ ] All required fields have `required` prop set
- [ ] Validation errors are displayed using the `error` prop
- [ ] Form uses KeyboardAvoidingView for iOS
- [ ] Submit button shows loading state during submission
- [ ] All colors use semantic names from colorPalette
- [ ] Navigation headers follow the standard pattern
- [ ] Sub-forms use ShNavItem for navigation
- [ ] Form data is properly initialized in useEffect
- [ ] Error handling includes user-friendly messages

## Loading States

**Standard Loading Screen Pattern:**

```typescript
if (loading) {
  return (
    <>
      <Stack.Screen options={{...}} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.background }}>
        <ShLoadingSpinner
          message="Loading..."
          fullScreen
        />
      </SafeAreaView>
    </>
  );
}
```

## Error Handling Pattern

**User-Friendly Error Display:**

```typescript
const getValidationErrors = () => {
  const errors: Record<string, string> = {};

  if (!formData.title?.trim()) {
    errors.title = 'Title is required';
  }

  if (!formData.selectedMembers?.length) {
    errors.selectedMembers = 'Please select at least one member';
  }

  return errors;
};

// Display inline with form fields
<ShFormFieldText
  error={getValidationErrors().title}
  ...
/>
```

## Common Mistakes to Avoid

### 1. Wrong Header Components

❌ **Mistake:** Using deprecated components

```typescript
headerRight: () => <ShHeaderButton title="Send" onPress={submit} />
```

✅ **Correct:** Using TouchableOpacity with ShText

```typescript
headerRight: () => (
  <TouchableOpacity onPress={submit}>
    <ShText variant={ShTextVariant.Body} style={{ color: colorPalette.primaryGold }}>
      Send
    </ShText>
  </TouchableOpacity>
)
```

### 2. Direct Color Values

❌ **Mistake:** Using hex values or wrong semantic names

```typescript
style={{ color: '#eabd22' }}
style={{ backgroundColor: colorPalette.black }}
style={{ color: colorPalette.textPrimary }}  // Wrong for input text
```

✅ **Correct:** Using semantic color names

```typescript
style={{ color: colorPalette.primaryGold }}
style={{ backgroundColor: colorPalette.baseDark }}
style={{ color: colorPalette.textLight }}  // Correct for input text
```

### 3. Manual Required Indicators

❌ **Mistake:** Adding asterisks to labels manually

```typescript
label="Title *"
label={<>Title <Text style={{color: 'gold'}}>*</Text></>}
```

✅ **Correct:** Using the required prop

```typescript
label = 'Title';
required;
```

## Sub-Screen Navigation Requirements

### MANDATORY for ALL Sub-Screens

**Every sub-screen (edit-members, select options, etc.) MUST have:**

```typescript
<Stack.Screen
  options={{
    headerShown: true,  // MANDATORY - prevents users being trapped
    title: 'Screen Title',
    headerBackTitle: '',
    presentation: 'card',
    headerStyle: {
      backgroundColor: colorPalette.baseDark,
    },
    headerTintColor: colorPalette.lightText,
    // Back navigation is automatic with Stack
    headerRight: () => (
      // Action button if needed
    ),
  }}
/>
```

### Selection Screen Footer Pattern

```typescript
<View style={{
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: colorPalette.baseDark,
  borderTopWidth: spacing.borderWidthThin,
  borderTopColor: 'rgba(158, 155, 151, 0.2)',
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.md,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}}>
  <ShText variant={ShTextVariant.Body} style={{ color: colorPalette.textSubtle }}>
    {selectedCount} selected
  </ShText>
  <TouchableOpacity
    onPress={handleDone}
    disabled={selectedCount === 0}
    style={{
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.sm,
      borderRadius: spacing.borderRadiusMedium,
      backgroundColor: colorPalette.primaryGold,
      opacity: selectedCount === 0 ? 0.5 : 1,
    }}
  >
    <ShText variant={ShTextVariant.ButtonText} style={{ color: colorPalette.baseDark }}>
      Done
    </ShText>
  </TouchableOpacity>
</View>
```

## Testing Your Implementation

Before submitting:

1. **Component Props:** Verify all prop names match component interfaces
2. **Navigation:** Test ALL screens have exit capability (especially sub-screens)
3. **Form Lifecycle:** Check form clears on entry/exit appropriately
4. **Validation UX:** Ensure errors only show after user interaction
5. **Loading States:** Verify loading spinners show during async operations
6. **Color Consistency:** Check all colors use semantic names from palette
7. **Field Types:** Verify correct field types (DateTime vs Date when time is needed)
8. **Reference Pattern:** Compare side-by-side with your reference implementation

## Questions or Exceptions

If you need to deviate from these patterns:

1. Document the reason in your PR
2. Get approval from the tech lead
3. Update this document if creating a new pattern

Remember: **Consistency > Creativity** in UI implementation.
