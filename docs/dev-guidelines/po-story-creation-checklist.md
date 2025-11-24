# Product Owner Story Creation Checklist

**Version:** 1.0  
**Date:** 2025-09-03  
**Purpose:** Ensure all user stories contain explicit Figma-to-code translations to prevent developer errors

## Overview

This checklist MUST be completed by Product Owners when creating user stories. It ensures developers have unambiguous guidance on which existing components to use for each UI element, preventing the costly mistakes that occur when developers guess or assume.

## Pre-Story Creation Checklist

### 1. Gather Source Materials

- [ ] **Figma design** is complete and approved
- [ ] **Figma node IDs** identified for all screens
- [ ] **Design document** exists in `/docs/design-*.md`
- [ ] **Reference implementation** identified (similar existing screen)
- [ ] **Component interfaces** document reviewed (`/docs/architecture/component-interfaces.md`)

### 2. Analyze Existing Codebase

- [ ] **Similar screen identified** to use as template
- [ ] **Pattern screen** for each sub-flow identified
- [ ] **Component availability** verified (all needed components exist)
- [ ] **Gap analysis** completed (new components needed?)

## Story Creation Checklist

### 3. Story Header Section

- [ ] **Story ID** assigned (e.g., PAY-001)
- [ ] **Epic** identified
- [ ] **Reference Implementation** path provided
- [ ] **Story points** estimated based on complexity

### 4. Figma Design References Table

- [ ] **All screens listed** with their Figma node IDs
- [ ] **Design doc path** provided for each screen
- [ ] **Reference implementation** identified for each screen
- [ ] **Sub-screens** included (member selection, etc.)

### 5. Figma-to-Component Mapping ⚠️ CRITICAL

For EACH screen in the story:

#### Component Mapping Table

- [ ] **Every UI element** from Figma is listed
- [ ] **Exact SportHawk component** specified for each element
- [ ] **Props to use** listed explicitly (with exact names)
- [ ] **Common mistakes** documented for each component
- [ ] **Special cases** noted (DateTime vs Date, etc.)

#### Example Verification:

```markdown
✅ GOOD: "Due by field → ShFormFieldDateTime with onChange prop"
❌ BAD: "Due by field → use appropriate date component"
```

### 6. Code Patterns Section

- [ ] **State management code** provided (complete snippet)
- [ ] **Lifecycle management** code included
- [ ] **Validation pattern** with touchedFields example
- [ ] **Navigation pattern** for sub-screens
- [ ] **Exact line numbers** from reference file when applicable

### 7. Navigation Requirements

- [ ] **Stack.Screen configuration** provided
- [ ] **headerShown: true** explicitly stated for sub-screens
- [ ] **Header actions** defined (Save, Done, Select All)
- [ ] **Back navigation** behavior specified
- [ ] **Form preservation** logic documented

### 8. Color & Styling Requirements

- [ ] **Semantic color table** provided
- [ ] **DO/DON'T examples** for common mistakes
- [ ] **Input text color** explicitly stated (`textLight` not `textPrimary`)
- [ ] **Background colors** specified (`baseDark` not `black`)

### 9. Validation Requirements

- [ ] **touchedFields pattern** documented
- [ ] **Initial load behavior** specified (no errors shown)
- [ ] **Error display timing** clarified
- [ ] **Field-specific validation** rules listed
- [ ] **User-friendly error messages** provided

### 10. Sub-Screen Specifications

For each sub-screen (member selection, etc.):

- [ ] **Complete navigation header** configuration
- [ ] **Footer pattern** if applicable
- [ ] **Selection state management**
- [ ] **Data persistence** when returning to parent
- [ ] **Search functionality** requirements

### 11. Common Pitfalls Section

- [ ] **Top 5-10 likely mistakes** listed
- [ ] **Specific to this story's components**
- [ ] **Based on similar past implementations**
- [ ] **Include actual wrong code examples**

### 12. Acceptance Criteria

- [ ] **Functional requirements** checklist format
- [ ] **UI/UX requirements** with Figma compliance
- [ ] **Technical requirements** (lint, TypeScript, etc.)
- [ ] **Test scenarios** defined

### 13. Implementation Checklist for Developer

- [ ] **Pre-development** steps listed
- [ ] **Critical checks** during development
- [ ] **Testing requirements** before submission
- [ ] **Sign-off section** included

## Quality Verification

### 14. Completeness Check

- [ ] **No ambiguity** - developer shouldn't have to guess anything
- [ ] **All Figma elements** mapped to components
- [ ] **All component props** explicitly stated
- [ ] **Reference files** identified with paths
- [ ] **Common mistakes** documented

### 15. Cross-Reference Validation

- [ ] Story validated against **Figma design**
- [ ] Components verified in **component-interfaces.md**
- [ ] Patterns confirmed in **ui-patterns.md**
- [ ] Reference implementation **actually exists**
- [ ] Colors verified in **colorPalette config**

## Red Flags - Story is NOT Ready If:

❌ Any Figma element lacks component mapping  
❌ Component props are not explicitly listed  
❌ Reference implementation is not identified  
❌ Navigation requirements are vague  
❌ Validation pattern is not specified  
❌ Color names are not semantic  
❌ Sub-screen navigation is not detailed  
❌ Common mistakes section is empty

## PO Sign-off Template

```markdown
## Story Creation Checklist Completed ✅

- Figma-to-Component Mapping: Complete
- Reference Implementations: Identified
- Navigation Requirements: Specified
- Validation Patterns: Documented
- Common Pitfalls: Listed

This story provides unambiguous implementation guidance.

Prepared by: [PO Name]
Date: [YYYY-MM-DD]
Story Ready for Development: YES/NO
```

## Quick Reference: Component Mapping Format

```markdown
| Figma Element  | SportHawk Component | Props to Use     | Common Mistakes     |
| -------------- | ------------------- | ---------------- | ------------------- |
| [Element name] | `Component`         | `prop1`, `prop2` | ❌ Wrong prop names |
```

## Remember

The goal is to make it **impossible** for developers to:

- Use the wrong component
- Use incorrect prop names
- Miss navigation requirements
- Show validation errors prematurely
- Get trapped in sub-screens
- Use wrong colors or styles

Every ambiguity in a story = potential developer error = rework time

**When in doubt, be MORE explicit, not less.**
