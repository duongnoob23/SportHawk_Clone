# Handover Prompt: SportHawk Payments Implementation Progress

## Context

I'm working on the SportHawk MVP brownfield project (React Native/Expo app, ~10% complete). We're implementing a comprehensive payments system using Stripe. The project uses a enhanced "Figma-to-Code Translation Layer" process that provides developers with exact component mappings to prevent implementation errors.

## Current Status (2025-09-04)

### Completed Work:

1. **Story 1 (PAY-001)**: Create Payment Request - ✅ IMPLEMENTED & TESTED
   - Successfully integrated into existing app
   - Revealed component prop issues that led to process improvements

2. **Story 2 (PAY-002)**: View Payment List with Filter - ✅ READY
   - Full documentation with Figma-to-Code translation
   - Two NEW components created:
     - `ShPaymentSummaryCard` - Yellow action banner
     - `ShPaymentCard` - Individual payment card
   - Integration point: `/app/(app)/teams.tsx` lines 607-630

3. **Story 3 (PAY-003)**: Payment Detail View - ✅ READY
   - Complete implementation code provided
   - Display-only screen (payment buttons DISABLED)
   - New screen at `/app/payments/[id]/index.tsx`

### Key Achievements:

- Created enhanced story template with explicit Figma-to-component mappings
- Developed Figma-to-Code Translation Layer process
- Stripe test accounts configured
- PO validation shows 92% readiness (excellent)

## Key Documents to Review:

### Story Documents:

- `/docs/stories/PAY-002-view-payment-list.md` - Story 2 main doc
- `/docs/stories/PAY-002-figma-translation-enhanced.md` - Complete component code
- `/docs/stories/PAY-003-payment-detail-view.md` - Story 3 main doc
- `/docs/stories/PAY-003-figma-translation-layer.md` - Complete implementation

### Reports:

- `/docs/reports/PAY-Stories-1-3-po-validation-report.md` - Latest validation (92% ready)

### Process Documents:

- `/docs/stories/story-template-with-figma-mapping.md` - Enhanced template
- `/docs/dev-guidelines/po-story-creation-checklist.md` - PO checklist
- `/docs/mistakes/create-payment-mistakes3.md` - Lessons learned

### Epic:

- `/docs/prd/epic-payments-stripe-integration.md` - Full epic with 8 stories

## BMad Commands Available:

- `/BMad:agents:po` - Product Owner agent (Sarah)
- `/BMad:agents:bmad-master` - Master task executor
- `*create-story` - Generate new stories
- `*validate-story-draft` - Verify story completeness
- `*execute-checklist-po` - Run PO validation

## What Needs to Be Done Next:

### Immediate (Stories 2 & 3 Implementation):

1. **Implement Story 2** - Payment List in teams.tsx
   - Create ShPaymentSummaryCard component
   - Create ShPaymentCard component
   - Integrate into teams.tsx payments tab

2. **Implement Story 3** - Payment Detail View
   - Create new screen at `/app/payments/[id]/index.tsx`
   - Use provided implementation code
   - Ensure payment buttons are DISABLED

### After Stories 2 & 3:

3. **Story 4**: Stripe Backend Integration
   - Supabase Edge Functions
   - Webhook handlers
   - Payment intent creation

4. **Story 5**: Pay Payment Request
   - Enable payment buttons
   - Stripe Elements integration
   - Actual payment processing

### Before Story 4 Begins:

- Document rollback procedures
- Define webhook error handling strategy
- Create API response TypeScript interfaces

## Technical Context:

### Project Structure:

- Frontend: React Native with Expo
- Backend: Supabase (PostgreSQL + Edge Functions)
- Payments: Stripe Connect with destination charges
- Database: All payment tables already exist (no migrations needed)

### Component Pattern:

- All UI components prefixed with `Sh` (e.g., ShText, ShIcon)
- Use colorPalette constants (no hex values)
- Use spacing constants (no magic numbers)
- Always use ShText with variant prop (never raw Text)

### Integration Points:

- Teams screen: `/app/(app)/teams.tsx`
- Navigation: Expo Router with file-based routing
- API layer: `/lib/api/payments.ts`
- Components: `/components/Sh*/`

## Critical Rules:

1. **Figma-to-Code Mapping**: Every UI element must map to specific SportHawk components
2. **No Guessing**: Use exact component names and props from documentation
3. **Reference Implementations**: Always copy patterns from similar screens
4. **Disabled States**: Story 3 payment buttons must be disabled (display only)
5. **Component Creation**: New components go in `/components/` with TypeScript interfaces

## Success Metrics:

- Story 1: ✅ Complete and tested
- Story 2: Ready for implementation with full documentation
- Story 3: Ready for implementation with complete code
- Documentation: 92% validation score (excellent)
- Risk Level: Low and well-managed

## Ask Assistant To:

1. Review the current status and documents
2. Help implement Story 2 and/or Story 3
3. Create Story 4 (Stripe Backend) documentation if needed
4. Run PO validation checklist after implementation
5. Address any specific technical questions

The project is in excellent shape with exceptional documentation quality. The Figma-to-Code Translation Layer has eliminated developer guesswork. Stories 2 and 3 are fully ready for implementation.
