# PAY-006 Figma Translation Layer

**Story:** PAY-006 - Payment History (Member)  
**Status:** Ready for Development  
**Design Reference:** Figma screens 559:7147 (list), 559:7357 (detail)

## 1. Screen Structure

### Payment History List (559:7147)

```
PaymentHistoryScreen
├── ShScreenContainer
│   ├── ShTopNavBack
│   │   ├── Back Button (TouchableOpacity)
│   │   └── Title: "Payment History"
│   └── ScrollView
│       ├── HeaderSection
│       │   ├── Title: "Payment History"
│       │   └── SortDropdown: "Most Recent"
│       └── PaymentList
│           └── PaymentCard (repeated)
│               ├── PaymentInfo
│               │   ├── Title
│               │   ├── TeamName
│               │   └── AmountBadge
│               ├── DateTimeRow
│               │   ├── CalendarIcon
│               │   ├── Date
│               │   ├── ClockIcon
│               │   └── Time
│               └── ViewButton
```

### Payment Detail (559:7357)

```
PaymentDetailScreen
├── ShScreenContainer
│   ├── ShTopNavBack
│   │   ├── Back Button
│   │   └── Title: "Payment Details"
│   └── ScrollView
│       ├── PaymentHeader
│       │   ├── Title
│       │   └── RequestedBy
│       │       ├── Avatar
│       │       └── TeamName
│       ├── StatusCard
│       │   ├── StatusIcon
│       │   ├── StatusText
│       │   └── DateTime
│       ├── DescriptionSection
│       │   ├── Title
│       │   └── Text
│       └── TotalCard
│           ├── Label
│           └── Amount
```

## 2. Figma to React Native Component Mapping

### Navigation Components

| Figma Element           | React Native Component    | Props/Style                        |
| ----------------------- | ------------------------- | ---------------------------------- |
| top-nav-back (559:7150) | ShTopNavBack              | Standard back navigation           |
| back-arrow (172:960)    | TouchableOpacity + ShIcon | IconName.ChevronLeft               |
| Title text              | ShText                    | ShTextVariant.Body, center aligned |

### List Screen Components

| Figma Element            | React Native Component    | Implementation                                                                                           |
| ------------------------ | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| Header "Payment History" | ShText                    | ShTextVariant.SubHeading                                                                                 |
| Sort dropdown            | TouchableOpacity + ShText | ShTextVariant.Body, stoneGrey                                                                            |
| down-arrow               | ShIcon                    | IconName.ChevronDown                                                                                     |
| list-payments card       | View                      | backgroundColor: colorPalette.paymentCardBackground, borderRadius: PaymentUIConstants.CARD_BORDER_RADIUS |
| Payment title            | ShText                    | ShTextVariant.Body                                                                                       |
| Team name                | ShText                    | ShTextVariant.Small, textSecondary                                                                       |
| Amount badge             | View + ShText             | backgroundColor: colorPalette.paymentAmountBadge, borderRadius: PaymentUIConstants.BADGE_BORDER_RADIUS   |
| Calendar icon            | ShIcon                    | IconName.Calendar, size: PaymentUIConstants.ICON_SIZE_SMALL                                              |
| Clock icon               | ShIcon                    | IconName.Clock, size: PaymentUIConstants.ICON_SIZE_MEDIUM                                                |
| Date/time text           | ShText                    | ShTextVariant.Body, textSecondary                                                                        |
| View button              | TouchableOpacity          | backgroundColor: colorPalette.primary, borderRadius: PaymentUIConstants.BUTTON_BORDER_RADIUS             |

### Detail Screen Components

| Figma Element        | React Native Component | Implementation                                                                              |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------------------- |
| Payment title        | ShText                 | ShTextVariant.SubHeading                                                                    |
| "Requested by" label | ShText                 | ShTextVariant.Small, textSecondary                                                          |
| Team avatar          | Image                  | borderRadius: PaymentUIConstants.AVATAR_BORDER_RADIUS, size: PaymentUIConstants.AVATAR_SIZE |
| Team name            | ShText                 | ShTextVariant.Small, textSecondary                                                          |
| Status card          | View                   | backgroundColor: PaymentStatusConfig[status].backgroundColor                                |
| Status icon          | ShIcon                 | PaymentStatusConfig[status].icon, color: PaymentStatusConfig[status].textColor              |
| Status text          | ShText                 | ShTextVariant.Body, color: PaymentStatusConfig[status].textColor                            |
| Date/time            | ShText                 | ShTextVariant.Body, color: PaymentStatusConfig[status].textColor                            |
| Description title    | ShText                 | ShTextVariant.SubHeading                                                                    |
| Description text     | ShText                 | ShTextVariant.Body, textSecondary                                                           |
| Total card           | View                   | backgroundColor: colorPalette.paymentTotalCardBg                                            |
| Total label          | ShText                 | ShTextVariant.Body                                                                          |
| Total amount         | ShText                 | ShTextVariant.SubHeading                                                                    |

## 3. Color Palette Mapping

| Figma Color                 | Variable Name                         | Usage                      |
| --------------------------- | ------------------------------------- | -------------------------- |
| Base Dark                   | colorPalette.baseDark                 | Screen background          |
| Light Text                  | colorPalette.lightText                | Primary text               |
| Stone Grey                  | colorPalette.stoneGrey                | Secondary text, labels     |
| Primary Gold                | colorPalette.primary                  | View button, active states |
| Success Green               | colorPalette.paymentStatusPaid        | Paid status text           |
| Error Red                   | colorPalette.paymentStatusFailed      | Failed status text         |
| Card Background             | colorPalette.paymentCardBackground    | Payment cards              |
| Badge Background            | colorPalette.paymentAmountBadge       | Amount badges              |
| Status Paid Background      | colorPalette.paymentStatusPaidBg      | Success status card        |
| Status Failed Background    | colorPalette.paymentStatusFailedBg    | Failed status card         |
| Status Cancelled Background | colorPalette.paymentStatusCancelledBg | Cancelled status card      |

## 4. Typography Mapping

| Figma Style     | ShTextVariant            | Font Specs         | Usage                   |
| --------------- | ------------------------ | ------------------ | ----------------------- |
| Heading         | ShTextVariant.Heading    | Inter Medium 20px  | Screen titles           |
| Subheading Text | ShTextVariant.SubHeading | Inter Medium 20px  | Section headers         |
| Body Text       | ShTextVariant.Body       | Inter Regular 18px | Payment titles, content |
| Label Text      | ShTextVariant.Label      | Inter Regular 16px | Field labels            |
| Small Text      | ShTextVariant.Small      | Inter Regular 14px | Team names, metadata    |
| Button Text     | ShTextVariant.Button     | Inter Regular 16px | View button text        |

## 5. Spacing Guidelines

| Spacing        | Value                                      | Usage                      |
| -------------- | ------------------------------------------ | -------------------------- |
| Screen padding | spacing.lg (24px)                          | Main content padding       |
| Card padding   | PaymentUIConstants.CARD_PADDING            | Internal card padding      |
| Section gap    | PaymentUIConstants.SECTION_GAP             | Between major sections     |
| Item gap       | PaymentUIConstants.ITEM_GAP                | Between list items         |
| Row gap        | PaymentUIConstants.ROW_GAP                 | Between date/time elements |
| Button padding | spacing.md vertical, calculated horizontal | View button                |

## 6. Interactive Elements

### Sort Dropdown

- TouchableOpacity wrapper
- Shows PaymentSortLabels[PaymentSortOptions.RECENT] by default
- Down arrow icon indicates dropdown
- Opens ActionSheet with options from PaymentSortLabels:
  ```typescript
  import { PaymentSortLabels, PaymentSortOptions } from '@/config/payments';
  // Use Object.values(PaymentSortLabels) for options
  ```

### Payment Cards

- TouchableOpacity for entire card (alternative to View button)
- Subtle press feedback (opacity: PaymentUIConstants.CARD_PRESS_OPACITY)
- Navigate to payment detail on press

### View Payment Button

- Primary gold background (colorPalette.primary)
- Black text (colorPalette.baseDark)
- Border radius: PaymentUIConstants.BUTTON_BORDER_RADIUS
- Height: PaymentUIConstants.BUTTON_HEIGHT
- Full width within card padding

## 7. Status Variations

### Payment Status Configuration

Status styles are managed via `PaymentStatusConfig` from `/config/payments.ts`:

```typescript
import { PaymentStatusConfig, PaymentStatus } from '@/config/payments';

const statusConfig = PaymentStatusConfig[payment.status];
// Use: statusConfig.backgroundColor, statusConfig.textColor, statusConfig.icon, statusConfig.label
```

## 8. Empty State

When no payment history exists:

```jsx
<View style={styles.emptyState}>
  <ShIcon
    name={IconName.Receipt}
    size={PaymentUIConstants.ICON_SIZE_LARGE}
    color={colorPalette.textSecondary}
  />
  <ShText variant={ShTextVariant.Body} color={colorPalette.textSecondary}>
    No payment history yet
  </ShText>
  <ShText variant={ShTextVariant.Small} color={colorPalette.textSecondary}>
    Your completed payments will appear here
  </ShText>
</View>
```

## 9. Loading State

While fetching payment history:

```jsx
<View style={styles.loadingContainer}>
  <ShActivityIndicator size="large" />
  <ShText variant={ShTextVariant.Small} color={colorPalette.textSecondary}>
    Loading payment history...
  </ShText>
</View>
```

## 10. Implementation Notes

### Data Format

```typescript
import { PaymentHistoryStatusType } from '@/config/payments';

interface PaymentHistoryItem {
  id: string;
  title: string;
  team_name: string;
  amount_pence: number;
  payment_date: string;
  status: PaymentHistoryStatusType;
  stripe_payment_intent_id?: string;
}

interface PaymentDetail extends PaymentHistoryItem {
  description: string;
  requested_by: {
    name: string;
    avatar_url?: string;
  };
  created_at: string;
  transaction_fee_pence?: number;
  net_amount_pence?: number;
}
```

### Navigation

- From Profile tab → Payment History button
- From Payment History list → Payment Detail
- Back navigation returns to previous screen

### Amount Display

- Use `formatCurrency` from `/config/payments.ts`:
  ```typescript
  import { formatCurrency } from '@/config/payments';
  const displayAmount = formatCurrency(payment.amount_pence); // "£120.00"
  ```

### Date/Time Formatting

- Use formatting functions from `/config/payments.ts`:

  ```typescript
  import {
    formatPaymentDate,
    formatPaymentTime,
    formatPaymentDateTime,
  } from '@/config/payments';

  const dateStr = formatPaymentDate(payment.payment_date); // "Saturday, May 15"
  const timeStr = formatPaymentTime(payment.payment_date); // "23:59"
  const fullDateTime = formatPaymentDateTime(payment.payment_date); // "May 14, 2025 • 23:59"
  ```

## 11. Accessibility

- All interactive elements have appropriate touch targets (min PaymentUIConstants.MIN_TOUCH_TARGET x PaymentUIConstants.MIN_TOUCH_TARGET)
- Screen reader labels for icons
- Proper heading hierarchy
- Status announcements for screen readers
- Currency amounts read correctly

## 12. Platform Differences

### iOS

- Native back swipe gesture enabled
- System font for better readability

### Android

- Hardware back button support
- Material Design ripple effects on touch

## 13. Performance Considerations

- Display maximum PaymentUIConstants.PAYMENT_HISTORY_LIMIT payments (no pagination needed at MVP)
- Optimize image loading for avatars
- Use FlatList for smooth scrolling
- Implement pull-to-refresh
- No offline caching required (always-online app)

## 14. Error Handling

- Network errors: Show retry button
- Empty results: Show empty state
- Failed to load detail: Show error message with retry
- All errors logged with: `logger.error('[PAY-006] Error description:', error)`

## 15. Logging Requirements

Use logger utility for all debugging:

```typescript
import { logger } from '@/lib/utils/logger';

// Component lifecycle
logger.log('[PAY-006] Payment history screen mounted');
logger.log('[PAY-006] User selected payment:', paymentId);

// Data operations
logger.log('[PAY-006] Fetching payment history');
logger.debug('[PAY-006] Rendering', payments.length, 'payment cards');

// Errors
logger.error('[PAY-006] Failed to load payments:', error);
```
