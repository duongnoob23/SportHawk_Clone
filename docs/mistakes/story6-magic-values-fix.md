# PAY-006 Magic Values Fix Documentation

**Date:** 2025-01-08  
**Story:** PAY-006 - Payment History  
**Fixed By:** Assistant

## Problem

Multiple magic numbers and hardcoded values found throughout PAY-006 documentation, violating the principle of using named constants from config files.

## Magic Values Found and Fixed

### 1. Icon Sizes (❌ → ✅)

- **Before:** `size={14}`, `size={16}`, `size={48}`
- **After:**
  - `size={PaymentUIConstants.ICON_SIZE_SMALL}` (14)
  - `size={PaymentUIConstants.ICON_SIZE_MEDIUM}` (16)
  - `size={PaymentUIConstants.ICON_SIZE_LARGE}` (48)

### 2. Border Radius Values (❌ → ✅)

- **Before:** `borderRadius: 8`, `borderRadius: 12`, `borderRadius: 16`
- **After:**
  - `borderRadius: PaymentUIConstants.BADGE_BORDER_RADIUS` (8)
  - `borderRadius: PaymentUIConstants.BUTTON_BORDER_RADIUS` (12)
  - `borderRadius: PaymentUIConstants.CARD_BORDER_RADIUS` (16)

### 3. Opacity Values (❌ → ✅)

- **Before:** `activeOpacity={0.95}`
- **After:** `activeOpacity={PaymentUIConstants.CARD_PRESS_OPACITY}`

### 4. Avatar Dimensions (❌ → ✅)

- **Before:** `width: 24, height: 24, borderRadius: 12`
- **After:**
  - `width/height: PaymentUIConstants.AVATAR_SIZE` (24)
  - `borderRadius: PaymentUIConstants.AVATAR_BORDER_RADIUS_HALF` (12)

### 5. RGBA Color Values (❌ → ✅)

- **Before:** Multiple hardcoded rgba values
- **After:** Added to `colorPalette`:
  - `paymentCardBackground: 'rgba(0, 0, 0, 0.3)'`
  - `paymentAmountBadge: 'rgba(158, 155, 151, 0.2)'`
  - `paymentCardBorder: 'rgba(158, 155, 151, 0.2)'`
  - `paymentErrorContainerBg: 'rgba(235, 87, 87, 0.1)'`
  - `paymentStatusPaidBg: 'rgba(39, 174, 96, 0.2)'`
  - `paymentStatusFailedBg: 'rgba(235, 87, 87, 0.2)'`
  - `paymentStatusCancelledBg: 'rgba(158, 155, 151, 0.2)'`

### 6. Miscellaneous Constants (❌ → ✅)

- **Before:** `borderWidth: 1`, `paddingVertical: spacing.xxl * 2`, `cancelButtonIndex: 4`
- **After:**
  - `borderWidth: PaymentUIConstants.CARD_BORDER_WIDTH` (1)
  - `paddingVertical: spacing.xxl * PaymentUIConstants.EMPTY_STATE_PADDING_MULTIPLIER` (2)
  - `cancelButtonIndex: PaymentUIConstants.ACTION_SHEET_CANCEL_INDEX` (4)

### 7. Status String Literals (❌ → ✅)

- **Before:** `'paid' | 'failed' | 'cancelled'`
- **After:** `PaymentHistoryStatusType` from `/config/payments.ts`

### 8. Payment Status Cases (❌ → ✅)

- **Before:** `case 'paid':`, `case 'failed':`
- **After:** `case PaymentStatus.PAID:`, `case PaymentStatus.FAILED:`

## New Constants Added to Config Files

### `/config/payments.ts`

```typescript
// Added to PaymentUIConstants:
AVATAR_BORDER_RADIUS_HALF: 12,
CARD_BORDER_WIDTH: 1,
EMPTY_STATE_PADDING_MULTIPLIER: 2,
ACTION_SHEET_CANCEL_INDEX: 4,
ERROR_CONTAINER_BORDER_RADIUS: 8,
TOTAL_CARD_BORDER_RADIUS: 12,

// Added type:
PaymentHistoryStatusType
```

### `/config/colors.ts`

```typescript
// Added colors:
paymentErrorContainerBg: 'rgba(235, 87, 87, 0.1)',
paymentCardBorder: 'rgba(158, 155, 151, 0.2)',
```

## Files Updated

1. `/config/payments.ts` - Added missing UI constants
2. `/config/colors.ts` - Added missing color values
3. `/docs/stories/PAY-006-figma-translation-layer.md` - Fixed all magic values
4. `/docs/stories/PAY-006-payment-history.md` - Fixed all magic values
5. `/docs/stories/PAY-006-development-guide.md` - Fixed all magic values

## Verification

All magic numbers have been replaced with properly named constants. The code is now more maintainable and consistent with the project's coding standards.

## Lessons Learned

1. Always use named constants from config files
2. Never hardcode numeric values directly in components
3. All colors should be in the color palette
4. UI measurements should be in appropriate constant files
5. Status values should use typed enums/constants

## Impact

- ✅ Improved maintainability
- ✅ Consistent with project standards
- ✅ Type-safe status values
- ✅ Easier to update values globally
- ✅ Better documentation of intent
