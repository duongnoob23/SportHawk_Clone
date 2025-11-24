# Figma Node Information Extraction Process

**Version:** 1.0  
**Date:** 2025-09-03  
**Purpose:** Guide for Product Owners to extract and document Figma design information for developer stories

## Overview

This document explains how to extract Figma node IDs, component styles, and design specifications to create the Figma-to-Component mapping tables required in user stories.

## Prerequisites

- Access to Figma design files
- MCP Figma tools configured (if using Claude)
- Understanding of SportHawk component library
- Access to `/docs/architecture/component-interfaces.md`

## Method 1: Using MCP Figma Tools (Recommended)

### Step 1: Extract Node IDs

```typescript
// Use the MCP Figma tool to get node information
mcp__figma-dev-mode-mcp-server__get_metadata(
  nodeId: "559-3204",  // Can also use URL format
  clientLanguages: "typescript,react native",
  clientFrameworks: "react native,expo"
)
```

This returns the structure and all child node IDs.

### Step 2: Get Visual Reference

```typescript
// Get the visual design
mcp__figma-dev-mode-mcp-server__get_image(
  nodeId: "559-3204"
)
```

This shows what the screen should look like.

### Step 3: Extract Style Variables

```typescript
// Get semantic style names from Figma
mcp__figma-dev-mode-mcp-server__get_variable_defs(
  nodeId: "559-3204"
)
```

This returns style definitions like:

- "Subheading Text" → Font styles
- "Primary Gold" → Color values
- "Body Text" → Typography settings

### Step 4: Get Component Code Hints

```typescript
// Get any code generation hints
mcp__figma-dev-mode-mcp-server__get_code(
  nodeId: "559-3204"
)
```

This may provide React Native code suggestions (use carefully as reference only).

## Method 2: Manual Figma Inspection

### Step 1: Locate Node IDs in Figma

1. Open Figma design file
2. Select the frame/component
3. Look in the URL or properties panel
4. Node ID format: `123-456` or `123:456`

Example URL:

```
https://figma.com/design/ABC123/SportHawk?node-id=559-3204
                                            └─────────┘
                                            This is your node ID
```

### Step 2: Document Each UI Element

For each element in the design:

1. **Element Name**: What Figma calls it
2. **Element Type**: Text field, button, dropdown, etc.
3. **Visual Properties**:
   - Font style (if text)
   - Color
   - Size/dimensions
   - Required indicator (\*)
   - Placeholder text

### Step 3: Map to SportHawk Components

Use this decision tree:

```
Text Input?
├─ Email? → ShFormFieldEmail
├─ Password? → ShFormFieldPassword
├─ Multi-line? → ShFormFieldTextArea
└─ Single line? → ShFormFieldText

Date/Time?
├─ Date only? → ShFormFieldDate
└─ Date + Time? → ShFormFieldDateTime

Selection?
├─ Navigate to new screen? → ShNavItem
├─ Single choice inline? → ShFormFieldChoice
└─ Multiple choices? → ShFormFieldChoice with multiple: true

Amount/Currency?
└─ → ShPaymentAmountInput

Read-only display?
└─ → ShFormFieldReadOnly
```

## Creating the Mapping Table

### Template

```markdown
| Figma Element     | SportHawk Component | Props to Use         | Common Mistakes |
| ----------------- | ------------------- | -------------------- | --------------- |
| [Name from Figma] | `[Component]`       | `[prop1]`, `[prop2]` | ❌ [Mistake]    |
```

### Example Extraction Process

#### From Figma:

- Element: "Due by \*" field
- Shows: Date picker and time picker
- Label: "Due by"
- Required: Yes (has asterisk)
- Placeholder: "Select date and time"

#### Analysis:

- Has date AND time = ShFormFieldDateTime (not ShFormFieldDate)
- Has asterisk = use `required` prop
- Is a date/time field = uses `onChange` (not `onDateChange`)

#### Mapping Table Entry:

```markdown
| "Due by \*" field | `ShFormFieldDateTime` | `label="Due by"`, `required`, `onChange`, `value` | ❌ Using ShFormFieldDate<br>❌ Using onDateChange |
```

## Common Figma Patterns to SportHawk Components

| Figma Pattern        | SportHawk Component                 | Key Indicators           |
| -------------------- | ----------------------------------- | ------------------------ |
| Text field with \*   | `ShFormFieldText` with `required`   | Single line input        |
| Date picker          | `ShFormFieldDate`                   | Date only, no time       |
| Date + Time pickers  | `ShFormFieldDateTime`               | Both date and time shown |
| Dropdown/Select      | `ShFormFieldChoice`                 | Inline selection         |
| "Select Members (0)" | `ShNavItem`                         | Navigation to sub-screen |
| Multi-line text box  | `ShFormFieldTextArea`               | Multiple lines visible   |
| £ Amount field       | `ShPaymentAmountInput`              | Currency symbol          |
| Grayed out field     | `ShFormFieldReadOnly`               | Non-editable             |
| Toggle/Switch        | `ShSwitch`                          | On/off selection         |
| Checkbox list        | `ShFormFieldChoice` with `multiple` | Multiple selections      |

## Documenting Special Requirements

### Navigation Indicators in Figma

- Chevron right (>) = Navigation to sub-screen = Use `ShNavItem`
- Dropdown arrow (▼) = Inline selection = Use `ShFormFieldChoice`
- Plus icon (+) = Add action = Custom button/navigation

### Required Field Indicators

- Red asterisk (\*) = Add `required` prop
- "Required" text = Add `required` prop
- "Optional" text = Don't add `required` prop

### Time Display Indicators

- Shows hours:minutes = Use `ShFormFieldDateTime`
- Shows only date = Use `ShFormFieldDate`
- Shows "Due by 5:30 PM" = DateTime needed

## Validation Requirements from Figma

Look for these in the design:

1. **Error states** - Red borders, error messages
2. **Helper text** - Gray text under fields
3. **Character limits** - "0/200" indicators
4. **Format hints** - "user@example.com" placeholders

Document as:

```markdown
- Email field: Must be valid email format
- Title: Required, max 100 characters
- Amount: Minimum £1.00
- Due date: Cannot be in the past
```

## Output Format for Stories

### Section 1: Figma References

```markdown
| Screen         | Figma Node ID | Design Doc               | Reference Implementation     |
| -------------- | ------------- | ------------------------ | ---------------------------- |
| Create Payment | 559-3204      | /docs/design-payments.md | /app/events/create-event.tsx |
```

### Section 2: Component Mapping

```markdown
| Figma Element  | SportHawk Component | Props to Use | Common Mistakes |
| -------------- | ------------------- | ------------ | --------------- |
| [All elements] | [Components]        | [Props]      | [Mistakes]      |
```

### Section 3: Special Requirements

```markdown
- Navigation: Members field opens sub-screen
- Validation: Amount minimum £1.00
- State: Preserve form when navigating to sub-screen
```

## Quality Checklist

Before finalizing extraction:

- [ ] Every visible UI element is mapped
- [ ] All interactive elements have onPress/onChange handlers specified
- [ ] Required fields are marked
- [ ] Navigation destinations are identified
- [ ] Color specifications use semantic names
- [ ] Date/DateTime distinction is clear
- [ ] Sub-screens are included

## Common Extraction Mistakes to Avoid

1. **Missing time requirement** - "Due by" might need time even if Figma only shows date
2. **Assuming component choice** - Always check if navigation is needed (ShNavItem vs ShFormFieldSelect)
3. **Wrong prop names** - Verify in component-interfaces.md
4. **Missing sub-screens** - Check all navigation targets
5. **Ignoring helper text** - Often contains validation requirements

## Tools & Resources

- **MCP Figma Tools**: For automated extraction
- **Component Interfaces**: `/docs/architecture/component-interfaces.md`
- **UI Patterns**: `/docs/architecture/ui-patterns.md`
- **Example Story**: `/docs/stories/example-payment-request-story-enhanced.md`

## Support

If uncertain about component mapping:

1. Check reference implementations
2. Review component-interfaces.md
3. Look for similar patterns in existing code
4. Ask: "Does this navigate or select inline?"
5. When in doubt, document both options for developer review

Remember: **Explicit is better than implicit**. Over-document rather than under-document.
