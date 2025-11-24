# PAY-007 Figma Translation Layer

**Story:** PAY-007 Admin Payment Management  
**Epic:** Payments & Stripe Integration  
**Date:** 2025-09-08  
**Version:** 1.0

## Overview

This document provides the complete Figma-to-SportHawk component mapping for Story 7 (Admin Payment Management). It ensures pixel-perfect implementation while maximizing reuse of existing components.

## Figma Screens Analyzed

1. **559-2776** - Admin Payment List View
2. **559-2792** - Payment Details Admin View
3. **559-2709** - Edit Payment Request

## Component Strategy

- **90% Reusable:** Existing SportHawk components
- **10% New:** 4 specialized admin payment components
- **0% Modified:** No changes to existing components (safer approach)

---

## Screen 1: Admin Payment List (Figma 559-2776)

### Layout Structure

```
┌─────────────────────────────────┐
│ Team Dropdown + Navigation      │
├─────────────────────────────────┤
│ Tab Bar (Events/Payments/etc)   │
├─────────────────────────────────┤
│ "Upcoming Payments" + Filter    │
├─────────────────────────────────┤
│ Payment Card 1                  │
│ Payment Card 2                  │
│ Payment Card 3                  │
├─────────────────────────────────┤
│ Bottom Navigation               │
└─────────────────────────────────┘
```

### Component Mapping

| Figma Element        | SportHawk Component       | Status   | Notes                                                |
| -------------------- | ------------------------- | -------- | ---------------------------------------------------- |
| `team-dropdown`      | Existing team nav pattern | ✅ Reuse | Already implemented                                  |
| Tab buttons          | `ShButton`                | ✅ Reuse | With active/inactive variants                        |
| "Upcoming Payments"  | `ShText`                  | ✅ Reuse | `ShTextVariant.Heading`                              |
| "This Week" dropdown | `ShFormFieldSelect`       | ✅ Reuse | With down arrow icon                                 |
| `list-payments` card | `AdminPaymentCard`        | 🆕 New   | Custom admin card                                    |
| Payment Title        | `ShText`                  | ✅ Reuse | `ShTextVariant.Body`                                 |
| Team Type            | `ShText`                  | ✅ Reuse | `ShTextVariant.Small` + `colorPalette.textSecondary` |
| Amount badge         | `ShAmountDisplay`         | ✅ Reuse | With badge styling                                   |
| Calendar icon        | `ShIcon`                  | ✅ Reuse | `IconName.Calendar`                                  |
| Clock icon           | `ShIcon`                  | ✅ Reuse | `IconName.Clock`                                     |
| Date/Time text       | `ShText`                  | ✅ Reuse | `ShTextVariant.Body`                                 |
| "Manage Request"     | `ShButton`                | ✅ Reuse | Primary variant, full width                          |
| `bottom-nav`         | Existing bottom nav       | ✅ Reuse | Standard navigation                                  |

### Style Constants

```typescript
// From Figma variables
backgroundColor: colorPalette.baseDark; // #161615
cardBackground: 'rgba(0,0,0,0.3)';
cardBorder: 'rgba(158,155,151,0.2)';
buttonColor: colorPalette.primaryGold; // #eabd22
textColor: colorPalette.lightText; // #eceae8
subtextColor: colorPalette.stoneGrey; // #9e9b97
```

---

## Screen 2: Payment Details Admin (Figma 559-2792)

### Layout Structure

```
┌─────────────────────────────────┐
│ ← Payment Details        ⋮      │
├─────────────────────────────────┤
│ Payment Title                   │
│ Requested by [Avatar] Team Name │
│ ┌───────────────────────────┐   │
│ │ ⏰ Due by May 14 • 23:59  │   │
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ Description                     │
│ Text content...                 │
├─────────────────────────────────┤
│ │ Total          £120.00 │      │
├─────────────────────────────────┤
│ Responses        Most Recent ▼  │
│ [Paid: 16]  [Unpaid: 7]        │
├─────────────────────────────────┤
│ [Avatar] User          [Paid]   │
│ [Avatar] User        [Unpaid]   │
└─────────────────────────────────┘
```

### Component Mapping

| Figma Element          | SportHawk Component           | Status   | Notes                        |
| ---------------------- | ----------------------------- | -------- | ---------------------------- |
| Back arrow             | `ShHeaderButton`              | ✅ Reuse | Standard back navigation     |
| "Payment Details"      | `ShText`                      | ✅ Reuse | Header title                 |
| Edit button (⋮)        | `ShDotMenu`                   | 🆕 New   | Three-dot menu               |
| Payment Title          | `ShText`                      | ✅ Reuse | `ShTextVariant.Heading`      |
| "Requested by"         | `ShText`                      | ✅ Reuse | `ShTextVariant.Caption`      |
| Team avatar            | `ShAvatar`                    | ✅ Reuse | Small size                   |
| Team Name              | `ShText`                      | ✅ Reuse | `ShTextVariant.Caption`      |
| Due date banner        | `ShDueDateBanner`             | ✅ Reuse | With warning styling         |
| Clock icon             | `ShIcon`                      | ✅ Reuse | `IconName.Clock` with yellow |
| Description section    | `ShSectionContent`            | ✅ Reuse | Standard section             |
| Total box              | Container + `ShAmountDisplay` | ✅ Reuse | With background              |
| "Responses" heading    | `ShText`                      | ✅ Reuse | `ShTextVariant.Heading`      |
| "Most Recent" dropdown | `ShFormFieldSelect`           | ✅ Reuse | Inline style                 |
| Paid badge             | `ShPaymentStatusBadge`        | 🆕 New   | Green variant                |
| Unpaid badge           | `ShPaymentStatusBadge`        | 🆕 New   | Red variant                  |
| Member row             | `AdminPaymentMemberItem`      | 🆕 New   | With status badge            |
| User avatar            | `ShAvatar`                    | ✅ Reuse | Within member item           |
| User name              | `ShText`                      | ✅ Reuse | `ShTextVariant.Body`         |

### Style Constants

```typescript
// Status colors from Figma
paidBackground: 'rgba(39,174,96,0.2)';
paidText: colorPalette.success; // #27ae60
unpaidBackground: 'rgba(231,76,60,0.2)';
unpaidText: colorPalette.error; // #e74c3c
dueDateBackground: 'rgba(234,189,34,0.1)';
dueDateBorder: 'rgba(234,189,34,0.2)';
```

---

## Screen 3: Edit Payment Request (Figma 559-2709)

### Layout Structure

```
┌─────────────────────────────────┐
│ ← Edit Request          Save    │
├─────────────────────────────────┤
│ Title *                         │
│ [___________________]           │
│                                 │
│ Description                     │
│ [___________________]           │
│ [___________________]           │
│                                 │
│ Due by *                        │
│ [Select date and time    📅]    │
│                                 │
│ Type *                          │
│ [Select type             ▼]     │
│                                 │
│ Members *                       │
│ [All team members        →]     │
│                                 │
│ Stripe ID (read only) *         │
│ [acct_XxxxxxxxxxxxxxX]          │
│                                 │
│ Base Price                      │
│ [Enter base price    ℹ]         │
│ ┌───────────────────────┐       │
│ │ You will receive £150 │       │
│ │ Transaction fee  £4.06│       │
│ │ Total price   £154.06 │       │
│ └───────────────────────┘       │
│                                 │
│ Add transaction fee [Toggle ON] │
│                                 │
│ [Cancel Payment Request]        │
└─────────────────────────────────┘
```

### Component Mapping

| Figma Element      | SportHawk Component    | Status   | Notes                       |
| ------------------ | ---------------------- | -------- | --------------------------- |
| Back button        | `ShHeaderButton`       | ✅ Reuse | Standard back               |
| "Edit Request"     | `ShText`               | ✅ Reuse | Header title                |
| "Save" button      | `ShButton`             | ✅ Reuse | Text variant, warning color |
| Title field        | `ShFormFieldText`      | ✅ Reuse | With required (\*)          |
| Description field  | `ShFormFieldTextArea`  | ✅ Reuse | Multi-line                  |
| Due by picker      | `ShFormFieldDateTime`  | ✅ Reuse | Date + time                 |
| Calendar icon      | `ShIcon`               | ✅ Reuse | `IconName.Calendar`         |
| Type dropdown      | `ShFormFieldSelect`    | ✅ Reuse | With down arrow             |
| Members dropdown   | `ShFormFieldSelect`    | ✅ Reuse | With right arrow            |
| Down arrow         | `ShIcon`               | ✅ Reuse | `IconName.ChevronDown`      |
| Right arrow        | `ShIcon`               | ✅ Reuse | `IconName.ChevronRight`     |
| Stripe ID field    | `ShFormFieldReadOnly`  | ✅ Reuse | Disabled state              |
| Base Price input   | `ShPaymentAmountInput` | ✅ Reuse | Currency input              |
| Help icon          | `ShIcon`               | ✅ Reuse | `IconName.Help`             |
| Fee calculator box | `ShFeeCalculator`      | ✅ Reuse | Breakdown display           |
| Toggle switch      | `ShToggleField`        | ✅ Reuse | Active state                |
| Cancel button      | `ShButton`             | ✅ Reuse | Error variant               |

### Form Validation

- Required fields marked with `*` and `colorPalette.primaryGold`
- Read-only fields use `colorPalette.textSecondary`
- Error states use `colorPalette.error`

---

## New Components Summary

### 1. AdminPaymentCard

```typescript
interface AdminPaymentCardProps {
  id: string;
  title: string;
  teamType: string;
  amount: number;
  dueDate: string;
  dueTime: string;
  paidCount?: number;
  totalCount?: number;
  onManage: () => void;
}
```

### 2. ShPaymentStatusBadge

```typescript
interface ShPaymentStatusBadgeProps {
  status: 'paid' | 'unpaid' | 'pending';
  count?: number;
  size?: 'small' | 'medium';
}
```

### 3. ShDotMenu

```typescript
interface ShDotMenuProps {
  options: Array<{
    label: string;
    action: () => void;
    destructive?: boolean;
  }>;
  testID?: string;
}
```

### 4. AdminPaymentMemberItem

```typescript
interface AdminPaymentMemberItemProps {
  name: string;
  photoUri?: string | null;
  paymentStatus: 'paid' | 'unpaid' | 'pending';
  amount?: number;
  onPress?: () => void;
  testID?: string;
}
```

---

## Implementation Notes

### Color Palette Strict Usage

```typescript
// NEVER hardcode colors, always use:
import { colorPalette } from '@cfg/colors';

// Figma → Config mapping
'#161615' → colorPalette.baseDark
'#eabd22' → colorPalette.primaryGold
'#eceae8' → colorPalette.lightText
'#9e9b97' → colorPalette.stoneGrey
'#27ae60' → colorPalette.success
'#e74c3c' → colorPalette.error
```

### Typography Strict Usage

```typescript
// NEVER hardcode font sizes, always use:
import { ShTextVariant } from '@cfg/typography';

// Figma → Config mapping
20px Medium → ShTextVariant.Heading
18px Regular → ShTextVariant.Body
16px Regular → ShTextVariant.Body
14px Regular → ShTextVariant.Small
12px Regular → ShTextVariant.Caption
```

### Spacing Strict Usage

```typescript
// NEVER hardcode spacing, always use:
import { spacing } from '@cfg/spacing';

// Common spacings
padding: spacing.md; // 16px
gap: spacing.sm; // 8px
borderRadius: spacing.borderRadiusMedium; // 12px
```

### Icon Usage

```typescript
// NEVER hardcode icon names, always use:
import { IconName } from '@cfg/icons';

// Available icons for this story
IconName.Calendar;
IconName.Clock;
IconName.ChevronDown;
IconName.ChevronRight;
IconName.MoreVertical;
IconName.Help;
IconName.ArrowLeft;
```

---

## Testing Checklist

- [ ] All Figma colors match configured palette
- [ ] All text uses ShTextVariant sizes
- [ ] All spacing uses spacing config
- [ ] No hardcoded values anywhere
- [ ] Touch targets minimum 44x44
- [ ] Accessibility labels present
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Empty states designed
- [ ] Pull-to-refresh works
- [ ] Navigation flows correctly

---

## Change Log

| Date       | Version | Author     | Changes                         |
| ---------- | ------- | ---------- | ------------------------------- |
| 2025-09-08 | 1.0     | Sarah (PO) | Initial Figma translation layer |
