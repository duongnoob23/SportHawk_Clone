# Figma-to-Code Translation Layer: PAY-002 Payment List

**Story:** PAY-002 - View Payment List with Filter  
**Figma Node:** 559-3087  
**Target File:** `/app/(app)/teams.tsx` lines 607-630

## 📸 Figma Design Analysis

### Visual Elements Identified:

1. **Yellow Alert Banner** - "Action Required" with payment count
2. **Section Header** - "Upcoming Payments" with "This Week" dropdown
3. **Payment Cards** - Multiple payment items in list
4. **Payment Card Elements**:
   - Payment Title (white text)
   - Team Type (grey subtext)
   - Amount badge (£120.00 in grey pill)
   - Alert icon (yellow warning for required)
   - Date/Time row with icons
   - "Pay Now" blue button

## 🎯 EXACT Component Mapping

### 1. Alert Banner (Yellow "Action Required")

| Figma Element     | SportHawk Implementation | Exact Props                                                                    | ❌ DON'T Use             |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------ | ------------------------ |
| Yellow container  | `View`                   | `style={styles.actionBanner}`                                                  | ❌ ShAlert, ShBanner     |
| Warning icon      | `ShIcon`                 | `name={IconName.Alert}`, `size={16}`, `color={colorPalette.primaryGold}`       | ❌ IconName.Warning      |
| "Action Required" | `ShText`                 | `variant={ShTextVariant.Body}`, `style={{ color: colorPalette.primaryGold }}`  | ❌ ShTextVariant.Label   |
| "1 payment"       | `ShText`                 | `variant={ShTextVariant.Small}`, `style={{ color: colorPalette.primaryGold }}` | ❌ ShTextVariant.Caption |
| Description text  | `ShText`                 | `variant={ShTextVariant.Small}`, `style={{ color: 'rgba(234,189,34,0.8)' }}`   | ❌ Body variant          |

### 2. Section Header

| Figma Element        | SportHawk Implementation                 | Exact Props                                                                       | ❌ DON'T Use            |
| -------------------- | ---------------------------------------- | --------------------------------------------------------------------------------- | ----------------------- |
| "Upcoming Payments"  | `ShText`                                 | `variant={ShTextVariant.SubHeading}`, `style={{ color: colorPalette.lightText }}` | ❌ Heading variant      |
| "This Week" dropdown | `TouchableOpacity` + `ShText` + `ShIcon` | See dropdown pattern below                                                        | ❌ ShDropdown, ShSelect |
| Dropdown arrow       | `ShIcon`                                 | `name={IconName.ChevronDown}`, `size={14}`, `color={colorPalette.stoneGrey}`      | ❌ DownArrow            |

### 3. Payment Card Container

| Figma Element   | SportHawk Implementation    | Exact Props                                                  | ❌ DON'T Use          |
| --------------- | --------------------------- | ------------------------------------------------------------ | --------------------- |
| Card background | `TouchableOpacity` + `View` | `style={styles.paymentCard}`, `onPress={handlePaymentPress}` | ❌ ShCard component   |
| Card border     | Style only                  | `borderColor: 'rgba(158,155,151,0.2)'`, `borderWidth: 1`     | ❌ ShBorder component |
| Card padding    | Style only                  | `padding: 20`                                                | ❌ Magic numbers      |

### 4. Payment Card Content

| Figma Element   | SportHawk Implementation      | Exact Props                                                                                      | ❌ DON'T Use                  |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------- |
| "Payment Title" | `ShText`                      | `variant={ShTextVariant.Body}`, `style={{ color: colorPalette.lightText }}`, `numberOfLines={1}` | ❌ textPrimary color          |
| "Team Type"     | `ShText`                      | `variant={ShTextVariant.Small}`, `style={{ color: colorPalette.stoneGrey }}`                     | ❌ Caption variant            |
| Amount badge    | `View` + `ShText`             | See amount badge pattern below                                                                   | ❌ ShBadge                    |
| Alert icon      | `ShIcon`                      | `name={IconName.Alert}`, `size={16}`, `color={colorPalette.primaryGold}`                         | ❌ Only for required payments |
| Date row        | `View` with flexDirection row | `style={styles.dateRow}`                                                                         | ❌ ShRow component            |
| Calendar icon   | `ShIcon`                      | `name={IconName.CalendarOutline}`, `size={14}`, `color={colorPalette.stoneGrey}`                 | ❌ Calendar (without Outline) |
| Date text       | `ShText`                      | `variant={ShTextVariant.Body}`, `style={{ color: colorPalette.stoneGrey }}`                      | ❌ Small variant              |
| Clock icon      | `ShIcon`                      | `name={IconName.Clock}`, `size={14}`, `color={colorPalette.stoneGrey}`                           | ❌ Time icon                  |
| Time text       | `ShText`                      | `variant={ShTextVariant.Body}`, `style={{ color: colorPalette.stoneGrey }}`                      | ❌ Small variant              |

### 5. Pay Now Button

| Figma Element     | SportHawk Implementation      | Exact Props                                                    | ❌ DON'T Use            |
| ----------------- | ----------------------------- | -------------------------------------------------------------- | ----------------------- |
| Blue button       | `TouchableOpacity` + `ShText` | `style={styles.payButton}`                                     | ❌ ShButton component   |
| Button text       | `ShText`                      | `variant={ShTextVariant.Button}`, `style={{ color: 'white' }}` | ❌ ButtonText variant   |
| Button background | Style only                    | `backgroundColor: 'rgba(52,152,219,0.8)'`                      | ❌ colorPalette.primary |

## 💻 Complete Implementation Code

```typescript
// In teams.tsx, replace lines 607-630:

{activeTab === 'payments' && (
  <>
    {/* Loading State */}
    {loadingPayments && (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colorPalette.primaryGold} />
      </View>
    )}

    {/* Loaded State */}
    {!loadingPayments && (
      <>
        {/* Action Required Banner - Only show if have required unpaid */}
        {requiredUnpaidCount > 0 && (
          <View style={styles.actionBanner}>
            <View style={styles.actionBannerHeader}>
              <View style={styles.actionBannerLeft}>
                <ShIcon
                  name={IconName.Alert}
                  size={16}
                  color={colorPalette.primaryGold}
                />
                <ShText
                  variant={ShTextVariant.Body}
                  style={styles.actionBannerTitle}
                >
                  Action Required
                </ShText>
              </View>
              <ShText
                variant={ShTextVariant.Small}
                style={styles.actionBannerCount}
              >
                {requiredUnpaidCount} payment{requiredUnpaidCount > 1 ? 's' : ''}
              </ShText>
            </View>
            <ShText
              variant={ShTextVariant.Small}
              style={styles.actionBannerText}
            >
              Please ensure all required payments are met. Contact team admins if you need support
            </ShText>
          </View>
        )}

        {/* Section Header */}
        <View style={styles.paymentSectionHeader}>
          <ShText variant={ShTextVariant.SubHeading} style={styles.paymentSectionTitle}>
            Upcoming Payments
          </ShText>

          <TouchableOpacity
            style={styles.weekFilter}
            onPress={() => setTimeFilter(timeFilter === 'week' ? 'all' : 'week')}
          >
            <ShText variant={ShTextVariant.Body} style={styles.weekFilterText}>
              {timeFilter === 'week' ? 'This Week' : 'All Time'}
            </ShText>
            <ShIcon
              name={IconName.ChevronDown}
              size={14}
              color={colorPalette.stoneGrey}
            />
          </TouchableOpacity>
        </View>

        {/* Payment List */}
        {filteredPayments.length === 0 ? (
          <View style={styles.emptyTabContent}>
            <ShIcon
              name={IconName.CardWhite}
              size={spacing.iconSizeXLarge}
              color={colorPalette.primaryGold}
            />
            <ShSpacer size={spacing.lg} />
            <ShText variant={ShTextVariant.Heading} style={styles.centerText}>
              No payment requests
            </ShText>
            <ShSpacer size={spacing.md} />
            <ShText variant={ShTextVariant.EmptyState} style={styles.centerText}>
              You don't have any pending payment requests
            </ShText>
          </View>
        ) : (
          <ScrollView style={styles.paymentList} showsVerticalScrollIndicator={false}>
            {filteredPayments.map((payment) => (
              <TouchableOpacity
                key={payment.id}
                style={styles.paymentCard}
                onPress={() => handlePaymentPress(payment.id)}
                activeOpacity={0.7}
              >
                {/* Payment Header */}
                <View style={styles.paymentCardHeader}>
                  <View style={styles.paymentCardInfo}>
                    <ShText
                      variant={ShTextVariant.Body}
                      style={styles.paymentTitle}
                      numberOfLines={1}
                    >
                      {payment.title}
                    </ShText>
                    <ShText
                      variant={ShTextVariant.Small}
                      style={styles.paymentTeam}
                    >
                      {payment.teamName}
                    </ShText>
                  </View>

                  <View style={styles.paymentCardRight}>
                    <View style={styles.amountBadge}>
                      <ShText
                        variant={ShTextVariant.Body}
                        style={styles.amountText}
                      >
                        £{(payment.amountPence / 100).toFixed(2)}
                      </ShText>
                    </View>
                    {payment.paymentType === 'required' && (
                      <ShIcon
                        name={IconName.Alert}
                        size={16}
                        color={colorPalette.primaryGold}
                      />
                    )}
                  </View>
                </View>

                {/* Date/Time Row */}
                <View style={styles.paymentDateRow}>
                  <ShIcon
                    name={IconName.CalendarOutline}
                    size={14}
                    color={colorPalette.stoneGrey}
                  />
                  <ShText
                    variant={ShTextVariant.Body}
                    style={styles.paymentDate}
                  >
                    {formatPaymentDate(payment.dueDate)}
                  </ShText>
                  <ShIcon
                    name={IconName.Clock}
                    size={14}
                    color={colorPalette.stoneGrey}
                  />
                  <ShText
                    variant={ShTextVariant.Body}
                    style={styles.paymentTime}
                  >
                    {formatPaymentTime(payment.dueDate)}
                  </ShText>
                </View>

                {/* Pay Now Button */}
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handlePayNow(payment.id);
                  }}
                >
                  <ShText
                    variant={ShTextVariant.Button}
                    style={styles.payButtonText}
                  >
                    Pay Now
                  </ShText>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </>
    )}
  </>
)}
```

## 🎨 Required Styles

```typescript
// Add to StyleSheet.create in teams.tsx:

actionBanner: {
  backgroundColor: 'rgba(234,189,34,0.1)',
  borderWidth: 1,
  borderColor: 'rgba(234,189,34,0.2)',
  borderRadius: 16,
  padding: 16,
  marginHorizontal: 20,
  marginBottom: 24,
},
actionBannerHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},
actionBannerLeft: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},
actionBannerTitle: {
  color: colorPalette.primaryGold,
},
actionBannerCount: {
  color: colorPalette.primaryGold,
},
actionBannerText: {
  color: 'rgba(234,189,34,0.8)',
  lineHeight: 18,
},
paymentSectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  marginBottom: 12,
},
paymentSectionTitle: {
  color: colorPalette.lightText,
  letterSpacing: -0.04,
},
weekFilter: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
weekFilterText: {
  color: colorPalette.stoneGrey,
},
paymentList: {
  flex: 1,
  paddingHorizontal: 20,
},
paymentCard: {
  backgroundColor: 'rgba(0,0,0,0.3)',
  borderWidth: 1,
  borderColor: 'rgba(158,155,151,0.2)',
  borderRadius: 16,
  padding: 20,
  marginBottom: 12,
  gap: 12,
},
paymentCardHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
},
paymentCardInfo: {
  flex: 1,
  gap: 6,
},
paymentTitle: {
  color: colorPalette.lightText,
  fontSize: 18,
},
paymentTeam: {
  color: colorPalette.stoneGrey,
},
paymentCardRight: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},
amountBadge: {
  backgroundColor: 'rgba(158,155,151,0.2)',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
},
amountText: {
  color: colorPalette.lightText,
},
paymentDateRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
paymentDate: {
  color: colorPalette.stoneGrey,
  marginRight: 8,
},
paymentTime: {
  color: colorPalette.stoneGrey,
},
payButton: {
  backgroundColor: 'rgba(52,152,219,0.8)',
  borderRadius: 12,
  paddingVertical: 10,
  alignItems: 'center',
  marginTop: 4,
},
payButtonText: {
  color: 'white',
  fontSize: 16,
},
```

## ⚠️ Critical Implementation Notes

### MUST DO:

1. Use `TouchableOpacity` for ALL interactive elements (cards, buttons, filters)
2. Use `ShText` with correct `variant` prop for ALL text
3. Use `ShIcon` with `IconName` enum values
4. Use `colorPalette` constants for standard colors
5. Use exact rgba values from Figma for special colors

### MUST NOT DO:

1. ❌ Don't use `ShButton` - use TouchableOpacity + ShText
2. ❌ Don't use `ShCard` - use View with styles
3. ❌ Don't use `ShBadge` - use View + ShText
4. ❌ Don't use hex colors - use colorPalette or rgba
5. ❌ Don't use `onChange` for text - use `onChangeText`
6. ❌ Don't create new component files

## 🔍 Testing Checklist

- [ ] Alert banner only shows when required payments exist
- [ ] Payment cards are fully tappable
- [ ] Pay Now button works independently of card tap
- [ ] Amount shows with £ and 2 decimal places
- [ ] Date/time formatted correctly
- [ ] Alert icon only on required payments
- [ ] Empty state shows when no payments
- [ ] Week filter toggles between "This Week" and "All Time"
- [ ] Styles match Figma exactly
