# Form Development Checklist - SportHawk MVP

**Version:** 1.0  
**Date:** 2025-09-03  
**Status:** Active - Required Checklist for All Forms

## Overview

This checklist MUST be completed for every form implementation. Copy this checklist into your PR description and check off each item.

## Pre-Development Checklist

### 1. Planning & Reference

- [ ] **Identified reference implementation** (e.g., `/app/events/create-event.tsx`)
- [ ] **Documented reference** in PR description
- [ ] **Read design specification** in `/docs/design-*.md`
- [ ] **Checked Figma design** for visual requirements
- [ ] **Identified all required fields** from specification

### 2. Component Interface Verification

- [ ] **Checked component-interfaces.md** for all components to be used
- [ ] **Verified exact prop names** for each form field component
- [ ] **Confirmed field types** (Date vs DateTime, Text vs TextArea)
- [ ] **Noted validation requirements** for each field

## Implementation Checklist

### 3. Form Structure

- [ ] **Created form with reference pattern** structure
- [ ] **Added SafeAreaView wrapper** with flex: 1
- [ ] **Included Stack.Screen** with proper navigation options
- [ ] **Set headerShown: true** for navigation
- [ ] **Used semantic colors** (baseDark not black, lightText not white)

### 4. State Management

- [ ] **Initialized loading state to true** for data-fetching forms
- [ ] **Created touchedFields state** for validation UX
- [ ] **Added isNavigatingToSelection ref** for sub-screen navigation
- [ ] **Implemented clearForm function**
- [ ] **Added form data initialization** in useEffect

### 5. Form Lifecycle

- [ ] **Clear form on mount** in useEffect
- [ ] **Clear form on unmount** in cleanup function
- [ ] **Preserve state when navigating to sub-screens** (member selection, etc.)
- [ ] **Reset navigation ref** in cleanup

### 6. Field Implementation

For each form field:

- [ ] **Used correct component** from ShFormField family
- [ ] **Verified prop names** match component interface
- [ ] **Added required prop** where needed (NOT isRequired)
- [ ] **Implemented touch tracking** on field interaction
- [ ] **Added placeholder text** where appropriate

### 7. Validation UX

- [ ] **No errors shown on initial load**
- [ ] **Errors only show after field touched**
- [ ] **Error messages are user-friendly**
- [ ] **All fields marked touched on submit attempt**
- [ ] **Validation prevents submission** of invalid data

### 8. Special Fields

- [ ] **DateTime fields use onChange** (not onDateChange)
- [ ] **Choice fields use value/onChangeValue** (not selectedValue/onValueChange)
- [ ] **Amount fields track touched state** before showing errors
- [ ] **Password fields use onChangePassword** (not onChangeText)

### 9. Sub-Screen Navigation

For fields that navigate to sub-screens:

- [ ] **Used ShNavItem** (not ShFormFieldSelect)
- [ ] **Set isNavigatingToSelection.current = true** before navigation
- [ ] **Sub-screen has headerShown: true**
- [ ] **Sub-screen has proper back navigation**
- [ ] **Sub-screen has Done button/action**

### 10. Color & Styling

- [ ] **All colors from colorPalette** config
- [ ] **Input text uses textLight** (not textPrimary)
- [ ] **Backgrounds use baseDark** where appropriate
- [ ] **Borders use borderInputField** (not border)
- [ ] **No magic values** - all from config files

### 11. Loading & Submit States

- [ ] **Loading spinner shown** during initial data fetch
- [ ] **Submit button disabled** during submission
- [ ] **Loading indicator in header** during submit
- [ ] **Error handling** for failed submissions
- [ ] **Success feedback** or navigation on completion

### 12. Error Handling

- [ ] **Try-catch blocks** around async operations
- [ ] **User-friendly error messages** in alerts
- [ ] **Console.error with screen name** prefix
- [ ] **Network error handling**
- [ ] **Validation error display**

## Testing Checklist

### 13. Functional Testing

- [ ] **Form clears on entry** from menu
- [ ] **Form preserves data** when selecting members
- [ ] **Validation works** for all required fields
- [ ] **Submit processes correctly**
- [ ] **Navigation works** (back, submit, sub-screens)

### 14. UX Testing

- [ ] **No errors on initial load**
- [ ] **Errors appear after interaction**
- [ ] **All text is readable** (correct colors)
- [ ] **Loading states display properly**
- [ ] **Keyboard avoidance works** on iOS

### 15. Component Testing

- [ ] **All props correct** - no runtime errors
- [ ] **Field types appropriate** (DateTime when time needed)
- [ ] **Labels include "Members" above search** in sub-screens
- [ ] **Footer shows selection count** and Done button
- [ ] **All navigation headers visible**

## Code Quality Checklist

### 16. Standards Compliance

- [ ] **Follows coding-standards.md**
- [ ] **Matches ui-patterns.md**
- [ ] **No StyleSheet in screen file**
- [ ] **No TODO comments** without permission
- [ ] **No commented code** unless necessary

### 17. Final Verification

- [ ] **Lint passes** (`npm run lint`)
- [ ] **TypeScript compiles** (`npx tsc --noEmit`)
- [ ] **Compared with reference implementation**
- [ ] **Tested on iOS simulator/device**
- [ ] **No console errors** in development

## Common Mistakes to Avoid

1. ❌ **Wrong prop names** - Always verify in component-interfaces.md
2. ❌ **Missing navigation** - All sub-screens need headerShown: true
3. ❌ **Premature validation** - Never show errors before interaction
4. ❌ **Form persistence** - Always clear forms appropriately
5. ❌ **Wrong colors** - Use semantic names from colorPalette
6. ❌ **Missing loading states** - Start with loading: true
7. ❌ **Wrong field types** - DateTime vs Date matters
8. ❌ **No touch tracking** - Implement touchedFields state

## Completion Sign-off

```markdown
## Form Development Checklist Completed ✅

- Reference Implementation: `/app/events/create-event.tsx`
- All items checked and verified
- Tested on: [iOS/Android]
- No known issues

Signed: [Developer Name]
Date: [YYYY-MM-DD]
```

## Usage Instructions

1. **Copy this entire checklist** into your PR description
2. **Check off each item** as you complete it
3. **Add notes** for any deviations or special cases
4. **Get review** if unable to complete any items
5. **Sign off** when complete

Remember: This checklist prevents the mistakes documented in `/docs/mistakes/` from recurring.
