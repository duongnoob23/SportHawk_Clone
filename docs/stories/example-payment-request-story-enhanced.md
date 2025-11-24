# User Story: PAY-001 - Create Payment Request

**Epic:** Payments Core  
**Sprint:** 14  
**Status:** Ready for Development  
**Story Points:** 5  
**Developer Assigned:** TBD  
**Reference Implementation:** `/app/events/create-event.tsx`

## Story Overview

**As a** team admin  
**I want to** create payment requests for team members  
**So that** I can collect fees for events, memberships, and equipment

## Figma Design References

| Screen              | Figma Node ID | Design Doc               | Reference Implementation     |
| ------------------- | ------------- | ------------------------ | ---------------------------- |
| Create Payment Form | 559-3204      | /docs/design-payments.md | /app/events/create-event.tsx |
| Member Selection    | 559-3205      | /docs/design-payments.md | /app/events/edit-members.tsx |

## 🎯 Figma-to-Component Mapping

### Screen: Create Payment Request (Node: 559-3204)

**Reference Implementation:** `/app/events/create-event.tsx`  
**Copy Pattern From:** `/app/events/create-event.tsx` - lines 1-350 for structure

#### Component Mapping Table

| Figma Element                     | SportHawk Component    | Props to Use                                                                           | Common Mistakes to Avoid                                                                                                                      |
| --------------------------------- | ---------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| "Title \*" field                  | `ShFormFieldText`      | `label="Title"`, `required`, `value`, `onChangeText`                                   | ❌ Using `onChange` instead of `onChangeText`<br>❌ Adding asterisk manually to label                                                         |
| "Due by \*" (shows date AND time) | `ShFormFieldDateTime`  | `label="Due by"`, `required`, `value`, `onChange`, `minimumDate={new Date()}`          | ❌ Using `ShFormFieldDate` (missing time)<br>❌ Using `onDateChange` or `onChangeDate`<br>❌ Using `undefined` instead of `null` for empty    |
| "Amount \*" (£ symbol)            | `ShPaymentAmountInput` | `label="Amount"`, `required`, `value`, `onChangeValue`, `minimumAmount={100}`          | ❌ Using `onChange`<br>❌ Not tracking touched state before showing error<br>❌ Using wrong text color (`textPrimary` instead of `textLight`) |
| "Type \*" (Required/Optional)     | `ShFormFieldChoice`    | `label="Type"`, `required`, `options`, `value`, `onChangeValue`                        | ❌ Using `selectedValue` and `onValueChange`<br>❌ Wrong option structure                                                                     |
| "Members (0)" navigation          | `ShNavItem`            | `label="Members (0)"`, `subtitle="Select team members"`, `onPress`, `showDropdownIcon` | ❌ Using `ShFormFieldSelect`<br>❌ Not updating count after selection<br>❌ Clearing form when navigating                                     |
| "Notes" multiline                 | `ShFormFieldTextArea`  | `label="Notes"`, `value`, `onChangeText`, `numberOfLines={4}`                          | ❌ Using `ShFormFieldText` with multiline<br>❌ Using `onChange`                                                                              |

#### Navigation & Structure Requirements

```typescript
// EXACT structure to copy from /app/events/create-event.tsx
return (
  <>
    <Stack.Screen
      options={{
        headerShown: true,  // MANDATORY
        title: 'Create Request',
        headerStyle: {
          backgroundColor: colorPalette.baseDark,  // NOT black
        },
        headerTintColor: colorPalette.lightText,  // NOT white
        headerTitleStyle: {
          fontWeight: fontWeights.regular,
          fontSize: fontSizes.body,
        },
        headerRight: () => (
          <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
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
      <ShScreenContainer>
        {/* Form content */}
      </ShScreenContainer>
    </SafeAreaView>
  </>
);
```

#### State Management Requirements

```typescript
// COPY EXACTLY from create-event.tsx
const [formData, setFormData] = useState<PaymentFormData>({
  title: '',
  dueDate: null,
  amountPence: 0,
  paymentType: 'required',
  selectedMembers: [],
  notes: '',
});
const [loading, setLoading] = useState(true); // MUST start true!
const [submitting, setSubmitting] = useState(false);
const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
const isNavigatingToSelection = useRef(false);

// CRITICAL: Lifecycle management
useEffect(() => {
  clearForm();
  initializeForm();

  return () => {
    if (!isNavigatingToSelection.current) {
      clearForm();
    }
    isNavigatingToSelection.current = false;
  };
}, [params.teamId]);

// Field update with touch tracking
const updateField = (field: string, value: any) => {
  setTouchedFields(prev => new Set(prev).add(field));
  setFormData(prev => ({ ...prev, [field]: value }));
};
```

#### Validation Pattern

```typescript
// MUST show errors only after touch
<ShPaymentAmountInput
  label="Amount"
  required
  value={formData.amountPence || 0}
  onChangeValue={(pence) => {
    setTouchedFields(prev => new Set(prev).add('amount'));
    updateField('amountPence', pence);
  }}
  error={touchedFields.has('amount') && !!getValidationErrors().amount}
  errorMessage={touchedFields.has('amount') ? getValidationErrors().amount : undefined}
/>
```

### Sub-Screen: Member Selection (Node: 559-3205)

**Copy Exactly From:** `/app/events/edit-members.tsx`

#### Critical Requirements

- [x] `headerShown: true` with title "Select Members"
- [x] Back navigation (automatic with Stack)
- [x] Header right: "Select All/Deselect All" toggle
- [x] Footer with "{count} selected" and Done button
- [x] Search bar with "Members" label above it (was missing!)
- [x] Set `isNavigatingToSelection.current = true` before navigation

#### Specific Fixes Needed

```typescript
// In main form before navigating
const handleSelectMembers = () => {
  isNavigatingToSelection.current = true;  // CRITICAL!
  router.push({
    pathname: Routes.PaymentEditMembers,
    params: { /* ... */ }
  });
};

// In edit-members.tsx - complete navigation
<Stack.Screen
  options={{
    headerShown: true,  // WAS MISSING!
    title: 'Select Members',
    headerBackTitle: '',
    headerStyle: {
      backgroundColor: colorPalette.baseDark,
    },
    headerTintColor: colorPalette.lightText,
    headerRight: () => (
      <TouchableOpacity onPress={handleSelectAll}>
        <ShText variant={ShTextVariant.Body} style={{ color: colorPalette.primaryGold }}>
          {allSelected ? 'Deselect All' : 'Select All'}
        </ShText>
      </TouchableOpacity>
    ),
  }}
/>

// Add "Members" label above search
<ShText variant={ShTextVariant.SectionTitle} style={styles.searchLabel}>
  Members
</ShText>
<View style={styles.searchBar}>
  {/* Search implementation */}
</View>
```

## Acceptance Criteria

### Functional Requirements

- [x] Title field - required, text input
- [x] Due by - required, shows both date AND time pickers
- [x] Amount - required, minimum £1.00, shows currency symbol
- [x] Type - required, two options (Required/Optional)
- [x] Members - navigates to selection, shows count
- [x] Notes - optional, multiline text
- [x] Form clears on entry from menu
- [x] Form preserves data when selecting members
- [x] Submit creates payment request in database

### UI/UX Requirements

- [x] Matches Figma design exactly
- [x] Amount field text is readable (uses `textLight`)
- [x] Validation errors appear ONLY after user interaction
- [x] No errors shown on initial form load
- [x] All sub-screens have navigation headers
- [x] Member selection has footer with Done button

## Implementation Checklist

### Pre-Development

- [ ] Open `/app/events/create-event.tsx` in split view
- [ ] Open `/app/events/edit-members.tsx` for sub-screen reference
- [ ] Review `/docs/architecture/component-interfaces.md`
- [ ] Check exact prop names for each component

### Critical Checks

- [ ] `ShFormFieldDateTime` for "Due by" (NOT `ShFormFieldDate`)
- [ ] `onChange` for DateTime (NOT `onDateChange`)
- [ ] `onChangeText` for text fields (NOT `onChange`)
- [ ] `onChangeValue` for Choice and Amount (NOT `onValueChange`)
- [ ] `value` prop for Choice (NOT `selectedValue`)
- [ ] `touchedFields` implemented for validation
- [ ] `isNavigatingToSelection` ref for preserving form
- [ ] `headerShown: true` on ALL screens
- [ ] Colors: `baseDark`, `lightText`, `textLight` for inputs

## Common Mistakes That Were Made (DO NOT REPEAT)

1. ✅ FIXED: Used wrong prop names (`selectedValue`/`onValueChange` instead of `value`/`onChangeValue`)
2. ✅ FIXED: Used `ShFormFieldDate` instead of `ShFormFieldDateTime`
3. ✅ FIXED: Form didn't clear on mount/unmount properly
4. ✅ FIXED: Validation errors showed immediately on load
5. ✅ FIXED: Sub-screen had no navigation (missing `headerShown: true`)
6. ✅ FIXED: Amount field text was unreadable (used `textPrimary` instead of `textLight`)
7. ✅ FIXED: Missing "Members" label above search field

---

**Story Prepared By:** Sarah (Product Owner)  
**Date:** 2025-09-03  
**Version:** 2.0 (Enhanced with Figma mapping)

## Developer Sign-off

- [ ] I have read the entire story
- [ ] I have the reference files open
- [ ] I understand which components to use
- [ ] I will check prop names before using
- [ ] I will implement touchedFields validation
- [ ] I will test navigation thoroughly
