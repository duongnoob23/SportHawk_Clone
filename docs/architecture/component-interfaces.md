# Component Interfaces - SportHawk MVP

**Version:** 1.0  
**Date:** 2025-09-03  
**Status:** Active - Component Interface Documentation

## Overview

This document provides the exact TypeScript interfaces for all SportHawk components. **ALWAYS verify prop names here before using any component** to avoid runtime errors.

## Form Field Components

### ShFormFieldText

```typescript
interface ShFormFieldTextProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void; // NOT onChange
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}
```

### ShFormFieldEmail

```typescript
interface ShFormFieldEmailProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void; // NOT onChange
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  editable?: boolean;
}
```

### ShFormFieldPassword

```typescript
interface ShFormFieldPasswordProps {
  label: string;
  value: string;
  onChangePassword: (text: string) => void; // NOT onChangeText
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  editable?: boolean;
  showPasswordToggle?: boolean;
}
```

### ShFormFieldDate

```typescript
interface ShFormFieldDateProps {
  label: string;
  value: Date | null; // NOT undefined
  onChange: (date: Date) => void; // NOT onDateChange or onChangeDate
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
}
```

### ShFormFieldDateTime

```typescript
interface ShFormFieldDateTimeProps {
  label: string;
  value: Date | null; // NOT undefined
  onChange: (date: Date) => void; // NOT onDateChange or onChangeDate
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  minimumDate?: Date;
  maximumDate?: Date;
}
```

### ShFormFieldChoice

```typescript
interface ShFormFieldChoiceProps {
  label: string;
  options: Array<{
    label: string;
    value: string;
  }>;
  value: string; // NOT selectedValue
  onChangeValue: (value: string) => void; // NOT onValueChange
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  multiple?: boolean;
}
```

### ShFormFieldTextArea

```typescript
interface ShFormFieldTextAreaProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void; // NOT onChange
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  numberOfLines?: number; // Default: 4
  maxLength?: number;
  editable?: boolean;
}
```

### ShFormFieldReadOnly

```typescript
interface ShFormFieldReadOnlyProps {
  label: string;
  value: string;
  required?: boolean; // Only shows asterisk, doesn't validate
}
```

### ShPaymentAmountInput

```typescript
interface ShPaymentAmountInputProps {
  label: string;
  value: number; // In pence/cents
  onChangeValue: (pence: number) => void; // NOT onChange or onChangeAmount
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  minimumAmount?: number; // In pence (default: 100)
  maximumAmount?: number; // In pence
  currency?: 'GBP' | 'USD' | 'EUR'; // Default: 'GBP'
}
```

## Navigation Components

### ShNavItem

```typescript
interface ShNavItemProps {
  label: string;
  subtitle?: string;
  onPress: () => void;
  required?: boolean;
  showDropdownIcon?: boolean; // Shows chevron right
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
}
```

## Display Components

### ShText

```typescript
interface ShTextProps {
  variant: ShTextVariant; // From typography config
  style?: TextStyle;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  children: React.ReactNode;
}

enum ShTextVariant {
  Heading = 'Heading',
  SubHeading = 'SubHeading',
  Body = 'Body',
  ButtonText = 'ButtonText',
  Small = 'Small',
  Label = 'Label',
  SectionTitle = 'SectionTitle',
  Error = 'Error',
}
```

### ShButton

```typescript
interface ShButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary'; // Default: 'primary'
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean; // Default: true
  icon?: IconName; // From IconName enum
  iconPosition?: 'left' | 'right'; // Default: 'left'
}
```

### ShIcon

```typescript
interface ShIconProps {
  name: IconName; // From IconName enum, NOT string
  size?: number; // Default: spacing.iconSizeMedium
  color?: string; // Default: colorPalette.lightText
  style?: ViewStyle;
}
```

### ShCheckbox

```typescript
interface ShCheckboxProps {
  checked: boolean;
  onPress: () => void; // NOT onChange
  disabled?: boolean;
  label?: string;
  error?: boolean;
}
```

### ShRadioButton

```typescript
interface ShRadioButtonProps {
  selected: boolean;
  onPress: () => void; // NOT onSelect
  disabled?: boolean;
  label?: string;
  value?: string;
}
```

### ShAvatar

```typescript
interface ShAvatarProps {
  uri?: string;
  name?: string; // For initials if no uri
  size?: 'small' | 'medium' | 'large'; // Default: 'medium'
  style?: ViewStyle;
}
```

## Container Components

### ShScreenContainer

```typescript
interface ShScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean; // Default: true
  keyboardAvoiding?: boolean; // Default: true on iOS
  refreshControl?: React.ReactElement;
  style?: ViewStyle;
}
```

### ShCard

```typescript
interface ShCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: 'none' | 'small' | 'medium' | 'large'; // Default: 'medium'
  shadow?: boolean; // Default: true
}
```

### ShModal

```typescript
interface ShModalProps {
  visible: boolean;
  onClose: () => void; // NOT onDismiss
  title?: string;
  children: React.ReactNode;
  actions?: Array<{
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}
```

## Utility Components

### ShSpacer

```typescript
interface ShSpacerProps {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';
  horizontal?: boolean; // Default: false (vertical spacing)
}
```

### ShDivider

```typescript
interface ShDividerProps {
  style?: ViewStyle;
  color?: string; // Default: colorPalette.border
  thickness?: number; // Default: spacing.borderWidthThin
}
```

### ShLoadingSpinner

```typescript
interface ShLoadingSpinnerProps {
  size?: 'small' | 'large'; // Default: 'large'
  color?: string; // Default: colorPalette.primaryGold
  message?: string;
  fullScreen?: boolean; // Default: false
}
```

## List Components

### ShListItem

```typescript
interface ShListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  leftIcon?: IconName;
  rightIcon?: IconName;
  rightText?: string;
  selected?: boolean;
  disabled?: boolean;
}
```

### ShSectionHeader

```typescript
interface ShSectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}
```

## Common Prop Name Mistakes

| Component            | Wrong Prop          | Correct Prop       |
| -------------------- | ------------------- | ------------------ |
| ShFormFieldChoice    | `selectedValue`     | `value`            |
| ShFormFieldChoice    | `onValueChange`     | `onChangeValue`    |
| ShFormFieldDateTime  | `onDateChange`      | `onChange`         |
| ShFormFieldDateTime  | `onChangeDate`      | `onChange`         |
| ShFormFieldDate      | `value={undefined}` | `value={null}`     |
| ShCheckbox           | `onChange`          | `onPress`          |
| ShRadioButton        | `onSelect`          | `onPress`          |
| ShModal              | `onDismiss`         | `onClose`          |
| ShPaymentAmountInput | `onChange`          | `onChangeValue`    |
| ShFormFieldPassword  | `onChangeText`      | `onChangePassword` |

## Validation Props Pattern

Most form components follow this pattern for validation:

```typescript
{
  required?: boolean;      // Shows asterisk
  error?: boolean;        // Shows error state
  errorMessage?: string;  // Error text to display
}
```

## Usage Example

```typescript
// ✅ CORRECT - Using verified prop names
<ShFormFieldChoice
  label="Payment Type"
  required
  options={paymentTypes}
  value={formData.paymentType}  // Correct prop name
  onChangeValue={(value) => updateField('paymentType', value)}  // Correct handler
  error={touchedFields.has('paymentType') && !!errors.paymentType}
  errorMessage={touchedFields.has('paymentType') ? errors.paymentType : undefined}
/>

// ❌ WRONG - Common mistakes
<ShFormFieldChoice
  label="Payment Type"
  isRequired  // Wrong: should be 'required'
  options={paymentTypes}
  selectedValue={formData.paymentType}  // Wrong: should be 'value'
  onValueChange={(value) => updateField('paymentType', value)}  // Wrong: should be 'onChangeValue'
/>
```

## Important Notes

1. **Always check this document** before using a component
2. **Never assume** prop names based on other frameworks
3. **Use TypeScript** to catch interface mismatches at compile time
4. **Test runtime** to ensure props work as expected
5. **Update this document** if you find discrepancies

## Component Discovery Process

When using a component for the first time:

1. Check this document for the interface
2. If not documented, read the component's TypeScript file
3. Look for the Props interface definition
4. Test with minimal props first
5. Add additional props as needed
6. Update this document with your findings
