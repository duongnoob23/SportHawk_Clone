# Figma Translation Layer Process - MANDATORY READING

## Critical Process Rule

**The Figma Translation documents are your PRIMARY implementation source, NOT reference material.**

## What Are Figma Translation Documents?

For each user story, we create a corresponding Figma Translation document:

- **Location**: `/docs/stories/[STORY_ID]-figma-translation-*.md`
- **Purpose**: Contains COMPLETE, TESTED component implementations ready to copy

## What They Contain

Each Figma Translation document provides:

- ✅ **Complete component implementations** - Full code, not snippets
- ✅ **All correct imports** - Every import statement you need
- ✅ **Zero magic values** - All values from config files
- ✅ **Proper TypeScript types** - Correctly typed components
- ✅ **Tested code** - Already validated to work with our system

## The Correct Implementation Process

### Step 1: START with the Translation Document

```bash
# FIRST action when implementing a story:
open /docs/stories/PAY-XXX-figma-translation-*.md
```

### Step 2: COPY the Code

- The translation document contains complete, working implementations
- Copy entire component blocks, not just parts
- The code is designed to be copy-paste ready

### Step 3: INTEGRATE into Target Location

- Paste the code into your target file
- The imports, types, and implementations are already correct
- Make minimal adjustments only for specific integration needs

### Step 4: DO NOT Write from Scratch

- ❌ **NEVER** look at Figma and write your own implementation
- ❌ **NEVER** "improve" the translation code without discussion
- ❌ **NEVER** skip the translation document

## Why This Process Exists

### The Problem We Solved

- Developers were writing components from scratch based on Figma designs
- This led to:
  - Magic values (hardcoded colors, sizes, strings)
  - Wrong component choices
  - Incorrect prop names
  - Inconsistent implementations
  - Hours of rework

### The Solution

- Product Owner creates Figma Translation documents
- These documents translate Figma designs into SportHawk component code
- Every design element is mapped to the correct component with correct props
- All values come from our design system config files

## Real Example: PAY-002 Lessons Learned

### What Went Wrong

1. Developer opened the story document
2. Looked at Figma designs
3. Wrote components from scratch
4. Result: 15+ magic values, wrong components, extensive rework needed

### What Should Have Happened

1. Developer opens `/docs/stories/PAY-002-figma-translation-enhanced.md`
2. Copies the complete `ShPaymentSummaryCard` implementation
3. Copies the complete `ShPaymentCard` implementation
4. Integrates into `/app/(app)/teams.tsx`
5. Done - zero rework needed

## The Translation Document Structure

Each Figma Translation document contains:

```typescript
// 1. All required imports (copy these exactly)
import { View } from 'react-native';
import { ShText, ShTextVariant } from '@/components/base/ShText';
import { colorPalette } from '@/config/colors';
// ... etc

// 2. Complete component implementation
export const ComponentName = () => {
  // Full implementation with:
  // - All state management
  // - All event handlers
  // - Complete render logic
  return (
    // Complete JSX with proper styling
  );
};

// 3. Any required types or interfaces
interface ComponentProps {
  // Fully defined props
}
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Treating Translation as Reference

**Wrong**: "I'll look at the translation doc for ideas"
**Right**: "I'll copy the code from the translation doc"

### ❌ Mistake 2: Writing "Better" Code

**Wrong**: "I can write this more efficiently"
**Right**: "The translation code is tested and approved - I'll use it as-is"

### ❌ Mistake 3: Skipping to Figma

**Wrong**: "Let me check what Figma shows"
**Right**: "The translation doc already converted Figma to code"

## Verification Checklist

Before marking your story complete:

- [ ] Did you START with the Figma Translation document?
- [ ] Did you COPY the complete implementations?
- [ ] Are there ZERO magic values in your code?
- [ ] Do all values come from config files?
- [ ] Did you resist the urge to "improve" the translation code?

## Questions?

If a Figma Translation document seems incorrect or incomplete:

1. **DO NOT** work around it
2. **DO NOT** write your own version
3. **DO** immediately notify the Product Owner
4. **DO** wait for the translation to be updated

## Summary

**The Figma Translation Layer is not optional - it's your primary source.**

Every hour spent writing from scratch is an hour wasted when the complete, tested code already exists in the translation document.

---

_Last Updated: After PAY-002 rework lessons_
_Process Owner: Product Owner Team_
