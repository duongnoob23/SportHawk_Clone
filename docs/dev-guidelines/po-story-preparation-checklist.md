# PO Story Preparation Checklist

## Purpose

This checklist was created following lessons learned from Story 6 (PAY-006) to prevent common preparation mistakes and ensure high-quality story documentation.

## Pre-Documentation Phase

### 1. Codebase Analysis (MANDATORY)

- [ ] Search for 3+ similar implementations before proposing new components
- [ ] Document existing patterns found
- [ ] Review navigation patterns if creating new screens
- [ ] Check existing components before creating new ones

### 2. Configuration Review

- [ ] Review `/config/colors.ts` for all color values
- [ ] Review `/config/payments.ts` for payment-related constants
- [ ] Review `/config/spacing.ts` for layout values
- [ ] Review `/config/typography.ts` for text styles
- [ ] Create list of ALL numeric values that need constants

### 3. Existing Infrastructure Check

- [ ] Check `/lib/api/` for existing API methods
- [ ] Check `/stores/` for existing stores
- [ ] Check `/components/` for reusable components
- [ ] Review `/lib/utils/logger.ts` for logging patterns

## During Documentation Phase

### 4. Constant Usage Rules

- [ ] NO hardcoded numbers (use constants from config)
- [ ] NO hardcoded strings for statuses (use enums/constants)
- [ ] NO hardcoded colors (use colorPalette)
- [ ] NO console.log (use logger utility)
- [ ] NO magic array indices (use named constants)

### 5. Code Examples Must Include

- [ ] All necessary imports at the top
- [ ] Config constant imports where needed
- [ ] Logger import when logging is shown
- [ ] Correct API object names (e.g., paymentsApi not paymentApi)

### 6. Documentation Structure

- [ ] NEVER overwrite user files
- [ ] Create new files with clear naming
- [ ] Add ownership comments in files
- [ ] Keep user notes separate from generated docs

## Post-Documentation Phase

### 7. Automated Validation Checks

Run these commands before claiming completion:

```bash
# Check for magic numbers
grep -E "size={[0-9]+}|borderRadius: [0-9]+|width: [0-9]+|height: [0-9]+" docs/stories/[STORY-ID]*.md

# Check for hardcoded status strings
grep -E "'paid'|'failed'|'cancelled'|'pending'|'completed'" docs/stories/[STORY-ID]*.md

# Check for rgba values not in config
grep -E "rgba\([0-9, .]+\)" docs/stories/[STORY-ID]*.md

# Check for console.log usage
grep "console\.log" docs/stories/[STORY-ID]*.md

# Verify config imports exist
grep -L "import.*from.*config" docs/stories/[STORY-ID]*.md

# Check for hardcoded limits/pagination
grep -E "limit\([0-9]+\)|\.limit\([0-9]+\)|limit: [0-9]+" docs/stories/[STORY-ID]*.md
```

### 8. Manual Verification

- [ ] All database field names verified (e.g., user_id not member_id)
- [ ] API object names consistent throughout
- [ ] Import statements match actual exports
- [ ] Test data creation uses config constants
- [ ] Logger statements include story prefix (e.g., [PAY-006])

### 9. Cross-Reference Check

- [ ] Examples in development guide match main story doc
- [ ] Figma translation layer uses same constants
- [ ] No conflicting information between documents
- [ ] Test data SQL uses proper values

## Common Mistakes to Avoid (From Story 6)

### ❌ DON'T

- Hardcode values like `size={14}` or `borderRadius: 8`
- Use string literals like `'paid'` instead of constants
- Create new navigation patterns when Stack.Screen exists
- Claim completion without running validation checks
- Overwrite user documentation files
- Mix paymentApi and paymentsApi naming
- Use member_id when it should be user_id
- Add console.log instead of using logger

### ✅ DO

- Use `PaymentUIConstants.ICON_SIZE_SMALL`
- Use `PaymentStatus.PAID`
- Follow existing navigation patterns
- Run all validation checks before claiming done
- Create new files for your documentation
- Be consistent with API naming
- Verify database field names
- Use logger utility with story prefix

## Final Checklist Before Marking Complete

- [ ] Ran all automated validation checks
- [ ] Fixed any issues found
- [ ] Re-ran validation to confirm clean
- [ ] Reviewed one more time for consistency
- [ ] Test data creation documented
- [ ] Logger statements included
- [ ] No magic values remain

## Validation Script

Use `/scripts/validate-story-docs.sh [STORY-ID]` to run all checks automatically.

## References

- Story 6 Mistakes: `/docs/mistakes/story6-*.md`
- Config Files: `/config/`
- Logger Utility: `/lib/utils/logger.ts`
- Existing Patterns: `/app/teams/[id]/members.tsx` (list pattern example)
