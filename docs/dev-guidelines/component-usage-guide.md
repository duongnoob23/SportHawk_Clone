# Component Usage Guide - SportHawk MVP

**Version:** 1.0  
**Date:** 2025-09-03  
**Status:** Active - Component Usage Guidelines

## Overview

This guide provides practical examples and patterns for using SportHawk components correctly. Always refer to `/docs/architecture/component-interfaces.md` for exact prop names.

## Quick Reference Matrix

| Need                   | Use This Component                  | NOT This                               |
| ---------------------- | ----------------------------------- | -------------------------------------- |
| Text input             | `ShFormFieldText`                   | `TextInput`                            |
| Email input            | `ShFormFieldEmail`                  | `ShFormFieldText` with email keyboard  |
| Password               | `ShFormFieldPassword`               | `ShFormFieldText` with secureTextEntry |
| Date only              | `ShFormFieldDate`                   | Native DatePicker                      |
| Date + Time            | `ShFormFieldDateTime`               | `ShFormFieldDate`                      |
| Single choice          | `ShFormFieldChoice`                 | Radio buttons                          |
| Multiple choice        | `ShFormFieldChoice` with `multiple` | Checkboxes                             |
| Amount/Currency        | `ShPaymentAmountInput`              | `ShFormFieldText`                      |
| Navigate to sub-screen | `ShNavItem`                         | `ShFormFieldSelect`                    |
| Read-only display      | `ShFormFieldReadOnly`               | Disabled input                         |
| Long text              | `ShFormFieldTextArea`               | `ShFormFieldText` with multiline       |
| Loading indicator      | `ShLoadingSpinner`                  | `ActivityIndicator`                    |
| Spacing                | `ShSpacer`                          | `View` with margins                    |
| Button                 | `ShButton`                          | `TouchableOpacity` + `Text`            |
| Text display           | `ShText`                            | `Text`                                 |
| Icon                   | `ShIcon`                            | Image or custom icon                   |

## Form Field Components

### Basic Text Input

```typescript
import { ShFormFieldText } from '@top/components';

<ShFormFieldText
  label="Title"
  required
  value={formData.title}
  onChangeText={(text) => updateField('title', text)}
  placeholder="Enter event title"
  error={touchedFields.has('title') && !!errors.title}
  errorMessage={touchedFields.has('title') ? errors.title : undefined}
/>
```

### Email Input

```typescript
<ShFormFieldEmail
  label="Email"
  required
  value={formData.email}
  onChangeText={(email) => updateField('email', email)}
  placeholder="user@example.com"
  error={showError('email')}
  errorMessage={getError('email')}
/>
```

### Password Input

```typescript
<ShFormFieldPassword
  label="Password"
  required
  value={formData.password}
  onChangePassword={(pwd) => updateField('password', pwd)}  // Note: onChangePassword
  placeholder="Enter password"
  error={showError('password')}
  errorMessage={getError('password')}
  showPasswordToggle
/>
```

### Date Selection

```typescript
// Date only
<ShFormFieldDate
  label="Event Date"
  required
  value={formData.date ? new Date(formData.date) : null}
  onChange={(date) => updateField('date', date.toISOString())}
  minimumDate={new Date()}
  error={showError('date')}
/>

// Date and Time
<ShFormFieldDateTime
  label="Due by"
  required
  value={formData.dueDate ? new Date(formData.dueDate) : null}
  onChange={(date) => updateField('dueDate', date.toISOString())}  // Note: onChange
  minimumDate={new Date()}
  error={showError('dueDate')}
/>
```

### Choice Selection

```typescript
const PAYMENT_TYPES = [
  { label: 'One-time', value: 'onetime' },
  { label: 'Recurring', value: 'recurring' },
];

<ShFormFieldChoice
  label="Payment Type"
  required
  options={PAYMENT_TYPES}
  value={formData.paymentType}  // Note: value, not selectedValue
  onChangeValue={(value) => updateField('paymentType', value)}  // Note: onChangeValue
  error={showError('paymentType')}
/>
```

### Amount Input

```typescript
<ShPaymentAmountInput
  label="Amount"
  required
  value={formData.amountPence || 0}
  onChangeValue={(pence) => {  // Note: onChangeValue, not onChange
    setTouchedFields(prev => new Set(prev).add('amount'));
    updateField('amountPence', pence);
  }}
  placeholder="Enter amount"
  error={touchedFields.has('amount') && !!errors.amount}
  errorMessage={touchedFields.has('amount') ? errors.amount : undefined}
  minimumAmount={100}  // £1.00 in pence
/>
```

### Text Area (Multi-line)

```typescript
<ShFormFieldTextArea
  label="Description"
  value={formData.description}
  onChangeText={(text) => updateField('description', text)}
  placeholder="Enter description..."
  numberOfLines={4}
  maxLength={500}
  error={showError('description')}
/>
```

### Read-Only Display

```typescript
<ShFormFieldReadOnly
  label="Team"
  value={teamName}
  required  // Shows asterisk but doesn't validate
/>
```

## Navigation Components

### Navigate to Sub-Screen

```typescript
<ShNavItem
  label="Members"
  subtitle={selectedCount > 0 ? `${selectedCount} selected` : 'Select team members'}
  onPress={() => {
    isNavigatingToSelection.current = true;  // Preserve form state
    router.push({
      pathname: Routes.SelectMembers,
      params: { teamId, selectedIds: formData.selectedMembers }
    });
  }}
  required
  showDropdownIcon
  error={showError('selectedMembers')}
/>
```

## Display Components

### Text Display

```typescript
import { ShText } from '@top/components';
import { ShTextVariant } from '@cfg/typography';

<ShText variant={ShTextVariant.Heading}>
  Create Payment Request
</ShText>

<ShText variant={ShTextVariant.Body} style={{ color: colorPalette.textSubtle }}>
  Fill in the details below
</ShText>
```

### Button

```typescript
<ShButton
  title="Submit"
  onPress={handleSubmit}
  disabled={submitting || !isValid}
  loading={submitting}
  variant="primary"
/>

<ShButton
  title="Cancel"
  onPress={() => router.back()}
  variant="secondary"
/>
```

### Icon

```typescript
import { ShIcon } from '@top/components';
import { IconName } from '@cfg/icons';

<ShIcon
  name={IconName.ChevronRight}
  size={spacing.iconSizeMedium}
  color={colorPalette.lightText}
/>
```

## Layout Components

### Screen Container

```typescript
<SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.background }}>
  <ShScreenContainer>
    {/* Screen content */}
  </ShScreenContainer>
</SafeAreaView>
```

### Spacing

```typescript
<ShSpacer size="lg" />  // Vertical space

<ShSpacer size="md" horizontal />  // Horizontal space
```

### Card

```typescript
<ShCard onPress={handleCardPress}>
  <ShText variant={ShTextVariant.Body}>Card content</ShText>
</ShCard>
```

### Divider

```typescript
<ShDivider />

<ShDivider
  color={colorPalette.borderSubtle}
  thickness={spacing.borderWidthThick}
/>
```

## Loading & Feedback

### Loading Spinner

```typescript
// Full screen loading
if (loading) {
  return (
    <ShLoadingSpinner
      message="Loading payment details..."
      fullScreen
    />
  );
}

// Inline loading
<ShLoadingSpinner size="small" />
```

### Modal

```typescript
<ShModal
  visible={showConfirmModal}
  onClose={() => setShowConfirmModal(false)}  // Note: onClose, not onDismiss
  title="Confirm Submission"
  actions={[
    {
      label: 'Cancel',
      onPress: () => setShowConfirmModal(false),
      variant: 'secondary'
    },
    {
      label: 'Submit',
      onPress: handleConfirmSubmit,
      variant: 'primary'
    }
  ]}
>
  <ShText variant={ShTextVariant.Body}>
    Are you sure you want to submit this payment request?
  </ShText>
</ShModal>
```

## Form Validation Helpers

### Touch State Management

```typescript
const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

const updateField = (fieldName: string, value: any) => {
  setTouchedFields(prev => new Set(prev).add(fieldName));
  setFormData(prev => ({ ...prev, [fieldName]: value }));
};

const showError = (fieldName: string): boolean => {
  return touchedFields.has(fieldName) && !!validationErrors[fieldName];
};

const getError = (fieldName: string): string | undefined => {
  return touchedFields.has(fieldName) ? validationErrors[fieldName] : undefined;
};
```

### Form Lifecycle

```typescript
const isNavigatingToSelection = useRef(false);

useEffect(() => {
  clearForm();
  initializeForm();

  return () => {
    if (!isNavigatingToSelection.current) {
      clearForm();
    }
    isNavigatingToSelection.current = false;
  };
}, [params.teamId]);
```

## Common Patterns

### Submit Button in Header

```typescript
<Stack.Screen
  options={{
    headerRight: () => (
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={submitting}
        style={{ marginRight: spacing.md }}
      >
        {submitting ? (
          <ActivityIndicator size="small" color={colorPalette.primaryGold} />
        ) : (
          <ShText variant={ShTextVariant.Body} style={{ color: colorPalette.primaryGold }}>
            Save
          </ShText>
        )}
      </TouchableOpacity>
    ),
  }}
/>
```

### Selection Footer

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
  >
    <ShText variant={ShTextVariant.ButtonText} style={{
      color: selectedCount === 0 ? colorPalette.textDisabled : colorPalette.primaryGold
    }}>
      Done
    </ShText>
  </TouchableOpacity>
</View>
```

## Error Handling

### User-Friendly Errors

```typescript
const handleSubmit = async () => {
  try {
    setSubmitting(true);
    await api.submitForm(formData);
    router.back();
  } catch (error) {
    console.error('[CreatePayment] Submit failed:', error);

    let message = 'Unable to create payment request. Please try again.';
    if (error.code === 'network_error') {
      message = 'Network connection error. Please check your connection.';
    }

    Alert.alert('Error', message);
  } finally {
    setSubmitting(false);
  }
};
```

## Troubleshooting

### Component Not Working?

1. Check exact prop names in `/docs/architecture/component-interfaces.md`
2. Verify import path is correct
3. Check TypeScript for interface errors
4. Test with minimal props first
5. Add props incrementally

### Common Fixes

| Problem                           | Solution                                       |
| --------------------------------- | ---------------------------------------------- |
| "onChangeValue is not a function" | Wrong prop name - check interfaces             |
| Form not clearing                 | Implement proper lifecycle in useEffect        |
| Errors show on load               | Add touchedFields state management             |
| Navigation trapped                | Add `headerShown: true` to Stack.Screen        |
| Text not visible                  | Use `colorPalette.textLight` not `textPrimary` |
| Amount shows error immediately    | Track touched state before showing error       |

## Remember

1. **Always verify prop names** - Don't assume
2. **Use reference implementations** - Copy working patterns
3. **Test incrementally** - Start simple, add complexity
4. **Check TypeScript** - It catches interface mismatches
5. **Follow the patterns** - Consistency matters
