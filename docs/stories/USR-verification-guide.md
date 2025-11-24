# USR Stories - Code Verification Guide (Without Running App)

## Overview

This guide helps developers verify their code implementation is correct without running the SportHawk app. Use these techniques to catch issues early and ensure code quality.

## 1. Static Code Analysis

### TypeScript Type Checking

```bash
# Run TypeScript compiler without emitting files
npx tsc --noEmit

# Check specific story files
npx tsc --noEmit app/(auth)/ForgotPassword.tsx
npx tsc --noEmit app/(auth)/PasswordReset.tsx
npx tsc --noEmit app/user/payment-history.tsx
npx tsc --noEmit app/(app)/home.tsx
```

### ESLint Checks

```bash
# Run linting on all files
npm run lint

# Check specific directories
npx eslint app/(auth)/*.tsx
npx eslint components/ShReminders*.tsx
```

## 2. Import Verification

### Check All Imports Resolve

```typescript
// Verify these imports exist and are correctly typed
import { useUser } from '@hks/useUser';
import { Routes } from '@cfg/routes';
import { colorPalette } from '@cfg/colors';
import { spacing } from '@cfg/spacing';
import { ShTextVariant } from '@cfg/typography';
import { ShButtonVariant } from '@cfg/buttons';
import { IconName } from '@cfg/icons';
```

### Verify Component Exports

```bash
# Check that new components are exported from index
grep -r "export.*ShRemindersSection" components/index.ts
grep -r "export.*ShReminderCard" components/index.ts
```

## 3. Component Structure Validation

### USR-001: Password Forgot Enhancement

```bash
# Verify existing file structure
test -f app/(auth)/ForgotPassword.tsx && echo "✅ File exists" || echo "❌ File missing"

# Check for required imports
grep -q "IconName.Mail" app/(auth)/ForgotPassword.tsx && echo "✅ Mail icon" || echo "❌ Missing icon"
grep -q "IconName.Key" app/(auth)/ForgotPassword.tsx && echo "✅ Key icon" || echo "❌ Missing icon"

# Verify success message update
grep -q "Reset Password Triggered" app/(auth)/ForgotPassword.tsx && echo "✅ Title updated" || echo "⚠️ Title needs update"
```

### USR-002: Password Reset (New Implementation)

```typescript
// Verify deep link configuration in app.json
cat app.json | jq '.expo.scheme' # Should output: "sporthawk"

// Check for password validation constant
grep -r "PASSWORD_MIN_LENGTH" --include="*.ts" --include="*.tsx" .

// Verify userResetPassword signature
grep -A 5 "userResetPassword" contexts/UserContext.tsx
```

### USR-003: Payment History

```bash
# Verify store exists
test -f stores/paymentHistoryStore.ts && echo "✅ Store exists" || echo "❌ Store missing"

# Check for Android TODO
grep -n "TODO.*Android" app/user/payment-history.tsx

# Verify component structure
ast-grep --pattern 'function PaymentHistoryScreen() { $$$ }'
```

### USR-004: Home Reminders

```bash
# Check profile photo field usage
grep -r "profile_photo_uri" app/(app)/home.tsx

# Verify component creation
test -f components/ShRemindersSection/index.tsx && echo "✅ Component created" || echo "⚠️ Need to create"
test -f components/ShReminderCard/index.tsx && echo "✅ Component created" || echo "⚠️ Need to create"
```

## 4. API Contract Validation

### Check Supabase Function Signatures

```typescript
// contexts/UserContext.tsx - Verify these function signatures
interface UserContextType {
  userForgotPassword: (email: string) => Promise<void>;
  userResetPassword: (newPassword: string) => Promise<void>; // ⚠️ No token param?
}

// Verify Supabase client usage
// Should see patterns like:
supabase.auth.resetPasswordForEmail(email);
supabase.auth.updateUser({ password: newPassword });
```

### Payment Data Structure Validation

```typescript
// Create a type check file: verify-types.ts
import { PaymentTransaction } from '@types/payment';

// This will fail at compile time if types don't match
const samplePayment: PaymentTransaction = {
  id: 'test',
  created_at: '2024-01-01T00:00:00Z',
  amount: 12000, // Verify: cents or pounds?
  currency: 'GBP',
  description: 'Team payment',
  status: 'completed',
  payment_method: '****1234',
  team_name: 'Test Team',
  payment_title: 'Monthly dues',
};

// Run: npx tsc verify-types.ts --noEmit
```

## 5. Navigation Route Verification

```bash
# Check all routes exist
grep -E "Routes\.(ForgotPassword|SignIn|EditProfile|PaymentHistory)" cfg/routes.ts

# Verify navigation patterns
ast-grep --pattern 'router.push(Routes.$_)'
ast-grep --pattern 'router.replace(Routes.$_)'
```

## 6. Style Consistency Checks

```typescript
// Verify color palette usage (no hardcoded colors)
// BAD: backgroundColor: '#161615'
// GOOD: backgroundColor: colorPalette.baseDark

# Find hardcoded colors
grep -r "#[0-9a-fA-F]\{6\}" --include="*.tsx" app/

# Find hardcoded spacing
grep -r "padding: [0-9]" --include="*.tsx" app/
grep -r "margin: [0-9]" --include="*.tsx" app/

# Should use spacing constants
grep -r "spacing\." --include="*.tsx" app/ | head -5
```

## 7. Component Props Validation

```typescript
// Create props validation file
// test-props.tsx
import React from 'react';
import { ShButton } from '@cmp/index';
import { ShButtonVariant } from '@cfg/buttons';

// This will fail TypeScript if props are wrong
const TestComponents = () => (
  <>
    <ShButton
      title="Test"
      variant={ShButtonVariant.Primary}
      onPress={() => {}}
      loading={false}
      disabled={false}
    />
  </>
);
```

## 8. Mock Data Testing

```typescript
// Create mock test file: mock-reminders.ts
const mockProfile = {
  profile_photo_uri: null, // Test reminder shows
};

const mockProfileWithPhoto = {
  profile_photo_uri: 'https://example.com/photo.jpg', // Test reminder hidden
};

// Logic test
const shouldShowReminder = !mockProfile?.profile_photo_uri;
console.assert(
  shouldShowReminder === true,
  'Should show reminder when no photo'
);

const shouldHideReminder = !mockProfileWithPhoto?.profile_photo_uri;
console.assert(
  shouldHideReminder === false,
  'Should hide reminder when photo exists'
);
```

## 9. Automated Checks Script

Create `verify-usr-stories.sh`:

```bash
#!/bin/bash

echo "🔍 Verifying USR Stories Implementation..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# USR-001 Checks
echo -e "\n📋 USR-001: Password Forgot"
if [ -f "app/(auth)/ForgotPassword.tsx" ]; then
    echo -e "${GREEN}✅ File exists${NC}"

    # Check for required updates
    if grep -q "Reset Password Triggered" "app/(auth)/ForgotPassword.tsx"; then
        echo -e "${GREEN}✅ Success title updated${NC}"
    else
        echo -e "${YELLOW}⚠️  Success title needs update${NC}"
    fi
else
    echo -e "${RED}❌ File missing${NC}"
fi

# USR-002 Checks
echo -e "\n📋 USR-002: Password Reset"
if [ -f "app/(auth)/PasswordReset.tsx" ]; then
    echo -e "${GREEN}✅ File exists${NC}"
else
    echo -e "${YELLOW}⚠️  File needs creation${NC}"
fi

# Check deep linking
if grep -q '"scheme":' app.json; then
    echo -e "${GREEN}✅ Deep link scheme configured${NC}"
else
    echo -e "${RED}❌ Deep link scheme missing${NC}"
fi

# USR-003 Checks
echo -e "\n📋 USR-003: Payment History"
if [ -f "app/user/payment-history.tsx" ]; then
    echo -e "${GREEN}✅ Payment history exists${NC}"

    # Check for Android TODO
    if grep -q "TODO.*Android" "app/user/payment-history.tsx"; then
        echo -e "${YELLOW}⚠️  Android implementation pending${NC}"
    fi
else
    echo -e "${RED}❌ Payment history missing${NC}"
fi

# USR-004 Checks
echo -e "\n📋 USR-004: Home Reminders"
if [ -f "components/ShRemindersSection/index.tsx" ]; then
    echo -e "${GREEN}✅ Reminders section created${NC}"
else
    echo -e "${YELLOW}⚠️  Reminders section needs creation${NC}"
fi

# Type checking
echo -e "\n🔧 Running TypeScript checks..."
npx tsc --noEmit 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
else
    echo -e "${RED}❌ TypeScript errors found${NC}"
fi

# Linting
echo -e "\n🔧 Running ESLint..."
npm run lint --silent 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ ESLint passed${NC}"
else
    echo -e "${YELLOW}⚠️  ESLint warnings/errors${NC}"
fi

echo -e "\n✨ Verification complete!"
```

## 10. Pre-commit Checklist

Before committing USR story implementation:

```bash
# 1. Type checking passes
npx tsc --noEmit

# 2. Linting passes
npm run lint

# 3. No hardcoded values
! grep -r "#[0-9a-fA-F]\{6\}" --include="*.tsx" app/ # No hex colors
! grep -r "padding: [0-9]" --include="*.tsx" app/    # No hardcoded spacing

# 4. All imports resolve
npx tsc --noEmit --listFiles | grep -E "(ShReminders|PasswordReset)"

# 5. Component exports added
grep "ShRemindersSection" components/index.ts
grep "ShReminderCard" components/index.ts

# 6. No console.logs left
! grep -r "console.log" --include="*.tsx" app/

# 7. Tests exist (if applicable)
test -f __tests__/auth/PasswordReset.test.tsx
test -f __tests__/components/ShRemindersSection.test.tsx
```

## Common Issues to Check

### 1. Async/Await Patterns

```typescript
// ❌ BAD: Missing error handling
const handleSubmit = async () => {
  await userForgotPassword(email);
};

// ✅ GOOD: Proper error handling
const handleSubmit = async () => {
  try {
    await userForgotPassword(email);
  } catch (error) {
    // Handle error
  }
};
```

### 2. Navigation Guards

```typescript
// Check for navigation before component unmounts
useEffect(() => {
  return () => {
    // Cleanup navigation listeners
  };
}, []);
```

### 3. Memory Leaks

```typescript
// Check all setTimeout/setInterval have cleanup
useEffect(() => {
  const timer = setTimeout(() => {}, 1000);
  return () => clearTimeout(timer); // ✅ Cleanup
}, []);
```

### 4. Conditional Rendering

```typescript
// Verify all conditions are safe
{profile?.profile_photo_uri && <Component />}  // ✅ Safe
{profile.profile_photo_uri && <Component />}   // ❌ Can crash
```

## Summary

Run this verification sequence:

1. `npx tsc --noEmit` - Type checking
2. `npm run lint` - Code quality
3. `./verify-usr-stories.sh` - Story-specific checks
4. Review the checklist above
5. Check for hardcoded values
6. Verify all imports resolve

If all checks pass, your code is likely correct and ready for testing when the app can be run.
