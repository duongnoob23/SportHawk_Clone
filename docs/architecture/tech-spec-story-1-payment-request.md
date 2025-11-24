# Technical Specification: Story 1 - Create Payment Request

**EPIC:** Team Payments - Stripe Integration  
**Story:** Create Payment Request (Treasurer)  
**Version:** 1.1  
**Date:** 2025-09-03  
**Author:** Architect  
**Reference Implementation:** `/app/events/create-event.tsx`

## 1. Story Overview

### User Story

**As a** Team Treasurer  
**I want to** create a payment request for team members  
**So that** I can collect payments efficiently

### Acceptance Criteria

- Access via Teams → Admin → Payment Request (Figma 559-2927)
- Form includes: Title, Description, Due Date, Type, Members, Amount
- Shows team's Stripe ID (read-only)
- Validation on all required fields
- Creates payment_requests and payment_request_members records
- Sends notifications to selected members

## 2. Technical Architecture

### 2.1 Reference Implementation Pattern

**MANDATORY:** Copy patterns from `/app/events/create-event.tsx`:

- Navigation header configuration (TouchableOpacity pattern)
- Form structure and validation approach
- Member selection using ShNavItem
- Loading state management
- Error handling patterns

### 2.2 Component Structure

```
/app/payments/
  create-payment.tsx         # Main screen component

/stores/
  paymentFormStore.ts       # Zustand store for form state

/lib/api/
  payments.ts               # Payment API client functions

/components/
  ShPaymentAmountInput/     # Custom amount input component
    index.tsx
```

### 2.3 Data Flow

```
User Input → Zustand Store → API Call → Supabase Edge Function → Database
                ↓
        Form Validation
```

### 2.4 Navigation Flow

```
Teams Tab → Team Detail → Admin Section → Create Payment Request
                                            ↓
                                    Member Selection Screen
                                            ↓
                                    Form Submission → Success → Back to Team
```

## 3. Implementation Details

### 3.1 Zustand Store Definition

```typescript
// /stores/paymentFormStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PaymentFormData {
  // Core fields
  title: string;
  description: string;
  amountPence: number;
  dueDate: string | null; // ISO string
  paymentType: 'required' | 'optional';

  // Member selection
  selectedMembers: string[]; // user_ids

  // Team context
  teamId: string;
  teamName: string;
  stripeAccountId: string | null; // Read-only display
}

interface PaymentFormStore {
  formData: Partial<PaymentFormData>;

  // Actions
  updateField: <K extends keyof PaymentFormData>(
    field: K,
    value: PaymentFormData[K]
  ) => void;
  updateMultipleFields: (fields: Partial<PaymentFormData>) => void;
  clearForm: () => void;

  // Validation
  isFormValid: () => boolean;
  getValidationErrors: () => Record<string, string>;
}
```

### 3.2 API Layer

```typescript
// /lib/api/payments.ts

import { supabase } from '@lib/supabase';
import { Database } from '@typ/database';
import { logger } from '@lib/utils/logger';

type PaymentRequest = Database['public']['Tables']['payment_requests']['Row'];
type PaymentRequestInsert =
  Database['public']['Tables']['payment_requests']['Insert'];
type PaymentRequestMember =
  Database['public']['Tables']['payment_request_members']['Row'];

interface CreatePaymentRequestData {
  title: string;
  description?: string;
  amountPence: number;
  dueDate: string;
  paymentType: 'required' | 'optional';
  teamId: string;
  memberIds: string[];
}

export const paymentsApi = {
  // Get team's Stripe account status
  async getTeamStripeAccount(teamId: string) {
    const { data, error } = await supabase
      .from('stripe_accounts')
      .select('*')
      .eq('team_id', teamId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create payment request with members
  async createPaymentRequest(
    data: CreatePaymentRequestData
  ): Promise<PaymentRequest> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Start transaction by creating payment request
    const { data: paymentRequest, error: requestError } = await supabase
      .from('payment_requests')
      .insert({
        team_id: data.teamId,
        created_by: user.id,
        title: data.title,
        description: data.description,
        amount_pence: data.amountPence,
        due_date: data.dueDate,
        payment_type: data.paymentType,
        request_status: 'active',
        total_members: data.memberIds.length,
        paid_members: 0,
        total_collected_pence: 0,
      })
      .select()
      .single();

    if (requestError) throw requestError;

    // Create payment_request_members records
    const memberInserts = data.memberIds.map(memberId => ({
      payment_request_id: paymentRequest.id,
      user_id: memberId,
      payment_status: 'unpaid' as const,
      amount_pence: data.amountPence,
      currency: 'GBP',
    }));

    const { error: membersError } = await supabase
      .from('payment_request_members')
      .insert(memberInserts);

    if (membersError) {
      logger.error('Failed to create payment request members:', membersError);
      // Should ideally rollback payment_request here
      throw membersError;
    }

    // Trigger notifications via Edge Function
    await this.sendPaymentNotifications(paymentRequest.id, data.memberIds);

    return paymentRequest;
  },

  // Send notifications to members
  async sendPaymentNotifications(
    paymentRequestId: string,
    memberIds: string[]
  ) {
    try {
      const { error } = await supabase.functions.invoke(
        'send-payment-notifications',
        {
          body: { paymentRequestId, memberIds },
        }
      );

      if (error) {
        logger.error('Failed to send notifications:', error);
        // Don't throw - notifications are non-critical
      }
    } catch (err) {
      logger.error('Notification error:', err);
    }
  },
};
```

### 3.3 Screen Component Structure - UPDATED

```typescript
// /app/payments/create-payment.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import {
  ShText,
  ShIcon,
  ShFormFieldText,
  ShFormFieldTextArea,
  ShFormFieldDate,
  ShFormFieldChoice,
  ShFormFieldReadOnly,
  ShPaymentAmountInput,
  ShNavItem,
  ShSpacer,
  ShLoadingSpinner,
} from '@cmp/index';

import { colorPalette } from '@cfg/colors';
import { spacing } from '@cfg/spacing';
import { ShTextVariant, fontWeights, fontSizes } from '@cfg/typography';
import { IconName } from '@cfg/icons';
import { Routes } from '@cfg/routes';

import usePaymentFormStore from '@top/stores/paymentFormStore';
import { paymentsApi } from '@lib/api/payments';

export default function CreatePaymentScreen() {
  const params = useLocalSearchParams<{ teamId: string }>();
  const { formData, updateField, clearForm, getValidationErrors } = usePaymentFormStore();

  const [loading, setLoading] = useState(true); // Start with loading true
  const [submitting, setSubmitting] = useState(false);
  const [stripeAccount, setStripeAccount] = useState<any>(null);

  // Navigation header configuration (copy from create-event.tsx)
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Create Request',
          headerStyle: {
            backgroundColor: colorPalette.baseDark, // NOT black
          },
          headerTintColor: colorPalette.lightText, // NOT white
          headerTitleStyle: {
            fontWeight: fontWeights.regular,
            fontSize: fontSizes.body,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ paddingLeft: spacing.md }}
            >
              <ShIcon
                name={IconName.BackArrow}
                size={spacing.iconSizeMedium}
                color={colorPalette.lightText}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSubmit}
              style={{ marginRight: spacing.md }}
              disabled={loading || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colorPalette.primaryGold} />
              ) : (
                <ShText variant={ShTextVariant.Body} style={{ color: colorPalette.primaryGold }}>
                  Send
                </ShText>
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.background }}>
        {/* Screen content */}
      </SafeAreaView>
    </>
  );
}
```

### 3.4 Member Selection Pattern - UPDATED

```typescript
// CRITICAL: Use ShNavItem for member selection (NOT ShFormFieldSelect)
// Copy exact pattern from /app/events/create-event.tsx

// In the form:
<ShNavItem
  label={`Members ${formData.selectedMembers?.length > 0 ? `(${formData.selectedMembers.length})` : '(0)'}`}
  subtitle={formData.selectedMembers?.length > 0 ?
    `${formData.selectedMembers.length} selected` :
    'Select team members'}
  onPress={handleSelectMembers}
  required  // This adds the gold asterisk
  showDropdownIcon
/>

// Navigation handler:
const handleSelectMembers = () => {
  router.push({
    pathname: Routes.PaymentEditMembers,
    params: {
      teamId: params.teamId,
      returnRoute: Routes.PaymentCreate,
    }
  });
};
```

## 4. Database Interactions

### 4.1 Tables Used

1. **payment_requests** - Main payment record
2. **payment_request_members** - Individual member records
3. **stripe_accounts** - Read-only for display
4. **notifications** - Created by Edge Function

### 4.2 Database Operations

```sql
-- 1. Create payment request
INSERT INTO payment_requests (
  team_id, created_by, title, description,
  amount_pence, due_date, payment_type,
  request_status, total_members
) VALUES (...);

-- 2. Create member records
INSERT INTO payment_request_members (
  payment_request_id, user_id, payment_status,
  amount_pence, currency
) VALUES (...);

-- 3. Check Stripe account (read-only)
SELECT * FROM stripe_accounts WHERE team_id = ?;
```

## 5. Edge Function Requirements

### 5.1 send-payment-notifications

```typescript
// /supabase/functions/send-payment-notifications/index.ts

interface RequestBody {
  paymentRequestId: string;
  memberIds: string[];
}

// Function will:
// 1. Fetch payment request details
// 2. Create notification records
// 3. Trigger push notifications via Expo
// 4. Return success/failure status
```

## 6. Validation Rules

### 6.1 Client-Side Validation

```typescript
const validationRules = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
  },
  description: {
    maxLength: 500,
  },
  amountPence: {
    required: true,
    min: 100, // £1.00 minimum
    max: 100000000, // £1,000,000 maximum
  },
  dueDate: {
    required: true,
    minDate: new Date().toISOString(), // Must be future date
  },
  selectedMembers: {
    required: true,
    minLength: 1, // At least one member
  },
};
```

### 6.2 Server-Side Validation

- RLS policies ensure user is team admin
- Check constraint on amount_pence > 0
- Check constraint on due_date >= CURRENT_DATE
- Foreign key constraints on team_id and user_id

## 7. Error Handling

### 7.1 Error States

```typescript
enum PaymentErrorCode {
  NO_STRIPE_ACCOUNT = 'NO_STRIPE_ACCOUNT',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  NO_MEMBERS_SELECTED = 'NO_MEMBERS_SELECTED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DUPLICATE_REQUEST = 'DUPLICATE_REQUEST',
}

const errorMessages: Record<PaymentErrorCode, string> = {
  NO_STRIPE_ACCOUNT: 'Team must set up Stripe account first',
  INVALID_AMOUNT: 'Amount must be between £1 and £1,000,000',
  NO_MEMBERS_SELECTED: 'Select at least one team member',
  NETWORK_ERROR: 'Network error. Please try again',
  PERMISSION_DENIED: 'Only team admins can create payment requests',
  DUPLICATE_REQUEST: 'Similar payment request already exists',
};
```

### 7.2 Error Recovery

- Form data persisted in Zustand with AsyncStorage
- Retry logic for network failures
- Clear error messages with recovery actions
- Rollback partial database writes on failure

## 7.5 Figma Style Mapping

### Extracted Style Names from Node 559-2744

**Text Styles Used:**
| Figma Style Name | ShTextVariant | Location in Design |
|-----------------|---------------|-------------------|
| Body Text | ShTextVariant.Body | Input placeholders, values |
| Label Text | ShTextVariant.Label | Field labels |
| Small Text | ShTextVariant.Small | Help text, fee breakdown |
| Subheading Text | ShTextVariant.SubHeading | "Create Request" header |

**Color Styles Used:**
| Figma Style Name | Config Value | Usage |
|-----------------|--------------|-------|
| Primary Gold | colorPalette.primary | Required asterisk, "Send" button |
| Base Dark | colorPalette.background | Screen background, input backgrounds |
| Stone Grey | colorPalette.textSecondary | Placeholder text, help text |
| Light Text | colorPalette.textPrimary | Input values, labels |

**CRITICAL**: All text MUST use the ShTextVariant mapping above. Raw font properties are forbidden.

## 8. UI Components

### 8.1 Custom Components Needed

```typescript
// ShPaymentAmountInput component
interface ShPaymentAmountInputProps {
  value: number; // in pence
  onChangeValue: (pence: number) => void;
  currency?: 'GBP' | 'EUR' | 'USD';
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
}

// Features:
// - Format as currency while typing (£10.00)
// - Store as pence internally
// - Max 2 decimal places
// - Numeric keyboard
// - Currency symbol prefix
```

### 8.2 Existing Components Used - UPDATED

**Form Components (with `required` prop for asterisks):**

- ShFormFieldText - Title input with `required` prop
- ShFormFieldTextArea - Description input
- ShFormFieldDate - Due date with `required` prop
- ShFormFieldChoice - Payment type toggle with `required` prop
- ShFormFieldReadOnly - Stripe ID display (stoneGrey color)
- ShPaymentAmountInput - Amount with `required` prop

**Navigation Components:**

- ShNavItem - Member selection (NOT ShFormFieldSelect)
- TouchableOpacity - Header buttons (NOT ShHeaderButton)
- ShIcon with IconName.BackArrow - Back navigation
- ShText with ShTextVariant.Body - Action text

**Display Components:**

- ShLoadingSpinner - Loading state
- ShSpacer - Consistent spacing
- SafeAreaView - iOS safe area handling

## 9. Navigation Configuration - UPDATED

```typescript
// Add to /config/routes.ts
export const Routes = {
  // ... existing routes
  PaymentCreate: '/payments/create-payment',
  PaymentEditMembers: '/payments/edit-members',
  PaymentSuccess: '/payments/success',
} as const;

// Stack configuration - USE INLINE OPTIONS IN COMPONENT
// DO NOT configure in _layout.tsx
// Configure directly in create-payment.tsx as shown in section 3.3
```

## 10. Success Criteria

### 10.1 Functional Requirements

- [ ] Form validates all required fields
- [ ] Amount stored as pence (integer)
- [ ] Member selection works identically to event creation
- [ ] Database records created correctly
- [ ] Notifications sent to selected members
- [ ] Form state persisted during navigation
- [ ] Success message shown after creation

### 10.2 Non-Functional Requirements

- [ ] Form submission < 3 seconds
- [ ] Responsive during typing
- [ ] Keyboard handling correct
- [ ] No magic values in code
- [ ] Follows existing patterns exactly
- [ ] Handles offline state gracefully

## 11. Testing Checklist

### 11.1 QA Testing Points

1. **Form Validation**
   - Empty form cannot submit
   - Each field validates correctly
   - Error messages clear and helpful

2. **Member Selection**
   - Navigate to member selection
   - Select/deselect members
   - Return with selection preserved

3. **Amount Input**
   - Accepts valid amounts
   - Rejects invalid amounts
   - Displays formatted currency

4. **Database Verification**
   - payment_requests record created
   - payment_request_members records created
   - Correct values stored

5. **Edge Cases**
   - No Stripe account configured
   - Network timeout during submission
   - Maximum members selected
   - Minimum/maximum amounts

## 12. Implementation Sequence

1. Create paymentFormStore.ts (Zustand)
2. Create payments.ts API layer
3. Create ShPaymentAmountInput component
4. Create create-payment.tsx screen
5. Add routes configuration
6. Integrate with navigation
7. Test form validation
8. Test API integration
9. Test member selection flow
10. End-to-end testing by QA

## 13. Dependencies

### 13.1 External Dependencies

- None (uses existing packages)

### 13.2 Internal Dependencies

- UserContext for authentication
- Existing Sh\* components
- teamsApi for team data
- Existing member selection pattern
- Zustand store pattern

## 14. Risks & Mitigations

| Risk                       | Mitigation                                |
| -------------------------- | ----------------------------------------- |
| No Stripe account          | Display clear message, prevent submission |
| Network failures           | Persist form state, retry logic           |
| Large member lists         | Pagination in member selection            |
| Currency conversion errors | Store as pence (integers) only            |
| Concurrent modifications   | Database constraints prevent duplicates   |

## 15. Notes for Developer

### 15.1 DO NOT

- Create new patterns - follow existing ones exactly
- Use ShHeaderButton - it's deprecated
- Use ShFormFieldSelect for navigation - use ShNavItem
- Use colorPalette.black or .white - use baseDark/lightText
- Use `isRequired` prop - use `required` instead
- Use decimal for amounts - always use integers (pence)
- Make Stripe API calls from client - Edge Functions only
- Use magic values - everything from config
- Create TODO comments without permission
- Modify existing working components

### 15.2 MUST DO

- Copy navigation pattern from `/app/events/create-event.tsx`
- Use TouchableOpacity for header buttons
- Use ShNavItem for member selection
- Use `required` prop on form fields for asterisks
- Initialize loading state to `true`
- Wrap content in SafeAreaView
- Use semantic colors (baseDark, lightText, stoneGrey)
- Run `npm run lint` before declaring complete
- Test on both iOS and Android
- Match Figma design exactly (559-2927)
- Use ShTextVariant enum for all text
- Handle all error states explicitly

## 16. References

- **PRIMARY REFERENCE:** `/app/events/create-event.tsx` - Copy all patterns from here
- EPIC Document: `/docs/prd/epic-payments-stripe-integration.md`
- UI Patterns Guide: `/docs/architecture/ui-patterns.md`
- Component Library: `/docs/architecture/component-library.md`
- Coding Standards: `/docs/architecture/coding-standards.md`
- Figma Design: Node 559-2927
- Member Selection Pattern: `/app/events/edit-members.tsx`
- API Pattern: `/lib/api/teams.ts`
- Store Pattern: `/stores/eventFormStore.ts`

---

**Next Steps:** Developer implements Story 1 following this specification exactly. After implementation and QA testing passes, proceed to Story 2.
