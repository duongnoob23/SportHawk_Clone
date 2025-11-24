# SupaBase Auth Session Management Fix Plan

## Problem Summary

The SportHawk MVP has critical authentication issues:

1. **Session Persistence Broken**: App doesn't restore user sessions after restart
2. **Sign Out Broken**: Sign out doesn't properly clear session or navigate correctly
3. **Navigation Guards Missing**: No proper auth checks in root layout causing routing issues

## Root Cause Analysis

### Current Architecture (Working Parts)

- ✅ **UserContext.tsx**: Properly structured with session restoration logic
- ✅ **lib/supabase.ts**: Correctly configured with AsyncStorage and AppState listener
- ✅ **hooks/useUser.ts**: Simple wrapper working as intended
- ✅ **app/(app)/\_layout.tsx**: Has auth guards for protected routes

### Issues Identified

1. **Root \_layout.tsx**: Doesn't wait for auth check before rendering navigation stack
2. **Session state synchronization**: Auth state changes don't trigger proper navigation
3. **Sign out flow**: Clears state but doesn't reset navigation properly
4. **Missing cleanup**: Auth listener subscription not properly cleaned up

## Implementation Plan

### Phase 1: Fix Root Layout Auth Checking

**File**: `/app/_layout.tsx`

#### Current Code Issue:

```typescript
// Currently just wraps with UserProvider, no auth checking
export default function RootLayout() {
  useNavigationLogger();
  return (
    <ActionSheetProvider>
      <UserProvider>
        <View style={styles.container}>
          <StatusBar style="light" />
          <Stack ... />
        </View>
      </UserProvider>
    </ActionSheetProvider>
  );
}
```

#### Fix Implementation:

```typescript
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, router } from 'expo-router';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { colorPalette } from '@cfg/colors';
import { UserProvider, useUser } from '@ctx/UserContext';
import { useNavigationLogger } from '@hks/useNavigationLogger';
import { Routes } from '@cfg/routes';
import { ShText } from '@cmp/ShText';
import { ShTextVariant } from '@cfg/typography';

const { height: screenHeight } = Dimensions.get('window');

// Create inner component that uses the hook
function RootLayoutContent() {
  const { session, authChecked, user } = useUser();

  // Handle initial auth routing
  useEffect(() => {
    if (authChecked) {
      // If no session, ensure we're on Welcome screen
      if (!session && !user) {
        router.replace(Routes.Welcome);
      }
      // If we have a verified user session, go to Home
      else if (session && user && user.email_confirmed_at) {
        // Only navigate if we're on auth screens
        const currentRoute = router.canGoBack() ? null : Routes.Welcome;
        if (currentRoute === Routes.Welcome || currentRoute === Routes.SignIn) {
          router.replace(Routes.Home);
        }
      }
    }
  }, [authChecked, session, user]);

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colorPalette.primaryGold} />
        <ShText variant={ShTextVariant.Body} style={styles.loadingText}>
          Checking authentication...
        </ShText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorPalette.baseDark,
          },
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  useNavigationLogger();

  return (
    <ActionSheetProvider>
      <UserProvider>
        <RootLayoutContent />
      </UserProvider>
    </ActionSheetProvider>
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
    backgroundColor: colorPalette.baseDark,
  },
  loadingText: {
    marginTop: 16,
    color: colorPalette.textMid,
  },
});
```

### Phase 2: Fix UserContext Sign Out

**File**: `/contexts/UserContext.tsx`

#### Issue in userSignOut function (line 227-251):

The sign out clears state but doesn't handle navigation

#### Fix Implementation:

```typescript
// Import router at the top of the file
import { router } from 'expo-router';
import { Routes } from '@cfg/routes';

// Update userSignOut function (replace lines 227-251):
async function userSignOut() {
  try {
    setLoading(true);
    logger.log('UserContext: Signing out user');

    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    // Clear all user data
    setUser(null);
    setProfile(null);
    setSession(null);

    // Clear event form store on sign out
    const { clearForm } = useEventFormStore.getState();
    clearForm();

    // Force navigation to Welcome
    router.replace(Routes.Welcome);

    logger.log('UserContext: Sign out successful');
  } catch (error: any) {
    logger.error('UserContext: Sign out error:', error);
    throw new Error(error.message || 'Sign out failed');
  } finally {
    setLoading(false);
  }
}
```

### Phase 3: Fix Auth State Listener Cleanup

**File**: `/contexts/UserContext.tsx`

#### Issue in useEffect (line 355-401):

Missing null check on cleanup

#### Fix Implementation:

```typescript
// Update the useEffect return statement (line 397-400):
return () => {
  if (authListener?.subscription) {
    authListener.subscription.unsubscribe();
  }
};
```

### Phase 4: Remove Redundant Auth Checks

**File**: `/app/index.tsx` (Welcome Screen)

#### Current Issue (lines 27-38):

Welcome screen is checking auth state which should be handled by root layout

#### Fix Implementation:

```typescript
// Remove or comment out lines 27-38
// The root layout will handle navigation to Home if user is authenticated
```

## Testing Plan

### Manual Testing Checklist

#### 1. Session Persistence Test

- [ ] Sign in with valid credentials
- [ ] Verify navigation to Home screen
- [ ] Force close the app (swipe up and remove from recent apps)
- [ ] Reopen the app
- **Expected**: User should be taken directly to Home screen without signing in

#### 2. Sign Out Test

- [ ] While signed in, navigate to Settings
- [ ] Tap Sign Out button
- **Expected**:
  - User should be navigated to Welcome screen
  - Attempting to navigate back should not show authenticated screens
  - App should remain on Welcome screen

#### 3. Sign In Flow Test

- [ ] From Welcome screen, tap "I already have an account"
- [ ] Enter valid credentials and sign in
- **Expected**: Navigate to Home screen
- [ ] Press back button
- **Expected**: Should NOT go back to Sign In screen

#### 4. App State Recovery Test

- [ ] Sign in to the app
- [ ] Put app in background (press home button)
- [ ] Wait 30 seconds
- [ ] Return to app
- **Expected**: Session should still be active, user remains signed in

#### 5. Token Refresh Test

- [ ] Sign in to the app
- [ ] Put app in background
- [ ] Return to app after 1 minute
- **Expected**: Token should auto-refresh (check logs for "AppState active" message)

### Programmatic Testing Approach

#### 1. Create Test File

**File**: `/tests/auth-session.test.ts`

```typescript
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Auth Session Management', () => {
  const testEmail = 'test@example.com';
  const testPassword = 'testPassword123';

  beforeEach(async () => {
    // Clear any existing session
    await AsyncStorage.clear();
  });

  test('Session persists in AsyncStorage after sign in', async () => {
    // Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    expect(error).toBeNull();
    expect(data.session).toBeDefined();

    // Check AsyncStorage for session
    const storedSession = await AsyncStorage.getItem('supabase.auth.token');
    expect(storedSession).toBeDefined();

    const parsedSession = JSON.parse(storedSession || '{}');
    expect(parsedSession.access_token).toBeDefined();
  });

  test('Session is restored on app start', async () => {
    // Manually store a session
    const mockSession = {
      access_token: 'mock_token',
      refresh_token: 'mock_refresh',
      expires_at: Date.now() + 3600000, // 1 hour from now
    };

    await AsyncStorage.setItem(
      'supabase.auth.token',
      JSON.stringify(mockSession)
    );

    // Get session from Supabase
    const { data } = await supabase.auth.getSession();
    expect(data.session).toBeDefined();
  });

  test('Sign out clears session from storage', async () => {
    // Sign in first
    await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    // Sign out
    await supabase.auth.signOut();

    // Check AsyncStorage is cleared
    const storedSession = await AsyncStorage.getItem('supabase.auth.token');
    expect(storedSession).toBeNull();

    // Verify no session exists
    const { data } = await supabase.auth.getSession();
    expect(data.session).toBeNull();
  });
});
```

#### 2. Integration Test with React Native Testing Library

**File**: `/tests/auth-navigation.test.tsx`

```typescript
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootLayout from '@/app/_layout';
import { supabase } from '@/lib/supabase';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
  Stack: ({ children }: any) => children,
}));

describe('Auth Navigation Flow', () => {
  test('Unauthenticated user sees Welcome screen', async () => {
    // Mock no session
    jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const { getByText } = render(
      <NavigationContainer>
        <RootLayout />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(getByText('Get Started')).toBeTruthy();
    });
  });

  test('Authenticated user is redirected to Home', async () => {
    // Mock active session
    const mockSession = {
      user: {
        id: '123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01',
      },
      access_token: 'token',
    };

    jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { router } = require('expo-router');

    render(
      <NavigationContainer>
        <RootLayout />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith(Routes.Home);
    });
  });
});
```

### Automated E2E Testing with Detox (Optional)

For comprehensive automated testing, consider setting up Detox:

```javascript
// e2e/auth-flow.e2e.js
describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should show welcome screen on first launch', async () => {
    await expect(element(by.text('Get Started'))).toBeVisible();
  });

  it('should navigate to sign in screen', async () => {
    await element(by.text('I already have an account')).tap();
    await expect(element(by.text('Sign In'))).toBeVisible();
  });

  it('should sign in and navigate to home', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.text('Sign In')).tap();

    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should maintain session after app restart', async () => {
    await device.terminateApp();
    await device.launchApp();

    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

## Risk Mitigation

### Before Implementation

1. **Create a backup branch**: `git checkout -b backup/pre-auth-fix`
2. **Test on development environment first**
3. **Have test accounts ready** with known credentials

### Potential Issues to Watch

1. **Race conditions**: Auth check might fire before session loads
   - Mitigation: Always check `authChecked` flag before routing decisions
2. **Navigation stack corruption**: Multiple rapid navigation calls
   - Mitigation: Use `replace` instead of `push` for auth routes
3. **Token expiry during use**: User gets logged out unexpectedly
   - Mitigation: AppState listener already handles token refresh

## Success Criteria

- [ ] Users remain logged in after app restart
- [ ] Sign out completely clears session and navigates to Welcome
- [ ] No navigation loops or stuck states
- [ ] Auth state changes trigger proper navigation
- [ ] No console errors related to auth or navigation

## Rollback Plan

If issues arise:

1. `git checkout backup/pre-auth-fix`
2. Deploy previous version
3. Document specific failure points for debugging

## Additional Notes for Developer

### DO NOT:

- Remove or modify the UserContext structure (it's working correctly)
- Change the supabase.ts configuration (it's properly set up)
- Modify the useUser hook (it's fine as is)
- Add complex state management (keep it simple)

### DO:

- Test each change incrementally
- Check console logs for any auth errors
- Verify AsyncStorage is working (`AsyncStorage.getAllKeys()`)
- Keep the existing AppState listener in supabase.ts
- Maintain the existing error handling in UserContext

### Debug Commands

```javascript
// Check current session in console
const session = await supabase.auth.getSession();
console.log('Current session:', session);

// Check AsyncStorage
const keys = await AsyncStorage.getAllKeys();
console.log('Storage keys:', keys);

// Check auth state
const {
  data: { user },
} = await supabase.auth.getUser();
console.log('Current user:', user);
```
