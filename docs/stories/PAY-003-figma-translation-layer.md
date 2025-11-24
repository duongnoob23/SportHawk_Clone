# Figma-to-Code Translation Layer: PAY-003 Payment Detail View

**Story:** PAY-003 - View Payment Detail (Member)  
**Figma Node:** 559-3055  
**New Screen:** `/app/payments/[id]/index.tsx`  
**Reference:** `/app/events/event-details.tsx`

## 📸 Figma Design Analysis

### Visual Elements from Node 559-3055:

1. **Custom Header** - Back arrow, "Payment Details" title, three dots (hidden for MVP)
2. **Payment Title** - Large text at top
3. **Requested By** - Team avatar and name
4. **Due Date Banner** - Yellow warning banner with clock icon
5. **Description Section** - Header and text content
6. **Total Section** - Grey background with amount
7. **Payment Buttons** - Three payment options (DISABLED for Story 3)

## 🎯 Complete Implementation Code

```typescript
// /app/payments/[id]/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ShText, ShTextVariant } from '../../../components/ShText/ShText';
import { ShIcon, IconName } from '../../../components/ShIcon/ShIcon';
import { ShSpacer } from '../../../components/ShSpacer/ShSpacer';
import { colorPalette } from '../../../config/colors';
import { spacing } from '../../../config/spacing';
import { fontSizes, fontWeights } from '../../../config/typography';
import { paymentApi } from '../../../lib/api/payments';

interface PaymentDetail {
  id: string;
  title: string;
  description: string;
  amountPence: number;
  dueDate: string | null;
  paymentType: 'required' | 'optional';
  createdBy: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  team: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  paymentStatus: 'pending' | 'paid' | 'overdue';
  userPaymentStatus?: 'pending' | 'paid';
}

export default function PaymentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPaymentDetail(id as string);
    }
  }, [id]);

  const fetchPaymentDetail = async (paymentId: string) => {
    try {
      setLoading(true);
      const detail = await paymentApi.getPaymentDetail(paymentId);
      setPaymentDetail(detail);
    } catch (error) {
      console.error('Error fetching payment detail:', error);
      Alert.alert(
        'Error',
        'Unable to load payment details. Please try again.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    const formattedDate = date.toLocaleDateString('en-GB', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-GB', timeOptions);
    return `${formattedDate} • ${formattedTime}`;
  };

  const handlePaymentPress = (method: string) => {
    // Story 3: Payment buttons are disabled
    console.log(`Payment method ${method} will be implemented in Story 5`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colorPalette.primaryGold} />
          <ShSpacer size={spacing.md} />
          <ShText variant={ShTextVariant.Body} style={styles.loadingText}>
            Loading payment details...
          </ShText>
        </View>
      </SafeAreaView>
    );
  }

  if (!paymentDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <ShText variant={ShTextVariant.Heading} style={styles.errorText}>
            Payment not found
          </ShText>
          <ShSpacer size={spacing.lg} />
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ShText variant={ShTextVariant.Body} style={styles.backButtonText}>
              Go Back
            </ShText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <ShIcon
              name={IconName.ArrowLeft}
              size={24}
              color={colorPalette.lightText}
            />
          </TouchableOpacity>

          <ShText variant={ShTextVariant.Body} style={styles.headerTitle}>
            Payment Details
          </ShText>

          {/* Three dots menu hidden for MVP */}
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Payment Title & Requester */}
          <View style={styles.titleSection}>
            <ShText variant={ShTextVariant.SubHeading} style={styles.paymentTitle}>
              {paymentDetail.title}
            </ShText>

            <View style={styles.requesterRow}>
              <ShText variant={ShTextVariant.Small} style={styles.requesterLabel}>
                Requested by
              </ShText>

              {paymentDetail.team.imageUrl ? (
                <Image
                  source={{ uri: paymentDetail.team.imageUrl }}
                  style={styles.teamAvatar}
                />
              ) : (
                <View style={[styles.teamAvatar, styles.teamAvatarPlaceholder]}>
                  <ShIcon
                    name={IconName.Team}
                    size={12}
                    color={colorPalette.stoneGrey}
                  />
                </View>
              )}

              <ShText variant={ShTextVariant.Small} style={styles.teamName}>
                {paymentDetail.team.name}
              </ShText>
            </View>
          </View>

          {/* Due Date Banner */}
          {paymentDetail.dueDate && (
            <View style={styles.dueDateBanner}>
              <View style={styles.dueDateLeft}>
                <ShIcon
                  name={IconName.Clock}
                  size={16}
                  color={colorPalette.primaryGold}
                />
                <ShText variant={ShTextVariant.Body} style={styles.dueDateLabel}>
                  Due by
                </ShText>
              </View>

              <ShText variant={ShTextVariant.Body} style={styles.dueDateText}>
                {formatDueDate(paymentDetail.dueDate)}
              </ShText>
            </View>
          )}

          <ShSpacer size={spacing.xl} />

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <ShText variant={ShTextVariant.SubHeading} style={styles.sectionTitle}>
              Description
            </ShText>
            <ShSpacer size={spacing.md} />
            <ShText variant={ShTextVariant.Body} style={styles.descriptionText}>
              {paymentDetail.description || 'No description provided'}
            </ShText>
          </View>

          <ShSpacer size={spacing.xxl} />

          {/* Total Section */}
          <View style={styles.totalContainer}>
            <ShText variant={ShTextVariant.Body} style={styles.totalLabel}>
              Total
            </ShText>
            <ShText variant={ShTextVariant.SubHeading} style={styles.totalAmount}>
              {formatAmount(paymentDetail.amountPence)}
            </ShText>
          </View>

          <ShSpacer size={spacing.xxl} />

          {/* Payment Buttons (DISABLED for Story 3) */}
          <View style={styles.paymentButtonsSection}>
            {/* Pay with Card */}
            <TouchableOpacity
              style={[styles.paymentButton, styles.primaryPaymentButton, styles.disabledButton]}
              onPress={() => handlePaymentPress('card')}
              disabled={true}
            >
              <ShIcon
                name={IconName.CardWhite}
                size={18}
                color={colorPalette.lightText}
              />
              <ShText variant={ShTextVariant.Button} style={styles.paymentButtonText}>
                Pay with Card
              </ShText>
            </TouchableOpacity>

            {/* Pay with Apple Pay */}
            <TouchableOpacity
              style={[styles.paymentButton, styles.secondaryPaymentButton, styles.disabledButton]}
              onPress={() => handlePaymentPress('apple')}
              disabled={true}
            >
              <ShIcon
                name={IconName.Apple}
                size={14}
                color={colorPalette.lightText}
              />
              <ShText variant={ShTextVariant.Button} style={styles.secondaryButtonText}>
                Pay with Apple Pay
              </ShText>
            </TouchableOpacity>

            {/* Pay with Google Pay */}
            <TouchableOpacity
              style={[styles.paymentButton, styles.secondaryPaymentButton, styles.disabledButton]}
              onPress={() => handlePaymentPress('google')}
              disabled={true}
            >
              <ShIcon
                name={IconName.Google}
                size={20}
                color={colorPalette.lightText}
              />
              <ShText variant={ShTextVariant.Button} style={styles.secondaryButtonText}>
                Pay with Google Pay
              </ShText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorPalette.baseDark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colorPalette.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: colorPalette.lightText,
  },
  backButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colorPalette.primaryGold,
    borderRadius: spacing.borderRadiusLarge,
  },
  backButtonText: {
    color: colorPalette.baseDark,
  },

  // Header styles
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(158, 155, 151, 0.2)',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colorPalette.lightText,
    fontSize: fontSizes.body,
  },

  // Content styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // Title section
  titleSection: {
    marginBottom: spacing.lg,
  },
  paymentTitle: {
    color: colorPalette.lightText,
    fontSize: fontSizes.subheading,
    fontWeight: fontWeights.medium,
    letterSpacing: -0.04,
    marginBottom: spacing.md,
  },
  requesterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requesterLabel: {
    color: colorPalette.stoneGrey,
    fontSize: fontSizes.small,
  },
  teamAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  teamAvatarPlaceholder: {
    backgroundColor: 'rgba(158, 155, 151, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamName: {
    color: colorPalette.stoneGrey,
    fontSize: fontSizes.small,
    flex: 1,
  },

  // Due date banner
  dueDateBanner: {
    backgroundColor: 'rgba(234, 189, 34, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(234, 189, 34, 0.2)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dueDateLabel: {
    color: colorPalette.primaryGold,
    fontSize: fontSizes.body,
  },
  dueDateText: {
    color: colorPalette.primaryGold,
    fontSize: fontSizes.body,
  },

  // Description section
  descriptionSection: {
    flex: 1,
  },
  sectionTitle: {
    color: colorPalette.lightText,
    fontSize: fontSizes.subheading,
    fontWeight: fontWeights.medium,
    letterSpacing: -0.04,
  },
  descriptionText: {
    color: colorPalette.stoneGrey,
    fontSize: fontSizes.body,
    lineHeight: 24,
  },

  // Total section
  totalContainer: {
    backgroundColor: 'rgba(158, 155, 151, 0.2)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: colorPalette.lightText,
    fontSize: fontSizes.body + 2,
  },
  totalAmount: {
    color: colorPalette.lightText,
    fontSize: fontSizes.subheading,
    fontWeight: fontWeights.medium,
  },

  // Payment buttons
  paymentButtonsSection: {
    gap: 12,
  },
  paymentButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    gap: 8,
  },
  primaryPaymentButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.8)',
  },
  secondaryPaymentButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(158, 155, 151, 0.2)',
  },
  disabledButton: {
    opacity: 0.5,  // DISABLED STATE FOR STORY 3
  },
  paymentButtonText: {
    color: colorPalette.lightText,
    fontSize: fontSizes.body,
  },
  secondaryButtonText: {
    color: colorPalette.lightText,
    fontSize: fontSizes.body,
  },
});
```

## ⚠️ Critical Implementation Notes

### STORY 3 SPECIFIC:

1. ✅ Payment buttons are DISABLED (`disabled={true}`, `opacity: 0.5`)
2. ✅ NO payment processing logic - just console.log placeholder
3. ✅ Three dots menu is HIDDEN (no edit in MVP)
4. ✅ Custom header implementation (NOT Stack.Screen header)

### Component Usage:

1. ✅ Use `TouchableOpacity` for all buttons
2. ✅ Use `ShText` with correct variants
3. ✅ Use `ShIcon` with IconName enum
4. ✅ Use `Image` for team avatar (or placeholder)
5. ✅ Use `View` for containers (no ShCard)

### Styling Requirements:

1. ✅ Yellow due date banner: `rgba(234, 189, 34, 0.1)` background
2. ✅ Grey total section: `rgba(158, 155, 151, 0.2)` background
3. ✅ Blue card button: `rgba(52, 152, 219, 0.8)` (disabled)
4. ✅ Border colors: `rgba(158, 155, 151, 0.2)`

### Data Flow:

```typescript
// Route params from navigation
const { id } = useLocalSearchParams();

// API call
const detail = await paymentApi.getPaymentDetail(paymentId);

// Display data
<ShText>{paymentDetail.title}</ShText>
```

## 🔍 Testing Checklist

- [ ] Screen loads with payment ID from navigation
- [ ] Loading state displays while fetching
- [ ] Error state handles API failures
- [ ] All payment information displays correctly
- [ ] Amount formatted as £XX.XX
- [ ] Date formatted as "May 14, 2025 • 23:59"
- [ ] Payment buttons are visibly disabled
- [ ] Clicking payment buttons does nothing
- [ ] Back navigation returns to previous screen
- [ ] Three dots menu is not visible

## 📝 Notes

This is a **display-only** screen for Story 3. The actual payment processing will be implemented in Story 5 after Stripe backend integration (Story 4) is complete. The buttons are intentionally disabled to prevent confusion during testing.
