# Team Admin Screens - Figma to Config Mapping

## Critical: NO MAGIC VALUES - All Figma values mapped to config files

### Color Mapping (Figma → config/colors.ts)

| Figma Value           | Figma Name       | Config Path                           | Config Value                  |
| --------------------- | ---------------- | ------------------------------------- | ----------------------------- |
| #eabd22               | Primary Gold     | `colorPalette.primaryGold`            | '#eabd22' ✅                  |
| #161615               | Base Dark        | `colorPalette.baseDark`               | '#161615' ✅                  |
| #eceae8               | Light Text       | `colorPalette.lightText`              | '#eceae8' ✅                  |
| #9e9b97               | Stone Grey       | `colorPalette.stoneGrey`              | '#9e9b97' ✅                  |
| rgba(0,0,0,0.3)       | Card Background  | `colorPalette.backgroundListItem`     | 'rgba(0, 0, 0, 0.3)' ✅       |
| rgba(158,155,151,0.2) | Border Color     | `colorPalette.borderInputField`       | 'rgba(158, 155, 151, 0.2)' ✅ |
| rgba(234,189,34,0.1)  | Alert Background | `colorPalette.paymentDueDateBannerBg` | 'rgba(234, 189, 34, 0.1)' ✅  |

### Typography Mapping (Figma → config/typography.ts)

| Figma Style      | Figma Spec                          | Config Path                   | Config Value                                             |
| ---------------- | ----------------------------------- | ----------------------------- | -------------------------------------------------------- |
| Subheading Text  | Inter Medium 20px, -0.04px tracking | `typographyStyles.subheading` | fontSize: 20, fontWeight: '500', letterSpacing: -0.04 ✅ |
| Body Text        | Inter Regular 16px                  | `typographyStyles.body`       | fontSize: 16, fontWeight: '400' ✅                       |
| Caption/Subtitle | Inter Regular 14px                  | `typographyStyles.label`      | fontSize: 14, fontWeight: '400' ✅                       |
| Small Text       | Inter Regular 12px                  | `typographyStyles.small`      | fontSize: 12, fontWeight: '400' ✅                       |

### Spacing & Sizing Mapping (Figma → config/spacing.ts)

| Figma Element      | Figma Value | Config Path                 | Config Value |
| ------------------ | ----------- | --------------------------- | ------------ |
| Card Height        | 80px        | `spacing.userListHeight`    | 80 ✅        |
| Search Bar Height  | 50px        | `spacing.buttonHeightLarge` | 50 ✅        |
| Card Border Radius | 12px        | `spacing.borderRadiusLarge` | 12 ✅        |
| Card Padding       | 16px        | `spacing.cardPadding`       | 16 ✅        |
| Section Gap        | 24px        | `spacing.sectionSpacing`    | 24 ✅        |
| Card Gap           | 12px        | `spacing.sectionListGap`    | 12 ✅        |
| Avatar Size        | 48px        | `spacing.avatarSizeLarge`   | 48 ✅        |
| Icon Size          | 16px        | `spacing.iconSizeSmall`     | 16 ✅        |
| Button Height      | 50px        | `spacing.buttonHeightLarge` | 50 ✅        |
| Border Width       | 1px         | `spacing.borderWidthThin`   | 1 ✅         |
| Content Padding    | 24px        | `spacing.xxl`               | 24 ✅        |

### New Config Values Needed

These Figma values don't have exact matches and need to be added to config:

```typescript
// Add to spacing.ts
export const spacing = {
  ...existing,

  // Team Admin specific
  searchDebounceMs: 300, // Figma spec: 300ms debounce
  removeIconWidth: 12, // Figma: Remove icon horizontal bar width
  removeIconHeight: 2, // Figma: Remove icon horizontal bar height
  addMembersCardHeight: 88, // Figma: Add members card specific height
  interestCardButtonWidth: 145, // Figma: Accept/Ignore button width (144.795px)
  alertIconContainerSize: 40, // Figma: Alert icon background container
  navHeaderHeight: 112, // Figma: Top navigation with back button
};

// Add to colors.ts (if not present)
export const colorPalette = {
  ...existing,

  // Alert icon background (if using different from payment banner)
  alertIconBackground: 'rgba(234, 189, 34, 0.1)',
};
```

## Component Implementation Using Config

### Example: Member Card Component

```typescript
// ShMemberCard.tsx - NO MAGIC VALUES
import { colorPalette } from '@cfg/colors';
import { spacing } from '@cfg/spacing';
import { typographyStyles } from '@cfg/typography';

const styles = StyleSheet.create({
  container: {
    height: spacing.userListHeight, // 80px from config
    backgroundColor: colorPalette.backgroundListItem, // rgba(0,0,0,0.3)
    borderWidth: spacing.borderWidthThin, // 1px
    borderColor: colorPalette.borderInputField, // rgba(158,155,151,0.2)
    borderRadius: spacing.borderRadiusLarge, // 12px
    padding: spacing.cardPadding, // 16px
  },
  avatar: {
    width: spacing.avatarSizeLarge, // 48px
    height: spacing.avatarSizeLarge, // 48px
    borderRadius: spacing.avatarSizeLarge / 2, // circular
  },
  name: {
    ...typographyStyles.body, // Inter Regular 16px
    color: colorPalette.lightText, // #eceae8
  },
  subtitle: {
    ...typographyStyles.label, // Inter Regular 14px
    color: colorPalette.stoneGrey, // #9e9b97
  },
  removeIcon: {
    width: spacing.removeIconWidth, // 12px
    height: spacing.removeIconHeight, // 2px
    backgroundColor: colorPalette.primaryGold, // #eabd22
  },
});
```

### Example: Search Bar Component

```typescript
// ShSearchBar.tsx - NO MAGIC VALUES
const styles = StyleSheet.create({
  container: {
    height: spacing.buttonHeightLarge, // 50px
    backgroundColor: colorPalette.backgroundListItem, // rgba(0,0,0,0.3)
    borderWidth: spacing.borderWidthThin, // 1px
    borderColor: colorPalette.borderInputField, // rgba(158,155,151,0.2)
    borderRadius: spacing.borderRadiusLarge, // 12px
  },
  icon: {
    width: spacing.iconSizeSmall, // 16px
    height: spacing.iconSizeSmall, // 16px
    position: 'absolute',
    left: spacing.lg, // 16px
  },
  placeholder: {
    ...typographyStyles.body, // Inter Regular 16px
    color: colorPalette.stoneGrey, // #9e9b97
  },
});

// Debounce configuration
const SEARCH_DEBOUNCE_MS = spacing.searchDebounceMs; // 300ms from config
```

## Validation Checklist

- [ ] ✅ All colors use `colorPalette.*` values
- [ ] ✅ All spacing uses `spacing.*` values
- [ ] ✅ All typography uses `typographyStyles.*` values
- [ ] ✅ No hardcoded hex colors (e.g., '#eabd22')
- [ ] ✅ No hardcoded pixel values (e.g., '80px')
- [ ] ✅ No hardcoded rgba values (e.g., 'rgba(0,0,0,0.3)')
- [ ] ✅ Search debounce uses config value (300ms)
- [ ] ✅ Icon dimensions use config values

## Implementation Notes

1. **Always import from config**:

   ```typescript
   import { colorPalette } from '@cfg/colors';
   import { spacing } from '@cfg/spacing';
   import { typographyStyles } from '@cfg/typography';
   ```

2. **Never use inline styles with magic values**:

   ```typescript
   // ❌ WRONG
   <View style={{ height: 80, backgroundColor: 'rgba(0,0,0,0.3)' }}>

   // ✅ CORRECT
   <View style={{
     height: spacing.userListHeight,
     backgroundColor: colorPalette.backgroundListItem
   }}>
   ```

3. **Component props should accept config keys**:

   ```typescript
   interface Props {
     color?: keyof typeof colorPalette; // Type-safe color selection
     spacing?: keyof typeof spacing; // Type-safe spacing selection
   }
   ```

4. **Calculated values should reference config**:

   ```typescript
   // ❌ WRONG
   const iconTop = 40 - 8; // Magic numbers

   // ✅ CORRECT
   const iconTop = spacing.avatarSizeMedium - spacing.sm; // 40 - 8 = 32
   ```

This mapping ensures 100% compliance with the existing config system and ZERO magic values in implementation.
