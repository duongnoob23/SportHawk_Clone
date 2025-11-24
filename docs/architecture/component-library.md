# SportHawk Component Library Documentation

## Overview

Complete API documentation for all Sh\* (SportHawk) components. This is the authoritative reference for component props, behaviors, and usage.

## Form Input Components

### ShFormFieldText

Text input field with label, validation, and required indicator support.

**Props:**

```typescript
interface ShFormFieldTextProps {
  label: string; // Field label
  placeholder: string; // Placeholder text
  value: string; // Current value
  onChangeText: (text: string) => void; // Change handler
  error?: string; // Error message (displays below field)
  required?: boolean; // Shows gold asterisk when true
  editable?: boolean; // Default: true
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  testID?: string;
}
```

**Usage Example:**

```typescript
<ShFormFieldText
  label="Team Name"
  required
  value={teamName}
  onChangeText={setTeamName}
  placeholder="Enter team name"
  error={errors.teamName}
/>
```

### ShFormFieldTextArea

Multi-line text input for longer content.

**Props:**

```typescript
interface ShFormFieldTextAreaProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  required?: boolean;
  numberOfLines?: number; // Default: 4
  maxLength?: number;
}
```

### ShFormFieldDate

Date picker with minimum/maximum date constraints.

**Props:**

```typescript
interface ShFormFieldDateProps {
  label: string;
  required?: boolean;
  value?: Date;
  onDateChange: (date: Date | undefined) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
  placeholder?: string; // Default: "Select date"
}
```

**Usage Example:**

```typescript
<ShFormFieldDate
  label="Due by"
  required
  value={dueDate ? new Date(dueDate) : undefined}
  onDateChange={(date) => setDueDate(date?.toISOString())}
  minimumDate={new Date()}
/>
```

### ShFormFieldChoice

Radio button group for single selection.

**Props:**

```typescript
interface ShFormFieldChoiceProps {
  label: string;
  required?: boolean;
  options: Array<{
    label: string;
    value: string;
  }>;
  value?: string;
  onValueChange: (value: string) => void;
  error?: string;
}
```

### ShFormFieldReadOnly

Display-only field for non-editable information.

**Props:**

```typescript
interface ShFormFieldReadOnlyProps {
  label: string;
  value: string;
  showReadOnlyText?: boolean; // Shows "(read only)" label
}
```

**Note:** Text color is `colorPalette.stoneGrey` for visibility.

### ShPaymentAmountInput

Specialized input for monetary amounts (handles pence/cents internally).

**Props:**

```typescript
interface ShPaymentAmountInputProps {
  label: string;
  required?: boolean;
  value: number; // Value in pence
  onChangeValue: (pence: number) => void;
  error?: string;
  currencySymbol?: string; // Default: "£"
}
```

## Navigation Components

### ShNavItem

Card-style navigation item for sub-forms and navigation.

**Props:**

```typescript
interface ShNavItemProps {
  label: string | React.ReactNode; // Main text
  subtitle?: string; // Secondary text
  onPress: () => void;
  required?: boolean; // Shows gold asterisk
  showDropdownIcon?: boolean; // Shows right arrow
  disabled?: boolean;
  testID?: string;
}
```

**Usage Example:**

```typescript
<ShNavItem
  label={`Members (${count})`}
  subtitle={count > 0 ? `${count} selected` : 'Select team members'}
  onPress={navigateToMemberSelection}
  required
  showDropdownIcon
/>
```

## Display Components

### ShText

Consistent text rendering with variants.

**Props:**

```typescript
interface ShTextProps {
  variant: ShTextVariant;
  style?: TextStyle;
  color?: string;
  children: React.ReactNode;
}

enum ShTextVariant {
  Heading1 = 'heading1',
  Heading2 = 'heading2',
  Body = 'body',
  Label = 'label',
  Small = 'small',
  Caption = 'caption',
}
```

### ShIcon

Icon display component using the app's icon set.

**Props:**

```typescript
interface ShIconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}
```

**Common Icons:**

```typescript
IconName.BackArrow; // Navigation back
IconName.Close; // Close/cancel
IconName.Check; // Success/complete
IconName.ChevronRight; // Navigation forward
IconName.Plus; // Add/create
```

### ShLoadingSpinner

Loading indicator with optional message.

**Props:**

```typescript
interface ShLoadingSpinnerProps {
  message?: string; // Text shown below spinner
  fullScreen?: boolean; // Centers in viewport
  size?: 'small' | 'large';
  color?: string; // Default: colorPalette.primaryGold
}
```

### ShSpacer

Consistent spacing between components.

**Props:**

```typescript
interface ShSpacerProps {
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  horizontal?: boolean; // Default: false (vertical spacing)
}
```

**Size Values:**

- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px

## Button Components

### ShButton

Primary button component.

**Props:**

```typescript
interface ShButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean; // Shows spinner instead of text
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}
```

### ShButtonLink

Text-only button for inline actions.

**Props:**

```typescript
interface ShButtonLinkProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string; // Default: colorPalette.primaryGold
}
```

## Container Components

### ShCard

Card container with consistent styling.

**Props:**

```typescript
interface ShCardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void; // Makes card tappable
  style?: ViewStyle;
}
```

### ShSection

Section container with optional title.

**Props:**

```typescript
interface ShSectionProps {
  title?: string;
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
}
```

## Common Patterns

### Form Validation

All form components accept an `error` prop that displays validation messages:

```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validate = () => {
  const newErrors: Record<string, string> = {};

  if (!title.trim()) {
    newErrors.title = 'Title is required';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

<ShFormFieldText
  label="Title"
  required
  value={title}
  onChangeText={setTitle}
  error={errors.title}  // Displays error below field
/>
```

### Required Fields

Components with `required` prop automatically display a gold asterisk:

```typescript
// Automatic asterisk - no manual addition needed
<ShFormFieldText
  label="Name"    // Just the label text
  required        // This adds the gold *
/>
```

### Loading States

Consistent loading pattern:

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await submitForm();
  } finally {
    setLoading(false);
  }
};

<ShButton
  title="Submit"
  onPress={handleSubmit}
  loading={loading}  // Shows spinner
  disabled={loading}  // Prevents multiple submissions
/>
```

## Component Property Mappings

### From Figma to Code

| Figma Property                | Component Prop                   | Notes                   |
| ----------------------------- | -------------------------------- | ----------------------- |
| Required field indicator (\*) | `required`                       | Automatic gold asterisk |
| Placeholder text              | `placeholder`                    | Input hint text         |
| Error state                   | `error`                          | String message          |
| Disabled state                | `disabled` or `editable={false}` | Grayed out              |
| Loading state                 | `loading`                        | Shows spinner           |

## Migration Guide

### Deprecated Components

These components should NOT be used in new code:

- `ShHeaderButton` → Use `TouchableOpacity` with `ShText`
- `ShFormFieldSelect` (for navigation) → Use `ShNavItem`

## Troubleshooting

### Component Not Rendering

1. Check all required props are provided
2. Verify imports are from `@cmp/index`
3. Check for console errors

### Styling Issues

1. Use semantic colors from `colorPalette`
2. Use `spacing` constants for consistency
3. Never use inline hex colors

### Form Not Submitting

1. Verify all required fields have values
2. Check validation errors
3. Ensure submit handler is async/await

## Need Help?

- Check existing implementations in `/app` directory
- Reference patterns in `/docs/architecture/ui-patterns.md`
- Ask tech lead for clarification on edge cases
