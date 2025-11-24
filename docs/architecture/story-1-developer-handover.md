# Developer Handover: Story 1 - Create Payment Request

**Architect:** Winston (BMad Architect)  
**Target Role:** BMad Developer  
**Story:** Payment Request Creation (Treasurer)  
**Date:** 2025-09-03  
**Status:** Ready for Implementation  
**Version:** 1.1 - Updated with new patterns  
**Reference Implementation:** `/app/events/create-event.tsx`

## Executive Summary

You'll be implementing the payment request creation feature for team treasurers. This is the first story in the payment system epic. All database tables already exist - NO migrations needed.

**CRITICAL: Copy patterns from `/app/events/create-event.tsx` - this is your reference implementation.**

## Figma Design References

### Key Screens

1. **Admin Create Modal** (559:2927) - Entry point showing "Payment Request" option
2. **Create Payment Form** (559:2744) - Main payment request creation screen

### Visual Requirements from Figma

- Dark theme with `colorPalette.baseDark` (NOT black)
- Gold primary color `colorPalette.primaryGold` for CTAs and required field asterisks
- Form follows existing SportHawk input patterns
- Stripe ID shows in `colorPalette.stoneGrey` (read-only field)
- "Send" button in top-right navigation using TouchableOpacity pattern

## Critical Pattern Updates

### Component Usage Rules

- **DO NOT** use `ShHeaderButton` - it's deprecated
- **DO NOT** use `ShFormFieldSelect` for member selection
- **DO NOT** use `isRequired` prop - use `required` instead
- **DO** use TouchableOpacity for header buttons
- **DO** use ShNavItem for member selection
- **DO** use semantic colors (baseDark, lightText, stoneGrey)

## Implementation Checklist

### 1. Store Setup ✅ (Already Started)

**File:** `/stores/paymentFormStore.ts`

- [x] Zustand store with AsyncStorage persistence
- [x] Form validation logic
- [x] Type definitions for PaymentFormData
- [ ] Add getValidationErrors method
- [ ] Test persistence across app restarts

### 2. API Layer

**File:** `/lib/api/payments.ts`

```typescript
// Core functions needed:
- getTeamStripeAccount(teamId: string)
- createPaymentRequest(data: CreatePaymentRequestData)
- sendPaymentNotifications(paymentRequestId: string, memberIds: string[])
```

### 3. Custom Component

**File:** `/components/ShPaymentAmountInput/index.tsx`

- Currency input that stores pence as integer
- Shows formatted pounds (£150.00)
- Numeric keyboard
- Min: £1.00 (100 pence), Max: £1,000,000 (100000000 pence)
- Must accept `required` prop for asterisk display

### 4. Main Screen - UPDATED

**File:** `/app/payments/create-payment.tsx`
**Copy From:** `/app/events/create-event.tsx`

#### Navigation Header Pattern:

```typescript
// USE THIS EXACT PATTERN:
<Stack.Screen
  options={{
    headerShown: true,
    title: 'Create Request',
    headerStyle: {
      backgroundColor: colorPalette.baseDark, // NOT black
    },
    headerTintColor: colorPalette.lightText, // NOT white
    headerLeft: () => (
      <TouchableOpacity onPress={() => router.back()}>
        <ShIcon name={IconName.BackArrow} />
      </TouchableOpacity>
    ),
    headerRight: () => (
      <TouchableOpacity onPress={handleSubmit}>
        {submitting ? (
          <ActivityIndicator color={colorPalette.primaryGold} />
        ) : (
          <ShText variant={ShTextVariant.Body}>Send</ShText>
        )}
      </TouchableOpacity>
    ),
  }}
/>
```

#### Form Components:

```
- SafeAreaView wrapper (required for iOS)
- Title* (ShFormFieldText with required prop)
- Description (ShFormFieldTextArea)
- Due by* (ShFormFieldDate with required prop)
- Type* (ShFormFieldChoice with required prop)
- Members* (ShNavItem - NOT ShFormFieldSelect)
- Stripe ID (ShFormFieldReadOnly - stoneGrey color)
- Amount* (ShPaymentAmountInput with required prop)
```

### 5. Member Selection - CRITICAL

**File:** `/app/payments/edit-members.tsx`

- Copy EXACT pattern from `/app/events/edit-members.tsx`
- Updates `selectedMembers` in paymentFormStore
- Shows selected count
- Select All / Deselect All functionality

**Member Selector in Form:**

```typescript
// DO NOT use ShFormFieldSelect
<ShNavItem
  label={`Members (${count})`}
  subtitle={count > 0 ? `${count} selected` : 'Select team members'}
  onPress={handleSelectMembers}
  required
  showDropdownIcon
/>
```

### 6. Routes Configuration

**File:** `/config/routes.ts`

```typescript
// Add these routes:
PaymentCreate: '/payments/create-payment' as const,
PaymentEditMembers: '/payments/edit-members' as const,
PaymentSuccess: '/payments/success' as const,
```

## Critical Style Mappings (MANDATORY)

### Text Styles (Use ShTextVariant enum ONLY)

| UI Element        | ShTextVariant       | Figma Reference           |
| ----------------- | ------------------- | ------------------------- |
| Screen Title      | ShTextVariant.Body  | "Create Request"          |
| Field Labels      | ShTextVariant.Label | "Title \*", "Description" |
| Input Values      | ShTextVariant.Body  | User-entered text         |
| Placeholders      | ShTextVariant.Body  | "Enter description"       |
| Help Text         | ShTextVariant.Small | Fee breakdown text        |
| Send Button       | ShTextVariant.Body  | "Send" action             |
| Required Asterisk | ShTextVariant.Label | With primary color        |

### Colors (Use colorPalette ONLY) - UPDATED

| Element           | Color Variable                | Notes                         |
| ----------------- | ----------------------------- | ----------------------------- |
| Required asterisk | colorPalette.primaryGold      | Auto-added by `required` prop |
| Send button text  | colorPalette.primaryGold      | TouchableOpacity pattern      |
| Header background | colorPalette.baseDark         | NOT black                     |
| Header text       | colorPalette.lightText        | NOT white                     |
| Stripe ID text    | colorPalette.stoneGrey        | Read-only field               |
| Input text        | colorPalette.textPrimary      | User input                    |
| Placeholders      | colorPalette.textSecondary    | Hints                         |
| Backgrounds       | colorPalette.background       | Screen background             |
| Input borders     | colorPalette.borderInputField | Form fields                   |

## Database Operations

### Tables to Use (Already Exist)

1. **payment_requests** - Main payment record
2. **payment_request_members** - Individual member payment tracking
3. **stripe_accounts** - Read team's Stripe account (read-only)

### Insert Sequence

```sql
-- 1. Create payment request
INSERT INTO payment_requests (
  team_id, created_by, title, description,
  amount_pence, due_date, payment_type,
  request_status, total_members, paid_members,
  total_collected_pence
)

-- 2. Create member records (batch insert)
INSERT INTO payment_request_members (
  payment_request_id, user_id, payment_status,
  amount_pence, currency
)
```

## Validation Rules

### Client-Side

- Title: Required, 3-100 characters
- Description: Optional, max 500 characters
- Amount: Required, £1.00 - £1,000,000
- Due Date: Required, must be future date
- Members: At least 1 selected
- Type: Required (required/optional)

### Server-Side (via RLS)

- User must be team admin
- Team must have stripe_account record
- Amount must be positive integer

## Transaction Fee Logic

### Toggle States

1. **OFF (Default)**: Team receives exact amount, members pay exact amount
2. **ON**: Add fee to member price, team still receives base amount

### Fee Calculation

```typescript
const STRIPE_FEE_PERCENTAGE = 0.029; // 2.9%
const STRIPE_FEE_FIXED = 30; // 30 pence

function calculateFee(amountPence: number): number {
  return Math.round(amountPence * STRIPE_FEE_PERCENTAGE + STRIPE_FEE_FIXED);
}

// Display example:
// Base: £150.00 (15000 pence)
// Fee: £4.65 (465 pence)
// Total: £154.65 (15465 pence)
```

## Error Handling

### Edge Cases

- No Stripe account: Show info box with setup instructions
- Network failure: Persist form data, show retry option
- Validation errors: Inline error messages below fields
- Duplicate request: Check for similar active requests

### Error Messages

```typescript
const ERROR_MESSAGES = {
  NO_STRIPE_ACCOUNT: 'Your team needs to set up a Stripe account first',
  INVALID_AMOUNT: 'Amount must be between £1 and £1,000,000',
  NO_MEMBERS: 'Select at least one team member',
  PAST_DATE: 'Due date must be in the future',
  NETWORK_ERROR: 'Connection error. Please try again',
};
```

## Developer DO NOT List

**CRITICAL - These will cause rejection:**

- DO NOT use `ShHeaderButton` (deprecated)
- DO NOT use `ShFormFieldSelect` for navigation
- DO NOT use `isRequired` prop (use `required`)
- DO NOT use `colorPalette.black` or `.white`
- DO NOT modify existing components
- DO NOT create new patterns

## Testing Checklist

### Functional Tests

- [ ] Form validates all required fields
- [ ] Required fields show gold asterisk
- [ ] Amount input handles currency formatting
- [ ] Member selection uses ShNavItem
- [ ] Header uses TouchableOpacity pattern
- [ ] Colors use semantic names
- [ ] SafeAreaView wraps content
- [ ] Loading state starts as true
- [ ] Due date picker shows future dates only
- [ ] Form data persists if app closes
- [ ] Success creates correct database records
- [ ] Notifications trigger for selected members

### Platform Tests

- [ ] iOS: Keyboard handling correct
- [ ] iOS: Date picker native behavior
- [ ] Android: Back button handling
- [ ] Android: Keyboard dismiss on scroll

### Edge Cases

- [ ] Submit with no Stripe account
- [ ] Network timeout during submission
- [ ] Maximum members selected (100+)
- [ ] Minimum amount (£1.00)
- [ ] Maximum amount (£1,000,000)

## Code Quality Requirements

### Must Do

- Run `npm run lint` before marking complete
- Run `npm run typecheck` for TypeScript validation
- Test on both iOS and Android devices
- Match Figma design pixel-perfect
- Use ShTextVariant enum for ALL text
- Use colorPalette for ALL colors
- NO magic numbers - use spacing constants
- NO raw strings - use constants/enums

### Must NOT Do

- Create new patterns - follow existing ones
- Use decimal for money - always integers (pence)
- Make Stripe API calls from client
- Add TODO comments without permission
- Use any hex colors directly
- Create payments table records (use payment_request_members)

## Implementation Order

1. **Setup (30 mins)**
   - Create API layer structure
   - Add routes to config
   - Create file structure

2. **Components (1 hour)**
   - Build ShPaymentAmountInput
   - Test currency formatting
   - Validate min/max amounts

3. **Member Selection (1 hour)**
   - Copy and adapt events pattern
   - Wire to payment store
   - Test selection persistence

4. **Main Form (2 hours)**
   - Build form UI matching Figma
   - Wire all inputs to store
   - Implement validation
   - Add transaction fee calculator

5. **API Integration (1 hour)**
   - Connect to Supabase
   - Handle success/error states
   - Test end-to-end flow

6. **Testing (1 hour)**
   - Full QA checklist
   - Platform-specific testing
   - Edge case validation

## Success Criteria

Story 1 is complete when:

1. ✅ Treasurer can access form via Teams → Admin → Payment Request
2. ✅ All form fields match Figma exactly
3. ✅ Validation prevents invalid submissions
4. ✅ Member selection works like events
5. ✅ Creates correct database records
6. ✅ Notifications sent to selected members
7. ✅ Form persists during navigation
8. ✅ Works on iOS and Android
9. ✅ Passes lint and type checks
10. ✅ QA approves implementation

## Next Steps

1. Review this document thoroughly
2. Check existing patterns in codebase
3. Start with implementation order above
4. Test each component in isolation
5. Run full integration test
6. Submit for QA review

## Questions or Blockers?

If you encounter issues:

1. Check existing patterns first
2. Review the technical spec: `/docs/architecture/tech-spec-story-1-payment-request.md`
3. Verify Figma designs: 559-2744, 559-2927
4. Check database schema is as documented
5. Escalate if blocked on external dependencies

---

**Ready to implement!** This story establishes the foundation for the entire payment system. Take care to match patterns exactly as future stories will build on this work.

Good luck, developer! 🏗️
