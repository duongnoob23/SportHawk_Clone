# Figma-to-Code Translation Layer: PAY-005 Stripe Payment Integration

**Story:** PAY-005 - Pay Payment Request (Member)  
**Base Screen:** Extends PAY-003 implementation at `/app/payments/[id]/index.tsx`  
**Figma Node:** 559-3055 (Payment Detail with active Pay button)  
**Integration:** Stripe React Native SDK
**Stylesheet Location:** Inline styles in component (following existing pattern)

## 🎯 Critical Implementation Notes

### ⚠️ IMPORTANT: This Extends PAY-003

- **DO NOT** create a new screen - modify existing `/app/payments/[id]/index.tsx`
- **DO NOT** change the UI layout - only add payment functionality
- **DO NOT** make direct Stripe API calls - use Edge Functions only

### 📦 Import Path Rules:

- **In `/app` screens/pages:** Use path aliases from tsconfig.json (@cfg, @lib, @cmp, etc.)
- **In `/components`:** Use relative paths (../) for local imports, aliases for config/lib

## 📦 Required Setup

### 1. Install Stripe SDK

```bash
npm install @stripe/stripe-react-native
```

### 2. iOS Configuration (ios/Podfile)

```ruby
# Add to Podfile if not present
pod 'StripePaymentSheet', '~> 23.18.2'
```

### 3. Android Configuration (android/app/build.gradle)

```gradle
dependencies {
    implementation 'com.stripe:stripe-android:20.34.4'
}
```

## 🎨 UI State Translations

### Payment Button States

#### 1. Default State (Ready to Pay)

```typescript
import { PAYMENT_UI_MESSAGES } from '@cfg/payments';
import { colorPalette } from '@cfg/colors';
import { ShText, ShTextVariant } from '@cmp/ShText/ShText';

// Button enabled, showing amount
<TouchableOpacity
  style={[styles.payButton, { backgroundColor: colorPalette.primary }]}
  onPress={handlePayment}
  disabled={false}
>
  <ShText variant={ShTextVariant.Button} color={colorPalette.white}>
    {PAYMENT_UI_MESSAGES.PAY_BUTTON(amountPence)}
  </ShText>
</TouchableOpacity>
```

#### 2. Processing State (Creating Payment Intent)

```typescript
import { PAYMENT_UI_MESSAGES } from '@cfg/payments';
import { opacity } from '@cfg/opacity';
import { spacing } from '@cfg/spacing';
import { ShSpacer } from '@cmp/ShSpacer/ShSpacer';

// Button disabled, showing loader
<TouchableOpacity
  style={[styles.payButton, { backgroundColor: colorPalette.primary, opacity: opacity.medium }]}
  disabled={true}
>
  <View style={styles.processingContainer}>
    <ActivityIndicator size="small" color={colorPalette.white} />
    <ShSpacer width={spacing.xs} />
    <ShText variant={ShTextVariant.Button} color={colorPalette.white}>
      {PAYMENT_UI_MESSAGES.PREPARING_PAYMENT}
    </ShText>
  </View>
</TouchableOpacity>
```

#### 3. Payment Sheet Active

```typescript
import { PAYMENT_UI_MESSAGES } from '@cfg/payments';
import { opacity } from '@cfg/opacity';

// Button shows "Processing" while Stripe sheet is open
<TouchableOpacity
  style={[styles.payButton, { backgroundColor: colorPalette.primary, opacity: opacity.strong }]}
  disabled={true}
>
  <ShText variant={ShTextVariant.Button} color={colorPalette.white}>
    {PAYMENT_UI_MESSAGES.PROCESSING_PAYMENT}
  </ShText>
</TouchableOpacity>
```

#### 4. Success State

```typescript
import { PAYMENT_UI_MESSAGES } from '@cfg/payments';
import { ShIcon, IconName } from '@cmp/ShIcon/ShIcon';
import { spacing } from '@cfg/spacing';

// Show success message and icon
<View style={[styles.statusBanner, { backgroundColor: colorPalette.successLight }]}>
  <ShIcon name={IconName.CheckCircle} size={spacing.iconSizeMedium} color={colorPalette.success} />
  <ShSpacer width={spacing.sm} />
  <ShText variant={ShTextVariant.Body} color={colorPalette.success}>
    {PAYMENT_UI_MESSAGES.PAYMENT_SUCCESS}
  </ShText>
</View>
```

#### 5. Error State

```typescript
import { PAYMENT_UI_MESSAGES } from '@cfg/payments';

// Show error with retry option
<View>
  <View style={[styles.statusBanner, { backgroundColor: colorPalette.errorLight }]}>
    <ShIcon name={IconName.AlertCircle} size={spacing.iconSizeMedium} color={colorPalette.error} />
    <ShSpacer width={spacing.sm} />
    <ShText variant={ShTextVariant.Body} color={colorPalette.error}>
      {errorMessage}
    </ShText>
  </View>
  <ShSpacer height={spacing.md} />
  <TouchableOpacity
    style={[styles.payButton, { backgroundColor: colorPalette.primary }]}
    onPress={handleRetryPayment}
  >
    <ShText variant={ShTextVariant.Button} color={colorPalette.white}>
      {PAYMENT_UI_MESSAGES.TRY_AGAIN}
    </ShText>
  </TouchableOpacity>
</View>
```

## 💻 Complete Implementation Code

### Step 1: Add Stripe Provider Wrapper

```typescript
// At the top of /app/payments/[id]/index.tsx
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

// Wrap your component
export default function PaymentDetailScreen() {
  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.sporthawk.app" // For Apple Pay
    >
      <PaymentDetailContent />
    </StripeProvider>
  );
}
```

### Step 2: Payment Flow Implementation

```typescript
// Inside PaymentDetailContent component
import { useStripe } from '@stripe/stripe-react-native';
import { supabase } from '@lib/supabase';
import {
  PAYMENT_FLOW_STATUS,
  PaymentFlowStatus,
  getPaymentErrorMessage,
  PAYMENT_ERROR_MESSAGES,
} from '@cfg/payments';
import { paymentApi } from '@api/payments';

function PaymentDetailContent() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [paymentStatus, setPaymentStatus] = useState<PaymentFlowStatus>(
    PAYMENT_FLOW_STATUS.IDLE
  );
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handlePayment = async () => {
    try {
      // Step 1: Update UI to processing
      setPaymentStatus(PAYMENT_FLOW_STATUS.CREATING_INTENT);
      setErrorMessage('');

      // Step 2: Create payment intent via Edge Function
      const { data, error } = await supabase.functions.invoke(
        'stripe-create-payment',
        {
          body: {
            payment_request_member_id: paymentDetail.memberPaymentId,
            amount_pence: paymentDetail.amountPence,
            currency: 'gbp',
            payment_request_id: paymentDetail.id,
            user_id: currentUser.id,
          },
        }
      );

      if (error) throw new Error(error.message);
      if (!data?.client_secret)
        throw new Error(PAYMENT_ERROR_MESSAGES.PAYMENT_INTENT_FAILED);

      // Step 3: Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: data.client_secret,
        merchantDisplayName: 'SportHawk',
        defaultBillingDetails: {
          name: currentUser.full_name || '',
          email: currentUser.email || '',
        },
        returnURL: 'sporthawk://payment-return', // For mobile app
        allowsDelayedPaymentMethods: false,
        applePay: {
          merchantCountryCode: 'GB',
        },
        googlePay: {
          merchantCountryCode: 'GB',
          testEnv: __DEV__, // Use test environment in development
        },
      });

      if (initError) throw new Error(initError.message);

      // Step 4: Present payment sheet
      setPaymentStatus(PAYMENT_FLOW_STATUS.SHEET_PRESENTED);
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // User cancelled or error occurred
        if (presentError.code === 'Canceled') {
          setPaymentStatus(PAYMENT_FLOW_STATUS.IDLE);
          return;
        }
        throw presentError;
      }

      // Step 5: Payment successful
      setPaymentStatus(PAYMENT_FLOW_STATUS.SUCCESS);

      // Update local state
      await paymentApi.updatePaymentStatus(
        paymentDetail.memberPaymentId,
        'paid'
      );

      // Navigate back after short delay
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus(PAYMENT_FLOW_STATUS.ERROR);
      setErrorMessage(getPaymentErrorMessage(error));
    }
  };

  const handleRetryPayment = () => {
    setPaymentStatus(PAYMENT_FLOW_STATUS.IDLE);
    setErrorMessage('');
    handlePayment();
  };

  // ... rest of component
}
```

### Step 3: Error Handling

```typescript
// Error handling is managed via the getPaymentErrorMessage helper
import { getPaymentErrorMessage } from '@cfg/payments';

// Usage in catch block:
catch (error: any) {
  const userFriendlyMessage = getPaymentErrorMessage(error);
  setErrorMessage(userFriendlyMessage);
}
```

## 🎨 Styles Configuration

```typescript
import { StyleSheet } from 'react-native';
import { spacing } from '@cfg/spacing';
import { colorPalette } from '@cfg/colors';

const styles = StyleSheet.create({
  payButton: {
    padding: spacing.md,
    borderRadius: spacing.borderRadiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: spacing.buttonHeightMedium,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.borderRadiusMedium,
    marginBottom: spacing.md,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colorPalette.backgroundSecondary,
    borderRadius: spacing.borderRadiusSmall,
    marginVertical: spacing.xs,
  },
});
```

## 🔄 State Management

### Payment State Machine

```typescript
import { PaymentFlowStatus, PAYMENT_FLOW_STATUS } from '@cfg/payments';

type PaymentState = {
  status: PaymentFlowStatus;
  error: string | null;
  paymentIntentId: string | null;
};

const [paymentState, setPaymentState] = useState<PaymentState>({
  status: PAYMENT_FLOW_STATUS.IDLE,
  error: null,
  paymentIntentId: null,
});
```

## 🧪 Test Card Numbers

For development testing, use these Stripe test cards:

```typescript
const TEST_CARDS = {
  success: '4242 4242 4242 4242',
  declined: '4000 0000 0000 0002',
  insufficient: '4000 0000 0000 9995',
  expired: '4000 0000 0000 0069',
  cvcError: '4000 0000 0000 0127',
};
```

## 📱 Platform-Specific Considerations

### iOS Apple Pay Setup

```typescript
// Check Apple Pay availability
const { isApplePaySupported } = useStripe();

useEffect(() => {
  if (Platform.OS === 'ios') {
    checkApplePaySupport();
  }
}, []);

const checkApplePaySupport = async () => {
  const supported = await isApplePaySupported();
  setApplePayAvailable(supported);
};
```

### Android Google Pay Setup

```typescript
// Check Google Pay availability
const { isGooglePaySupported } = useStripe();

useEffect(() => {
  if (Platform.OS === 'android') {
    checkGooglePaySupport();
  }
}, []);

const checkGooglePaySupport = async () => {
  const supported = await isGooglePaySupported();
  setGooglePayAvailable(supported);
};
```

## ⚠️ Security Checklist

- [ ] ✅ Stripe publishable key in environment variable
- [ ] ✅ No secret keys in client code
- [ ] ✅ All API calls through Edge Functions
- [ ] ✅ Payment intent created server-side
- [ ] ✅ Amount validation server-side
- [ ] ✅ User authentication verified
- [ ] ✅ Payment status updates atomic
- [ ] ✅ Idempotency keys for retries

## 🔍 Debugging & Monitoring

### Console Logging Strategy

```typescript
// Add comprehensive logging for debugging
const handlePayment = async () => {
  console.log('🔵 [PAY-005] Starting payment flow', {
    memberPaymentId: paymentDetail.memberPaymentId,
    amountPence: paymentDetail.amountPence,
    userId: currentUser.id,
    timestamp: new Date().toISOString(),
  });

  try {
    setPaymentStatus(PAYMENT_FLOW_STATUS.CREATING_INTENT);

    console.log('🔵 [PAY-005] Calling Edge Function...');
    const { data, error } = await supabase.functions.invoke(
      'stripe-create-payment',
      {
        body: {
          /* ... */
        },
      }
    );

    if (error) {
      console.error('🔴 [PAY-005] Edge Function error:', error);
      throw error;
    }

    console.log('✅ [PAY-005] Payment intent created:', {
      clientSecret: data.client_secret ? 'Present' : 'Missing',
      paymentIntentId: data.payment_intent_id,
    });

    // Continue with payment...
  } catch (error) {
    console.error('🔴 [PAY-005] Payment failed:', {
      error,
      errorMessage: getPaymentErrorMessage(error),
      stack: error.stack,
    });
  }
};
```

### Supabase Edge Function Logs

```bash
# View Edge Function logs in real-time
npx supabase functions logs stripe-create-payment --tail

# Check specific payment attempt
npx supabase functions logs stripe-create-payment --filter "payment_request_member_id=<ID>"
```

### Database Verification Queries

```sql
-- Check payment request member status
SELECT * FROM payment_request_members
WHERE id = '<member_payment_id>'
ORDER BY updated_at DESC;

-- Verify payment transaction was created
SELECT * FROM payment_transactions
WHERE payment_request_member_id = '<member_payment_id>'
ORDER BY created_at DESC;

-- Check all payments for a user
SELECT
  prm.*,
  pt.stripe_payment_intent_id,
  pt.status as transaction_status
FROM payment_request_members prm
LEFT JOIN payment_transactions pt ON pt.payment_request_member_id = prm.id
WHERE prm.user_id = '<user_id>'
ORDER BY prm.created_at DESC;
```

## ✅ Success Verification Checklist

### Immediate UI Verification

- [ ] ✅ Payment button shows "Processing..." during payment
- [ ] ✅ Stripe payment sheet appears with correct amount
- [ ] ✅ Success message displays after payment
- [ ] ✅ Screen navigates back to payment list
- [ ] ✅ Payment status shows as "Paid" in list

### Database Verification (Backend)

```sql
-- Run these queries to verify success
-- 1. Payment request member should be marked as paid
SELECT payment_status, paid_at, stripe_payment_intent_id
FROM payment_request_members
WHERE id = '<member_payment_id>';
-- Expected: payment_status = 'paid', paid_at = timestamp, stripe_payment_intent_id = 'pi_xxx'

-- 2. Transaction record should exist
SELECT * FROM payment_transactions
WHERE payment_request_member_id = '<member_payment_id>';
-- Expected: One record with status = 'succeeded'

-- 3. Check payment request completion
SELECT
  COUNT(*) as total_members,
  COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_members
FROM payment_request_members
WHERE payment_request_id = '<request_id>';
```

### Stripe Dashboard Verification

1. Go to https://dashboard.stripe.com/test/payments
2. Find payment by amount and timestamp
3. Verify:
   - [ ] Payment shows as "Succeeded"
   - [ ] Amount matches (in pence)
   - [ ] Metadata contains correct IDs
   - [ ] Customer email/name present

## 🧪 Developer Testing Guide (Without Running App)

### 1. Test Edge Function Directly

```bash
# Test payment intent creation
curl -X POST https://[PROJECT_URL]/functions/v1/stripe-create-payment \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_request_member_id": "test-id",
    "amount_pence": 1000,
    "currency": "gbp"
  }'

# Expected response:
# {
#   "client_secret": "pi_xxx_secret_xxx",
#   "payment_intent_id": "pi_xxx"
# }
```

### 2. Unit Test Payment Logic

```typescript
// __tests__/payment-flow.test.ts
import { getPaymentErrorMessage, PAYMENT_ERROR_MESSAGES } from '@cfg/payments';

describe('Payment Error Handling', () => {
  it('maps Stripe errors correctly', () => {
    const error = { code: 'card_declined' };
    expect(getPaymentErrorMessage(error)).toBe(
      PAYMENT_ERROR_MESSAGES.CARD_DECLINED
    );
  });

  it('handles unknown errors', () => {
    const error = { code: 'unknown_error' };
    expect(getPaymentErrorMessage(error)).toBe(
      PAYMENT_ERROR_MESSAGES.GENERIC_ERROR
    );
  });
});
```

### 3. Mock Stripe Payment Sheet

```typescript
// __mocks__/@stripe/stripe-react-native.js
export const useStripe = () => ({
  initPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
  presentPaymentSheet: jest.fn().mockResolvedValue({ error: null }),
});
```

## 📱 Manual QA Test Plan

### Prerequisites

- [ ] Test on real device (Stripe doesn't work in Expo Go)
- [ ] Have Stripe test cards ready
- [ ] Know how to check Supabase logs
- [ ] Access to database for verification

### Test Scenarios

#### 1. Happy Path - Successful Payment

```
1. Navigate to payment detail screen
2. Tap "Pay £X.XX" button
3. Use test card: 4242 4242 4242 4242
4. Complete payment
5. Verify:
   - Success message appears
   - Redirected to payment list
   - Payment shows as "Paid"
   - Database updated (check queries above)
   - Stripe dashboard shows payment
```

#### 2. User Cancellation

```
1. Navigate to payment detail screen
2. Tap "Pay £X.XX" button
3. When Stripe sheet appears, tap Cancel/X
4. Verify:
   - Returns to payment detail screen
   - Button returns to "Pay £X.XX" state
   - No error message shown
   - No database changes
```

#### 3. Card Declined

```
1. Navigate to payment detail screen
2. Tap "Pay £X.XX" button
3. Use test card: 4000 0000 0000 0002
4. Verify:
   - Error message: "Your card was declined..."
   - "Try Again" button appears
   - Can retry payment
   - No database changes until success
```

#### 4. Network Failure

```
1. Enable airplane mode
2. Navigate to payment detail screen
3. Tap "Pay £X.XX" button
4. Verify:
   - Error message about network
   - Can retry when connection restored
```

#### 5. Already Paid Prevention

```
1. Complete a successful payment
2. Try to navigate back to same payment
3. Verify:
   - Pay button should be disabled/hidden
   - Shows "Paid" status
```

## 🚨 Troubleshooting Guide

### Common Issues & Solutions

#### Issue: "Failed to create payment intent"

```bash
# Check Edge Function logs
npx supabase functions logs stripe-create-payment --tail

# Common causes:
1. Missing STRIPE_SECRET_KEY in Edge Function secrets
2. Invalid payment_request_member_id
3. User not authenticated
4. Amount is 0 or negative

# Fix:
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
```

#### Issue: Payment succeeds but status not updated

```bash
# Check webhook configuration
1. Verify webhook endpoint in Stripe Dashboard
2. Check webhook secret is set correctly
3. View webhook logs in Stripe Dashboard
4. Check Edge Function logs for webhook handler

# Debug webhook locally:
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

#### Issue: Payment sheet not appearing

```javascript
// Add debug logging
const { error: initError } = await initPaymentSheet({
  paymentIntentClientSecret: data.client_secret,
  // ...
});

if (initError) {
  console.error('Init error:', initError);
  // Check: Is client_secret valid?
  // Check: Is Stripe SDK properly initialized?
}
```

#### Issue: Apple Pay not working

```
1. Check merchant identifier is correct
2. Verify Apple Pay is set up on device
3. Check provisioning profile includes Apple Pay capability
4. Ensure using real device (not simulator)
```

## 🚀 Integration Checklist

Before marking complete:

1. [ ] Stripe SDK installed and configured
2. [ ] Environment variables set (EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY)
3. [ ] Edge Function deployed with STRIPE_SECRET_KEY
4. [ ] Console logging added for debugging
5. [ ] Payment flow tested with all test cards
6. [ ] Database verification queries run successfully
7. [ ] Success state navigation working
8. [ ] Error handling displays correctly
9. [ ] Loading states smooth
10. [ ] Both iOS and Android tested
11. [ ] Apple Pay tested (iOS real device)
12. [ ] Google Pay tested (Android)
13. [ ] Webhook handling verified
14. [ ] All test scenarios passed

## 📝 Common Issues & Solutions

### Issue: "No such module 'Stripe'" (iOS)

```bash
cd ios && pod install && cd ..
```

### Issue: Payment sheet not appearing

```typescript
// Ensure publishable key is set
console.log('Stripe key:', process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY);
```

### Issue: Payment succeeds but status not updated

```typescript
// Check webhook is configured in Stripe Dashboard
// Verify Edge Function logs in Supabase Dashboard
```

## 📍 Stylesheet Pattern

Following the existing PAY-003 pattern, styles should be defined inline in the component file using `StyleSheet.create()`. This maintains consistency with the current codebase approach where payment-related components have self-contained styles.

## 🔗 Related Files

- **Main Implementation:** `/app/payments/[id]/index.tsx`
- **Edge Function:** `/supabase/functions/stripe-create-payment/index.ts`
- **API Helper:** `/lib/api/payments.ts`
- **Webhook Handler:** `/supabase/functions/stripe-webhook/index.ts`
- **Payment Constants:** `/config/payments.ts`
- **Types:** `/types/payment.types.ts`
