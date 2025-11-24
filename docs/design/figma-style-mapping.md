# Figma Style Mapping Reference

**Version:** 2.0  
**Date:** 2025-09-03  
**Status:** Active Reference Document

## Overview

This document provides the complete mapping between Figma's semantic style names and SportHawk's configuration system. **EVERY UI element in Figma may have semantic style names** - not just text. All BMad personas MUST extract and use these mappings when implementing UI from Figma designs.

## Critical Requirement: Check EVERYTHING for Semantic Names

**MANDATORY EXTRACTION PROTOCOL:**

1. **Text elements** - Font styles (e.g., "Subheading Text", "Body Text")
2. **Colors** - Named colors (e.g., "Primary Gold", "Base Dark")
3. **Buttons** - Component variants (e.g., "Primary Button", "Secondary Button")
4. **Icons** - Icon styles (e.g., "Icon/Navigation", "Icon/Action")
5. **Spacing** - Layout tokens (e.g., "Spacing/Medium", "Padding/Large")
6. **Shadows** - Effect styles (e.g., "Shadow/Card", "Shadow/Modal")
7. **Borders** - Border styles (e.g., "Border/Default", "Border/Focus")
8. **Corner Radius** - Radius tokens (e.g., "Radius/Small", "Radius/Button")

## How to Extract ALL Figma Style Names

### Complete Extraction Process

```typescript
// Step 1: Get the code for the entire screen/component
mcp__figma-dev-mode-mcp-server__get_code(nodeId: "559:2744")

// Step 2: Extract ALL semantic style names for the node
mcp__figma-dev-mode-mcp-server__get_variable_defs(nodeId: "559:2744")

// Step 3: For EACH child element, repeat extraction
// Buttons
mcp__figma-dev-mode-mcp-server__get_variable_defs(nodeId: "559:2775") // Send button

// Icons
mcp__figma-dev-mode-mcp-server__get_variable_defs(nodeId: "559:2768") // Help icon

// Inputs
mcp__figma-dev-mode-mcp-server__get_variable_defs(nodeId: "559:2766") // Input field

// Even containers may have styles
mcp__figma-dev-mode-mcp-server__get_variable_defs(nodeId: "559:2755") // Card container
```

**CRITICAL**: Check EVERY element. Figma designers often apply semantic styles at any level.

## Text Style Mappings

### Complete Text Style Reference

| Figma Style Name    | ShTextVariant Enum         | Config Values                                           | Usage                          |
| ------------------- | -------------------------- | ------------------------------------------------------- | ------------------------------ |
| **Heading Text**    | `ShTextVariant.Heading`    | `fontSizes.xxl`, `fontWeights.bold`                     | Main screen titles             |
| **Subheading Text** | `ShTextVariant.SubHeading` | `fontSizes.lg`, `fontWeights.medium`                    | Section headers, modal titles  |
| **Body Text**       | `ShTextVariant.Body`       | `fontSizes.md`, `fontWeights.regular`                   | Default paragraph text         |
| **Label Text**      | `ShTextVariant.Label`      | `fontSizes.sm`, `fontWeights.medium`                    | Form field labels, button text |
| **Small Text**      | `ShTextVariant.Small`      | `fontSizes.sm`, `fontWeights.regular`                   | Help text, captions, meta info |
| **Light Text**      | `ShTextVariant.Light`      | `fontSizes.md`, `fontWeights.light`                     | Placeholder text, hints        |
| **Link Text**       | `ShTextVariant.Link`       | `fontSizes.md`, `fontWeights.regular`, `color: primary` | Clickable links                |
| **Error Text**      | `ShTextVariant.Error`      | `fontSizes.sm`, `fontWeights.regular`, `color: error`   | Error messages                 |

### Implementation Examples

```typescript
import { ShTextVariant } from '@cfg/typography';

// ❌ WRONG - Never use raw values
<ShText style={{ fontSize: 20, fontWeight: '500' }}>Create New</ShText>

// ❌ WRONG - Never use string literals
<ShText variant="subheading">Create New</ShText>

// ✅ CORRECT - Use enum with Figma style mapping
<ShText variant={ShTextVariant.SubHeading}>Create New</ShText>
```

## Color Style Mappings

### Complete Color Reference

| Figma Style Name  | Config Path                  | Hex Value               | Usage                                |
| ----------------- | ---------------------------- | ----------------------- | ------------------------------------ |
| **Primary Gold**  | `colorPalette.primary`       | `#eabd22`               | CTA buttons, active states, links    |
| **Base Dark**     | `colorPalette.background`    | `#161615`               | Screen backgrounds, card backgrounds |
| **Stone Grey**    | `colorPalette.textSecondary` | `#9e9b97`               | Muted text, placeholders, disabled   |
| **Light Text**    | `colorPalette.textPrimary`   | `#eceae8`               | Primary text on dark backgrounds     |
| **Pure White**    | `colorPalette.white`         | `#ffffff`               | Text on primary buttons              |
| **Error Red**     | `colorPalette.error`         | `#ff3b30`               | Error states, destructive actions    |
| **Success Green** | `colorPalette.success`       | `#34c759`               | Success states, confirmations        |
| **Border Light**  | `colorPalette.borderLight`   | `rgba(158,155,151,0.2)` | Input borders, dividers              |

### Implementation Examples

```typescript
import { colorPalette } from '@cfg/colors';

// ❌ WRONG - Never use hex values
backgroundColor: '#161615';

// ❌ WRONG - Never use rgba directly
borderColor: 'rgba(158,155,151,0.2)';

// ✅ CORRECT - Use config mapping
backgroundColor: colorPalette.background;
borderColor: colorPalette.borderLight;
```

## Button Style Mappings

### Button Component Variants

**CRITICAL**: Buttons in Figma often have semantic names at multiple levels:

- Component variant name (e.g., "Button/Primary")
- State variants (e.g., "State/Default", "State/Pressed")
- Size variants (e.g., "Size/Large", "Size/Small")

| Figma Semantic Name  | Config Path              | ShButton Usage                   | Notes                          |
| -------------------- | ------------------------ | -------------------------------- | ------------------------------ |
| **Button/Primary**   | `buttonStyles.primary`   | `<ShButton variant="primary">`   | Gold background, white text    |
| **Button/Secondary** | `buttonStyles.secondary` | `<ShButton variant="secondary">` | Outlined, gold border          |
| **Button/Ghost**     | `buttonStyles.ghost`     | `<ShButton variant="ghost">`     | No background, gold text       |
| **Button/Danger**    | `buttonStyles.danger`    | `<ShButton variant="danger">`    | Red background for destructive |
| **Button/Link**      | `buttonStyles.link`      | `<ShButton variant="link">`      | Text only, underlined          |
| **Button/Icon**      | `buttonStyles.icon`      | `<ShButton variant="icon">`      | Icon only, no text             |

### Button State Mappings

| Figma State Name   | Style Changes | Implementation        |
| ------------------ | ------------- | --------------------- |
| **State/Default**  | Base styles   | Normal state          |
| **State/Pressed**  | Opacity: 0.8  | `activeOpacity={0.8}` |
| **State/Disabled** | Opacity: 0.5  | `disabled={true}`     |
| **State/Loading**  | Show spinner  | `loading={true}`      |

### Button Size Mappings

| Figma Size Name | Height | Padding   | Font Size |
| --------------- | ------ | --------- | --------- |
| **Size/Small**  | 32px   | 8px 16px  | 14px      |
| **Size/Medium** | 40px   | 12px 20px | 16px      |
| **Size/Large**  | 48px   | 16px 24px | 18px      |

## Icon Style Mappings

### Icon Semantic Names

**IMPORTANT**: Icons in Figma have semantic names that MUST map to our IconName enum.

| Figma Icon Name             | IconName Enum            | Usage Context      |
| --------------------------- | ------------------------ | ------------------ |
| **Icon/Navigation/Back**    | `IconName.ChevronLeft`   | Back navigation    |
| **Icon/Navigation/Forward** | `IconName.ChevronRight`  | Forward navigation |
| **Icon/Navigation/Menu**    | `IconName.Menu`          | Menu toggle        |
| **Icon/Action/Add**         | `IconName.Plus`          | Add actions        |
| **Icon/Action/Delete**      | `IconName.Trash`         | Delete actions     |
| **Icon/Action/Edit**        | `IconName.Edit`          | Edit actions       |
| **Icon/Status/Success**     | `IconName.CheckCircle`   | Success states     |
| **Icon/Status/Error**       | `IconName.XCircle`       | Error states       |
| **Icon/Status/Warning**     | `IconName.AlertTriangle` | Warning states     |
| **Icon/Payment/Card**       | `IconName.CreditCard`    | Payment methods    |
| **Icon/Calendar**           | `IconName.Calendar`      | Date selection     |
| **Icon/Help**               | `IconName.HelpCircle`    | Help/info          |

### Icon Size Mappings

| Figma Size Token     | Config Value       | Pixel Size |
| -------------------- | ------------------ | ---------- |
| **Icon/Size/Small**  | `iconSizes.small`  | 16px       |
| **Icon/Size/Medium** | `iconSizes.medium` | 24px       |
| **Icon/Size/Large**  | `iconSizes.large`  | 32px       |

## Input Field Style Mappings

### Input Component Variants

| Figma Variant Name | Component     | State    | Border Color  |
| ------------------ | ------------- | -------- | ------------- |
| **Input/Default**  | `ShTextInput` | Normal   | `borderLight` |
| **Input/Focused**  | `ShTextInput` | Focused  | `primary`     |
| **Input/Error**    | `ShTextInput` | Error    | `error`       |
| **Input/Disabled** | `ShTextInput` | Disabled | `borderLight` |
| **Input/Success**  | `ShTextInput` | Valid    | `success`     |

### Input Type Mappings

| Figma Input Type   | Component             | Keyboard |
| ------------------ | --------------------- | -------- |
| **Input/Text**     | `ShTextInput`         | Default  |
| **Input/Email**    | `ShFormFieldEmail`    | Email    |
| **Input/Password** | `ShFormFieldPassword` | Default  |
| **Input/Number**   | `ShNumberInput`       | Numeric  |
| **Input/Phone**    | `ShPhoneInput`        | Phone    |
| **Input/Date**     | `ShDatePicker`        | None     |
| **Input/Textarea** | `ShTextArea`          | Default  |

### Input Field Styles

| Figma State | Border Color               | Background                | Text Color                   |
| ----------- | -------------------------- | ------------------------- | ---------------------------- |
| Default     | `colorPalette.borderLight` | `colorPalette.background` | `colorPalette.textPrimary`   |
| Focused     | `colorPalette.primary`     | `colorPalette.background` | `colorPalette.textPrimary`   |
| Error       | `colorPalette.error`       | `colorPalette.background` | `colorPalette.textPrimary`   |
| Disabled    | `colorPalette.borderLight` | `rgba(158,155,151,0.1)`   | `colorPalette.textSecondary` |

## Layout Token Mappings

### Spacing Tokens

**CRITICAL**: Figma uses semantic spacing tokens that MUST be used instead of pixel values.

| Figma Token Name   | Config Path      | Pixel Value | Usage                          |
| ------------------ | ---------------- | ----------- | ------------------------------ |
| **Spacing/XXS**    | `spacing.xxs`    | `2px`       | Micro adjustments              |
| **Spacing/XS**     | `spacing.xs`     | `4px`       | Icon margins, tight spacing    |
| **Spacing/Small**  | `spacing.small`  | `8px`       | Inline spacing, small gaps     |
| **Spacing/Medium** | `spacing.medium` | `16px`      | Default padding, standard gaps |
| **Spacing/Large**  | `spacing.large`  | `24px`      | Section spacing, card padding  |
| **Spacing/XL**     | `spacing.xl`     | `32px`      | Screen padding, large sections |
| **Spacing/XXL**    | `spacing.xxl`    | `48px`      | Major section breaks           |

### Padding Tokens

| Figma Token Name          | Config Path                   | Value       | Usage                 |
| ------------------------- | ----------------------------- | ----------- | --------------------- |
| **Padding/Input**         | `spacing.inputPadding`        | `13px`      | Input field padding   |
| **Padding/Button/Small**  | `spacing.buttonPaddingSmall`  | `8px 16px`  | Small button padding  |
| **Padding/Button/Medium** | `spacing.buttonPaddingMedium` | `12px 20px` | Medium button padding |
| **Padding/Button/Large**  | `spacing.buttonPaddingLarge`  | `16px 24px` | Large button padding  |
| **Padding/Card**          | `spacing.cardPadding`         | `24px`      | Card content padding  |
| **Padding/Screen**        | `spacing.screenPadding`       | `24px`      | Screen edge padding   |

### Gap Tokens (for Flexbox)

| Figma Token Name | Config Path         | Value  | Usage                 |
| ---------------- | ------------------- | ------ | --------------------- |
| **Gap/Small**    | `spacing.gapSmall`  | `8px`  | Between related items |
| **Gap/Medium**   | `spacing.gapMedium` | `12px` | Standard list gaps    |
| **Gap/Large**    | `spacing.gapLarge`  | `16px` | Between sections      |
| **Gap/Form**     | `spacing.gapForm`   | `24px` | Between form fields   |

## Shadow & Effect Mappings

### Shadow Styles

| Figma Shadow Name      | Config Path          | Value                            | Usage          |
| ---------------------- | -------------------- | -------------------------------- | -------------- |
| **Shadow/Card**        | `shadows.card`       | `0 2px 8px rgba(0,0,0,0.1)`      | Card elevation |
| **Shadow/Modal**       | `shadows.modal`      | `0 8px 24px rgba(0,0,0,0.2)`     | Modal/dropdown |
| **Shadow/Button**      | `shadows.button`     | `0 2px 4px rgba(0,0,0,0.1)`      | Button depth   |
| **Shadow/Input/Focus** | `shadows.inputFocus` | `0 0 0 2px rgba(234,189,34,0.2)` | Focus ring     |

### Border Radius Tokens

| Figma Radius Name | Config Path           | Value    | Usage             |
| ----------------- | --------------------- | -------- | ----------------- |
| **Radius/Small**  | `borderRadius.small`  | `4px`    | Chips, tags       |
| **Radius/Medium** | `borderRadius.medium` | `8px`    | Buttons, inputs   |
| **Radius/Large**  | `borderRadius.large`  | `12px`   | Cards, modals     |
| **Radius/XL**     | `borderRadius.xl`     | `16px`   | Large cards       |
| **Radius/Round**  | `borderRadius.round`  | `9999px` | Pills, avatars    |
| **Radius/Modal**  | `borderRadius.modal`  | `24px`   | Modal top corners |

## Container & Card Mappings

### Container Styles

| Figma Container Name  | Background        | Border        | Padding         | Radius   |
| --------------------- | ----------------- | ------------- | --------------- | -------- |
| **Container/Card**    | `background`      | `borderLight` | `cardPadding`   | `large`  |
| **Container/Modal**   | `background`      | None          | `screenPadding` | `modal`  |
| **Container/Section** | `rgba(0,0,0,0.3)` | `borderLight` | `medium`        | `medium` |
| **Container/Input**   | `background`      | `borderLight` | `inputPadding`  | `medium` |

## Component Instance Mapping

### How to Check Component Instances

```typescript
// Figma components often have instance names
// Example: "Button Instance: Primary, Size: Large, State: Default"

// Extract the instance properties
mcp__figma-dev-mode-mcp-server__get_variable_defs(nodeId: "559:2775")
// May return: {
//   "variant": "Primary",
//   "size": "Large",
//   "state": "Default"
// }

// Map to our config
const buttonConfig = {
  variant: buttonStyles.primary,
  size: 'large',
  disabled: false
};
```

## How to Add New Style Mappings

### When Figma Has a Style Not in Config

1. **Identify the missing style** using `get_variable_defs`
2. **Check if similar exists** in config files
3. **If new style needed:**

```typescript
// 1. Add to /config/typography.ts
export enum ShTextVariant {
  // ... existing variants
  NewVariant = 'newVariant', // Add new
}

export const textVariants = {
  // ... existing variants
  newVariant: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    color: colorPalette.textPrimary,
  },
};

// 2. Update this document
// 3. Use in implementation
<ShText variant={ShTextVariant.NewVariant}>Text</ShText>
```

## Comprehensive Extraction Checklist

### MANDATORY: Check EVERY Element Type

Before implementing ANY Figma design, extract semantic names for:

#### Text Elements

- [ ] Used `get_variable_defs` on EVERY text element
- [ ] Documented text style names (e.g., "Subheading Text", "Body Text")
- [ ] Mapped to ShTextVariant enum
- [ ] Verified font family, size, weight match style definition

#### Colors

- [ ] Extracted color style names (e.g., "Primary Gold", "Base Dark")
- [ ] Checked text colors, backgrounds, borders
- [ ] Mapped to colorPalette config
- [ ] No hex values in code

#### Buttons

- [ ] Extracted button variant names (e.g., "Button/Primary")
- [ ] Checked size variants (e.g., "Size/Large")
- [ ] Checked state variants (e.g., "State/Pressed")
- [ ] Mapped to buttonStyles config
- [ ] Used ShButton component with proper variant

#### Icons

- [ ] Extracted icon semantic names (e.g., "Icon/Navigation/Back")
- [ ] Checked icon size tokens (e.g., "Icon/Size/Medium")
- [ ] Mapped to IconName enum
- [ ] No string literals for icon names

#### Input Fields

- [ ] Extracted input variant names (e.g., "Input/Default")
- [ ] Checked state styles (e.g., "Input/Focused", "Input/Error")
- [ ] Mapped to appropriate ShFormField component
- [ ] Border and background colors from config

#### Spacing & Layout

- [ ] Extracted spacing tokens (e.g., "Spacing/Medium")
- [ ] Extracted padding tokens (e.g., "Padding/Screen")
- [ ] Extracted gap tokens for flex layouts
- [ ] No pixel values in code

#### Containers & Cards

- [ ] Extracted container styles (e.g., "Container/Card")
- [ ] Checked border radius tokens (e.g., "Radius/Large")
- [ ] Checked shadow styles (e.g., "Shadow/Card")
- [ ] All properties from config

#### Component Instances

- [ ] Checked for component instance properties
- [ ] Extracted variant combinations
- [ ] Mapped all properties to config

### Validation Steps

1. **Initial Scan**

   ```typescript
   // For the entire screen
   get_variable_defs(nodeId: "559:2744") // Main screen
   ```

2. **Deep Dive**

   ```typescript
   // For EACH significant element
   get_variable_defs(nodeId: "559:2775") // Header
   get_variable_defs(nodeId: "559:2748") // Form field
   get_variable_defs(nodeId: "559:2772") // Toggle
   // ... continue for all elements
   ```

3. **Document Findings**
   - List ALL semantic names found
   - Note any missing mappings
   - Update configs before coding

4. **Implementation Check**
   - [ ] All text uses ShTextVariant enum
   - [ ] All colors from colorPalette
   - [ ] All spacing from spacing config
   - [ ] All buttons use ShButton
   - [ ] All icons use IconName enum
   - [ ] Zero magic values

## Common Mistakes to Avoid

### ❌ DON'T: Skip Style Extraction

```typescript
// Wrong: Assuming styles from visual inspection
<ShText style={{ fontSize: 16 }}>Text</ShText>
```

### ❌ DON'T: Use Raw Values

```typescript
// Wrong: Using Figma's raw values directly
<ShText style={{
  fontFamily: 'Inter',
  fontSize: 20,
  fontWeight: '500'
}}>Title</ShText>
```

### ❌ DON'T: Create Inline Styles

```typescript
// Wrong: Inline styles instead of variants
<View style={{
  backgroundColor: '#161615',
  padding: 16
}}>
```

### ✅ DO: Use Proper Mappings

```typescript
// Correct: Using config mappings
import { ShTextVariant } from '@cfg/typography';
import { colorPalette } from '@cfg/colors';
import { spacing } from '@cfg/spacing';

<View style={{
  backgroundColor: colorPalette.background,
  padding: spacing.medium
}}>
  <ShText variant={ShTextVariant.SubHeading}>Title</ShText>
</View>
```

## Quick Reference Card

```typescript
// Text Styles
ShTextVariant.Heading; // Main titles
ShTextVariant.SubHeading; // Section headers
ShTextVariant.Body; // Paragraphs
ShTextVariant.Label; // Form labels
ShTextVariant.Small; // Help text
ShTextVariant.Light; // Placeholders

// Colors
colorPalette.primary; // Gold #eabd22
colorPalette.background; // Dark #161615
colorPalette.textPrimary; // Light #eceae8
colorPalette.textSecondary; // Grey #9e9b97
colorPalette.borderLight; // Border rgba(158,155,151,0.2)

// Spacing
spacing.small; // 8px
spacing.medium; // 16px
spacing.large; // 24px
```

## Notes for BMad Personas

### For The Architect

- Always include a "Figma Style Mapping" section in tech specs
- Extract and document ALL style names before implementation
- Ensure mappings exist before developer starts

### For The Developer

- Never implement without style mappings documented
- Always use enum values from this guide
- If style missing, STOP and update config first

### For The Designer

- Use this guide to verify Figma-to-code accuracy
- Ensure all new designs use existing style names
- Document any new styles needed

---

**Remember**: Figma style names are the bridge between design and code. Never skip the extraction step!
