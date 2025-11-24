# Payment Detail View Components Specification

## Overview

This document specifies the 7 new Sh components created for the Payment Detail View (Story PAY-003) in the SportHawk MVP application.

## Component Library

### 1. ShPaymentDetailHeader

**Purpose:** Header component for the payment detail screen containing navigation and action buttons.

**Props:**

```typescript
interface ShPaymentDetailHeaderProps {
  onBackPress: () => void;
  onMenuPress?: () => void;
}
```

**Variants:**

- Standard view with back arrow and menu icon

**States:**

- Default: Both icons visible and active
- Menu disabled: Menu icon visible but non-interactive (current implementation)

**Usage Guidelines:**

- Always place at top of payment detail screens
- Back arrow uses `IconName.BackArrow`
- Menu uses `IconName.Edit` (3 dots pattern)

---

### 2. ShPaymentTitle

**Purpose:** Displays the main title of a payment request.

**Props:**

```typescript
interface ShPaymentTitleProps {
  title: string;
  variant?: ShTextVariant;
}
```

**Variants:**

- Default: Uses `ShTextVariant.Body1`
- Custom: Can override with any ShTextVariant

**States:**

- Standard display
- Empty state (no title provided)

**Usage Guidelines:**

- Use for primary payment identification
- Keep titles concise and descriptive
- Default variant appropriate for most cases

---

### 3. ShDueDateBanner

**Purpose:** Prominent banner displaying payment due date with visual emphasis.

**Props:**

```typescript
interface ShDueDateBannerProps {
  dueDate: string | Date;
  isPastDue?: boolean;
}
```

**Variants:**

- Current: Standard styling for upcoming payments
- Past due: Enhanced visual treatment (red/warning colors)

**States:**

- Active due date
- Past due warning
- No due date set

**Usage Guidelines:**

- Always format dates consistently
- Use color coding for urgency
- Position prominently near payment amount

---

### 4. ShSectionContent

**Purpose:** Container component for organizing content sections with consistent spacing.

**Props:**

```typescript
interface ShSectionContentProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'default' | 'compact';
}
```

**Variants:**

- Default: Standard spacing between elements
- Compact: Reduced spacing for dense content

**States:**

- With title
- Without title (content only)

**Usage Guidelines:**

- Do NOT use `flex: 1` - content should have intrinsic height
- Maintain consistent padding across all sections
- Use for grouping related information

---

### 5. ShAmountDisplay

**Purpose:** Displays monetary amounts with proper formatting and visual hierarchy.

**Props:**

```typescript
interface ShAmountDisplayProps {
  amount: number;
  currency?: string;
  size?: 'small' | 'medium' | 'large';
  showCurrencySymbol?: boolean;
}
```

**Variants:**

- Small: For secondary amounts
- Medium: Standard display (default)
- Large: For primary payment totals

**States:**

- Positive amount
- Zero amount
- Negative amount (refunds/credits)

**Usage Guidelines:**

- Always format to 2 decimal places
- Use `ShTextVariant.Total` for large amounts
- Use `ShTextVariant.Amount` for standard display
- Include currency symbol by default

---

### 6. ShPaymentButtonGroup

**Purpose:** Action button group for payment operations (Pay Now, Split, etc.).

**Props:**

```typescript
interface ShPaymentButtonGroupProps {
  onPayPress?: () => void;
  onSplitPress?: () => void;
  buttonsEnabled?: boolean;
  showSplitOption?: boolean;
}
```

**Variants:**

- Full: Both Pay Now and Split buttons
- Single: Pay Now only
- Disabled: Buttons visible but non-interactive

**States:**

- Enabled: Full interaction
- Disabled: Grayed out (current Story 3 implementation)
- Loading: Show spinner during payment processing

**Usage Guidelines:**

- Position at bottom of payment details
- Maintain consistent button sizing
- Clear visual distinction between enabled/disabled states

---

### 7. ShErrorMessage

**Purpose:** Displays error messages with consistent styling and optional retry actions.

**Props:**

```typescript
interface ShErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  dismissible?: boolean;
}
```

**Variants:**

- Error: Red styling for failures
- Warning: Yellow/orange for cautions
- Info: Blue for informational messages

**States:**

- Static: Message only
- With action: Includes retry button
- Dismissible: Can be closed by user

**Usage Guidelines:**

- Use semantic colors from design system
- Keep messages concise and actionable
- Position prominently when critical
- Auto-dismiss info messages after delay

---

## Design System Integration

All components follow the SportHawk design system:

### Typography Scale

- Headings: `ShTextVariant.Subheading`
- Body text: `ShTextVariant.Body1`
- Amounts: `ShTextVariant.Total`, `ShTextVariant.Amount`
- Metadata: `ShTextVariant.Body2`

### Color Palette

- Primary: Team colors from database
- Error: System error red
- Success: System success green
- Neutral: Grays for borders and backgrounds

### Spacing

- Component padding: Consistent 16px default
- Section spacing: 24px between major sections
- Element spacing: 8px between related items

### Component Patterns

- No StyleSheet usage - pure component composition
- No magic values - all spacing/sizing from theme
- All components accept standard React Native accessibility props
- TypeScript interfaces for all props

## Implementation Notes

1. **Architecture Compliance:**
   - All components follow pure component composition pattern
   - No direct StyleSheet usage
   - Theme values accessed via props or context

2. **Reusability:**
   - Components designed for reuse across payment flows
   - Flexible props for customization
   - Sensible defaults for common use cases

3. **Performance:**
   - Components use React.memo where appropriate
   - Minimal re-renders through proper prop design
   - Lazy loading for heavy content sections

4. **Accessibility:**
   - All interactive elements have proper labels
   - Color contrast meets WCAG AA standards
   - Keyboard navigation support where applicable

## Future Enhancements

- Animation support for state transitions
- Skeleton loading states
- Dark mode variants
- Internationalization for currency/date formatting

## Related Files

- Components: `/components/Sh{ComponentName}/index.tsx`
- Screen implementation: `/app/payments/[id]/index.tsx`
- API integration: `/lib/api/payments.ts`
- Figma design: 559-3055
