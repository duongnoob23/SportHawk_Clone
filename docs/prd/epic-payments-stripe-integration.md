# EPIC: Team Payments - Stripe Integration

**Version:** 1.0  
**Date:** 2025-09-03  
**Status:** Ready for Development  
**Design Document:** `/docs/design-payments.md`  
**Technical Spec Story 1:** `/docs/architecture/tech-spec-story-1-payment-request.md`  
**Priority:** HIGH - Next EPIC to implement

## CRITICAL IMPLEMENTATION REQUIREMENTS

### Reference Implementation Pattern (MANDATORY)

**Before implementing ANY payment screen:**

1. **Reference Implementation**: `/app/events/create-event.tsx`
2. **Copy**: Navigation pattern, form structure, validation approach
3. **Modify**: Only payment-specific fields and logic
4. **Document**: Reference in all PRs and commits

### UI Component Requirements

- **Form Fields**: Use `required` prop (NOT `isRequired`) for required fields
- **Navigation**: Use TouchableOpacity pattern (NOT ShHeaderButton)
- **Sub-forms**: Use ShNavItem (NOT ShFormFieldSelect)
- **Colors**: baseDark/lightText (NOT black/white)

### Figma Style Compliance (MANDATORY)

**Every UI element MUST use the exact Figma semantic style names mapped to our codebase:**

- **Text**: Use ONLY ShTextVariant enum values - NO raw font properties
- **Colors**: Use ONLY colorPalette constants - NO hex values
- **Spacing**: Use ONLY spacing constants - NO magic numbers
- **Components**: Use ONLY Sh\* prefixed components

**Failure to follow Figma styles = Story rejection by QA**

See Section 5 for complete Figma style mappings.

## 1. EPIC Overview

### Business Value

Enable sports teams to collect payments from members efficiently through the SportHawk platform, reducing administrative burden on treasurers and simplifying payment for members.

### Scope

Complete end-to-end payment system including:

- Payment request creation and management
- Member payment processing via Stripe
- Payment tracking and history
- Notification system for payment events
- Admin tools for treasurers

### Success Criteria

- Treasurers can create and manage payment requests
- Members can pay via card, Apple Pay, or Google Pay
- All payments tracked with full audit trail
- Zero PCI compliance burden (via Stripe Elements)
- Notifications sent for all payment events

## 2. Technical Architecture

### Stripe Integration Approach

- **Stripe Connect** with Destination Charges via Supabase Edge Functions
- SportHawk acts as platform account
- Teams have connected Stripe accounts
- Transaction fees paid by SportHawk account
- Full amount reaches team accounts
- **SECURITY**: All Stripe API calls through Supabase Edge Functions (never from client)

### Existing Database Schema

**IMPORTANT**: All payment tables are already created in the database. NO database migrations are needed to begin Story 1.

#### Current Tables (Verified as of 2025-09-03):

1. **payment_requests** - Main payment request records
   - Uses `amount_pence` (INTEGER) not decimal
   - Has `payment_type` field for 'required'/'optional'
   - Links to teams and created_by user
   - Status: 'active', 'cancelled', 'completed'

2. **payment_request_members** - Individual member payment tracking
   - Links payment request to each member
   - Tracks payment_status per member
   - Stores stripe_payment_intent_id
   - Uses `amount_pence` (INTEGER)

3. **payment_transactions** - Stripe transaction details
   - Links to payment_request_member_id
   - Stores full Stripe transaction data
   - Tracks platform fees and net amounts
   - Uses `amount_pence`, `platform_fee_pence`, `net_amount_pence` (INTEGER)

4. **stripe_accounts** - Team Stripe Connect accounts
   - One per team (team_id is UNIQUE)
   - Stores stripe_account_id
   - Tracks account status and capabilities

5. **notifications** - Already exists with full structure
   - Supports payment notifications
   - Has delivery tracking
   - Has notification_type, priority, delivery_method fields

6. **payment_reminders** - Payment reminder tracking
   - Links to payment_request_id and user_id
   - Tracks reminder type (automatic/manual)
   - Has delivery status tracking

7. **payments** - Legacy payment records (separate from payment_request_members)
   - May be deprecated in favor of payment_request_members
   - Verify usage before modifying

#### Database Changes Required:

**NONE** - All tables and columns already exist. The payment_type column is present in payment_requests table.

### API Layer Structure

```typescript
// /lib/api/payments.ts
export const paymentApi = {
  // Payment Requests
  createPaymentRequest(data: CreatePaymentRequest): Promise<PaymentRequest>
  getPaymentRequest(id: string): Promise<PaymentRequest>
  updatePaymentRequest(id: string, updates: Partial<PaymentRequest>): Promise<void>
  cancelPaymentRequest(id: string): Promise<void>

  // Payments
  getUserPayments(userId: string): Promise<Payment[]>
  getPaymentDetails(id: string): Promise<PaymentDetails>
  initiatePayment(paymentId: string): Promise<StripePaymentIntent>
  confirmPayment(paymentId: string, paymentMethodId: string): Promise<void>

  // Admin functions
  getTeamPaymentRequests(teamId: string): Promise<PaymentRequest[]>
  sendPaymentReminder(requestId: string, userIds: string[]): Promise<void>
}
```

## 3. User Stories

### Story 1: Create Payment Request (Treasurer)

**As a** Team Treasurer  
**I want to** create a payment request for team members  
**So that** I can collect payments efficiently

**Reference Implementation:** `/app/events/create-event.tsx`

- Copy navigation header pattern (TouchableOpacity with ShIcon/ShText)
- Copy form validation approach
- Copy member selection pattern (ShNavItem for sub-form)
- Modify only payment-specific fields

**Acceptance Criteria:**

- Access via Teams → Admin → Payment Request (Figma 559-2927)
- Form includes: Title, Description, Due Date, Type, Members, Amount
- Shows team's Stripe ID (read-only with stoneGrey color)
- Validation on all required fields (use `required` prop)
- Creates payment_requests and payment_request_members records (NOT payments records)
- Sends notifications to selected members

**Implementation:**

- Screen: `/app/payments/create-payment.tsx`
- Store: `/stores/paymentFormStore.ts` (Zustand with AsyncStorage persistence)
- API: `/lib/api/payments.ts`
- Component: `/components/ShPaymentAmountInput/index.tsx` (custom amount input)
- Uses existing member selection: `/app/events/edit-members.tsx` pattern
- Navigation: Stack with TouchableOpacity pattern (NOT ShHeaderButton)
- Full technical spec: `/docs/architecture/tech-spec-story-1-payment-request.md`

**Figma Style Requirements:**

- Headers: ShTextVariant.SubHeading ("Create Request")
- Field Labels: ShTextVariant.Label
- Input Values: ShTextVariant.Body
- Help Text: ShTextVariant.Small
- Send Button: colorPalette.primary background
- Required Asterisks: colorPalette.primary

### Story 2: View Payment List with Filter (Member)

**As a** Team Member  
**I want to** view my payment requests with filters  
**So that** I can see what payments I need to make

**Acceptance Criteria:**

- View list of payments (Figma 559-3087)
- Filter by: All, Upcoming, Required
- Show payment status for each
- Tab for Member/Admin view if user is admin
- Uses existing payment_request_members table

**Implementation:**

- Screen: `/app/teams/[id]/payments.tsx`
- API: `/lib/api/payments.ts` - getUserPaymentRequests()

**Figma Style Requirements:**

- Screen Title: ShTextVariant.Heading
- Filter Tabs: ShTextVariant.Label
- Payment Title: ShTextVariant.Body
- Amount: ShTextVariant.Body with colorPalette.primary
- Due Date: ShTextVariant.Small with colorPalette.textSecondary
- Status Badge: ShTextVariant.Caption
- Paid Status: colorPalette.success
- Overdue Status: colorPalette.error

### Story 3: View Payment Detail (Member)

**As a** Team Member  
**I want to** view payment request details  
**So that** I can understand what I'm paying for

**Acceptance Criteria:**

- Payment detail screen (Figma 559-3055)
- Shows all payment information
- Pay button present but does nothing yet
- Shows current payment status

**Implementation:**

- Screen: `/app/payments/[id]/index.tsx`
- API: `/lib/api/payments.ts` - getPaymentDetail()

**Figma Style Requirements:**

- Payment Title: ShTextVariant.Heading
- Description: ShTextVariant.Body
- Amount Display: ShTextVariant.HeadingLarge with colorPalette.primary
- Field Labels: ShTextVariant.Label with colorPalette.textSecondary
- Due Date: ShTextVariant.Body
- Pay Button: ShTextVariant.Button with colorPalette.primary background
- Status Text: ShTextVariant.Small

### Story 4: Stripe Backend Integration

**As a** System  
**I need to** integrate with Stripe securely  
**So that** payments can be processed

**Acceptance Criteria:**

- Supabase Edge Functions for all Stripe API calls
- Create payment intent endpoint
- Webhook handler for payment events
- Update payment_transactions table
- Destination charge implementation
- Test mode configuration

**Implementation:**

- Edge Function: `/supabase/functions/stripe-create-payment`
- Edge Function: `/supabase/functions/stripe-webhook`
- Environment: STRIPE_SECRET_KEY in Supabase secrets

### Story 5: Pay Payment Request (Member)

**As a** Team Member  
**I want to** pay my payment request  
**So that** I complete my financial obligation

**Acceptance Criteria:**

- Stripe payment sheet integration
- Support: Card, Apple Pay, Google Pay
- Call Edge Function for payment intent
- Update payment status on completion
- Show success/failure states

**Implementation:**

- Update: `/app/payments/[id]/index.tsx`
- Stripe Elements via @stripe/stripe-react-native
- API calls to Edge Functions only

**Figma Style Requirements:**

- Payment Sheet Title: ShTextVariant.Heading
- Amount to Pay: ShTextVariant.HeadingLarge
- Card Input Labels: ShTextVariant.Label
- Success Message: ShTextVariant.Body with colorPalette.success
- Error Message: ShTextVariant.Body with colorPalette.error
- Processing State: ShTextVariant.Small with colorPalette.textSecondary

### Story 6: Payment History (Member)

**As a** Team Member  
**I want to** view my payment history  
**So that** I can track my past payments

**Acceptance Criteria:**

- Access via Profile → Payment History
- List view (Figma 559-7147)
- Detail view (Figma 559-7357)
- Shows: Completed, Failed, Cancelled
- Searchable and filterable

**Implementation:**

- Screen: `/app/user/payment-history.tsx`
- Detail: `/app/user/payment/[id].tsx`

**Figma Style Requirements:**

- Screen Title: ShTextVariant.Heading
- Transaction Date: ShTextVariant.Small with colorPalette.textSecondary
- Payment Title: ShTextVariant.Body
- Amount: ShTextVariant.Body
- Completed Status: ShTextVariant.Caption with colorPalette.success
- Failed Status: ShTextVariant.Caption with colorPalette.error
- Receipt Link: ShTextVariant.Label with colorPalette.primary

### Story 7: Admin Payment Management

**As a** Team Admin/Treasurer  
**I want to** manage payment requests  
**So that** I can track collections and send reminders

**Acceptance Criteria:**

- Admin view of payment requests (Figma 559-2776)
- Payment request details (Figma 559-2792)
- Edit request capability (Figma 559-2709)
- Send reminders to non-payers
- Cancel request with notifications
- See who has/hasn't paid

**Implementation:**

- Admin list: `/app/teams/[id]/admin/payments.tsx`
- Edit: `/app/payments/[id]/edit.tsx`
- Uses dot menu pattern for actions

**Figma Style Requirements:**

- Request Title: ShTextVariant.Body
- Collection Progress: ShTextVariant.Small ("5 of 12 paid")
- Total Amount: ShTextVariant.Body with colorPalette.primary
- Member Name: ShTextVariant.Body
- Payment Status: ShTextVariant.Caption
- Send Reminder Button: ShTextVariant.Button with colorPalette.warning
- Cancel Button: ShTextVariant.Button with colorPalette.error
- Dot Menu: IconName.MoreVertical with colorPalette.textSecondary

### Story 8: Payment Notifications

**As a** User  
**I want to** receive notifications about payments  
**So that** I stay informed about payment events

**Acceptance Criteria:**

- Notification on payment request created
- Reminder notifications
- Payment success/failure notifications
- Cancellation notifications
- Push notifications via Expo

**Implementation:**

- Notification service in Edge Functions
- Database triggers for events
- Push token management

## 4. Implementation Sequence

### Story Order (Test After Each):

1. **Story 1: Create Payment Request** (Treasurer)
   - Implement form and database insert
   - Test: Can create requests, data saves correctly

2. **Story 2: View Payment List with Filter** (Member)
   - Implement list view with filters
   - Test: Can see payment requests, filters work

3. **Story 3: View Payment Detail** (Member)
   - Implement detail screen (pay button inactive)
   - Test: Can view all payment details

4. **Story 4: Stripe Backend Integration**
   - Implement Edge Functions
   - Test: Can create payment intents via Postman/curl

5. **Story 5: Pay Payment Request** (Member)
   - Activate pay button with Stripe Elements
   - Test: Can make actual payments in test mode

6. **Story 6: Payment History** (Member)
   - Implement history screens
   - Test: Can see completed payments

7. **Story 7: Admin Payment Management**
   - Implement admin features
   - Test: Can edit, cancel, send reminders

8. **Story 8: Payment Notifications**
   - Implement notification triggers
   - Test: Notifications sent for all events

## 5. UI/UX Specifications

### Design System Compliance

- All screens use Sh\* components
- Colors from `/config/colors.ts`
- Spacing from `/config/spacing.ts`
- Typography from `/config/typography.ts` via ShTextVariant enum
- Icons use IconName enum only
- **CRITICAL**: All text MUST use ShTextVariant enum - raw font properties are FORBIDDEN

### Navigation Patterns

- Stack navigation for all screens
- Custom back arrows per pattern
- Tab shows payment count badge
- Modal for payment confirmation

### Figma Screen Mappings

| Screen          | Figma Node         | Implementation Path                  |
| --------------- | ------------------ | ------------------------------------ |
| Create Request  | 559-2744, 559-2927 | `/app/payments/create-payment.tsx`   |
| Member List     | 559-3087           | `/app/teams/[id]/payments.tsx`       |
| Payment Detail  | 559-3055           | `/app/payments/[id]/index.tsx`       |
| Payment History | 559-7147           | `/app/user/payment-history.tsx`      |
| History Detail  | 559-7357           | `/app/user/payment/[id].tsx`         |
| Admin List      | 559-2776           | `/app/teams/[id]/admin/payments.tsx` |
| Admin Detail    | 559-2792           | `/app/payments/[id]/admin.tsx`       |
| Edit Request    | 559-2709           | `/app/payments/[id]/edit.tsx`        |

### Figma Semantic Style Mappings

#### Text Styles (Use ShTextVariant enum)

| Figma Style Name | ShTextVariant Mapping      | Common Usage                          |
| ---------------- | -------------------------- | ------------------------------------- |
| Heading Large    | ShTextVariant.HeadingLarge | Screen titles                         |
| Heading          | ShTextVariant.Heading      | Section headers                       |
| Subheading Text  | ShTextVariant.SubHeading   | Sub-section headers, "Create Request" |
| Body Text        | ShTextVariant.Body         | Input values, content text            |
| Label Text       | ShTextVariant.Label        | Field labels, form labels             |
| Small Text       | ShTextVariant.Small        | Help text, timestamps, fee breakdowns |
| Button Text      | ShTextVariant.Button       | Button labels                         |
| Caption          | ShTextVariant.Caption      | Hints, small descriptions             |

#### Color Styles (Use colorPalette)

| Figma Style Name | Config Value               | Usage                                          |
| ---------------- | -------------------------- | ---------------------------------------------- |
| Primary Gold     | colorPalette.primary       | CTA buttons, required asterisks, active states |
| Base Dark        | colorPalette.background    | Screen backgrounds, card backgrounds           |
| Stone Grey       | colorPalette.textSecondary | Placeholder text, disabled states, help text   |
| Light Text       | colorPalette.textPrimary   | Primary content, input values, labels          |
| Success Green    | colorPalette.success       | Paid status, success messages                  |
| Error Red        | colorPalette.error         | Error states, overdue payments                 |
| Warning Amber    | colorPalette.warning       | Pending states, due soon                       |
| Surface          | colorPalette.surface       | Input backgrounds, cards                       |
| Border           | colorPalette.border        | Dividers, input borders                        |

#### Spacing Values (Use spacing constants)

| Figma Spacing | Config Value | Usage                        |
| ------------- | ------------ | ---------------------------- |
| 4px           | spacing.xs   | Icon margins, tight spacing  |
| 8px           | spacing.sm   | Small gaps, padding          |
| 12px          | spacing.md   | Standard padding             |
| 16px          | spacing.lg   | Section spacing              |
| 24px          | spacing.xl   | Large gaps, section dividers |
| 32px          | spacing.xxl  | Screen padding               |

## 6. Testing Strategy

### Story-Level Testing

**Testing will be performed by QA team after each story:**

1. Developer completes story implementation
2. Developer runs lint and type checks
3. QA team tests on real phones and simulators
4. QA verifies all acceptance criteria
5. QA checks iOS and Android behavior
6. If issues found, developer fixes and resubmits
7. Only proceed to next story after QA approval

### Integration Testing

- End-to-end payment flow
- Stripe test mode transactions
- Notification delivery
- Database consistency
- Error recovery

### User Acceptance Testing

- Test with treasurer role
- Test with member role
- Verify all workflows
- Performance testing
- Security validation

## 7. Security Considerations

### PCI Compliance

- NO credit card data in our database
- Use Stripe Elements exclusively
- Tokens only, never raw card data
- Secure API communication

### Access Control

- RLS policies on payment tables
- Role-based access (treasurer/member)
- Audit trail for all actions
- Secure Stripe key management

## 8. Known Limitations

Per design document:

- No refund mechanism (manual via Stripe)
- No partial payments
- No bulk payment selection (Phase 2)
- Amount changes require notification
- Team Stripe ID changes not supported

## 9. Future Enhancements

Potential Phase 2 features:

- Bulk payment selection
- Recurring payments
- Payment plans
- Refund workflow
- Payment reports
- Export capabilities

## 10. Development Checklist

### Pre-Development

- [ ] Review this EPIC document
- [ ] Review technical spec: `/docs/architecture/tech-spec-story-1-payment-request.md`
- [ ] Check all Figma screens
- [ ] Verify Stripe account setup
- [ ] Review existing patterns (eventFormStore, member selection)

### Per Story

- [ ] Implement functionality
- [ ] Match Figma exactly using semantic styles
- [ ] Verify all text uses ShTextVariant enum
- [ ] Verify all colors use colorPalette constants
- [ ] No magic values (numbers, strings, colors)
- [ ] Test both platforms
- [ ] Run lint checks
- [ ] Update documentation

### Post-Development

- [ ] End-to-end testing
- [ ] Security review
- [ ] Performance testing
- [ ] User acceptance
- [ ] Deployment plan

## Dependencies

### External Services

- Stripe Connect API
- Expo Push Notifications
- Supabase Edge Functions

### Internal Dependencies

- UserContext for authentication
- Existing Sh\* components
- Team management system
- Notification infrastructure

## Risk Mitigation

| Risk                        | Mitigation                        |
| --------------------------- | --------------------------------- |
| Stripe account setup delays | Manual setup with support         |
| Payment failures            | Clear error messages, retry logic |
| PCI compliance              | Use Stripe Elements only          |
| Performance issues          | Pagination, caching               |
| Security vulnerabilities    | RLS, audit trails, testing        |

## Success Metrics

- Payment request creation time <30 seconds
- Payment completion rate >90%
- Zero PCI compliance issues
- User satisfaction >4.0/5.0
- Payment processing time <5 seconds

## Appendices

### A. Stripe Documentation

- [Stripe Connect](https://stripe.com/docs/connect)
- [Destination Charges](https://stripe.com/docs/connect/destination-charges)
- [React Native SDK](https://stripe.com/docs/stripe-react-native)

### B. Reference Implementation

- Navigation: `/app/events/create-event.tsx`
- Form handling: Auth screens
- API pattern: `/lib/api/users.ts`
- List pattern: `/app/teams/[id]/members.tsx`

### C. Database Status

- All tables already exist in production
- No migrations needed for Story 1
- Verified on project: vwqfwehtjnjenzrhzgol (2025-09-03)
