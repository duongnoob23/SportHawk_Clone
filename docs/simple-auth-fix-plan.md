# Simple Auth Fix Plan - Minimal & Safe Approach

## Philosophy

Keep it simple. Don't overthink. Use what works. Add safety valves.

## The Core Problem

1. Session restoration doesn't work → users have to sign in every time
2. Sign out doesn't work → users stuck in authenticated state
3. Risk: Previous fix attempts created infinite loading spinners

## The Working Example (expo-push-supa)

```typescript
// This WORKS - it's simple and proven
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });
}, []);
```

## The Minimal Fix (3 Small Changes)

### Change 1: Add Timeout Protection to UserContext

**File**: `/contexts/UserContext.tsx`
**Line**: ~371 (in the useEffect)

```typescript
// REPLACE the existing useEffect (lines 356-401) with:
useEffect(() => {
  let mounted = true;

  // SAFETY: Set authChecked after timeout to prevent infinite loading
  const timeoutId = setTimeout(() => {
    if (mounted && !authChecked) {
      console.warn('Auth check timed out after 5 seconds');
      setAuthChecked(true); // Fail safe - assume no session
    }
  }, 5000); // 5 second timeout

  // Get initial session
  supabase.auth
    .getSession()
    .then(({ data: { session: currentSession }, error }) => {
      if (!mounted) return;

      if (error) {
        console.error('Error getting session:', error);
        setAuthChecked(true); // Even on error, mark as checked
        return;
      }

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);

        // Fetch profile data
        fetchProfile(currentSession.user.id).then(profileData => {
          if (mounted && profileData) {
            setProfile(profileData);
          }
        });
      }

      setAuthChecked(true);
      clearTimeout(timeoutId); // Clear timeout if we finish early
    });

  // Listen for auth state changes
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (_event, currentSession) => {
      if (!mounted) return;

      console.log('Auth state changed:', _event);

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);

        // Fetch/update profile data
        const profileData = await fetchProfile(currentSession.user.id);
        if (mounted && profileData) {
          setProfile(profileData);
        }
      } else {
        // User signed out or no session
        setUser(null);
        setProfile(null);
        setSession(null);
      }
    }
  );

  // Cleanup
  return () => {
    mounted = false;
    clearTimeout(timeoutId);
    if (authListener?.subscription) {
      authListener.subscription.unsubscribe();
    }
  };
}, [fetchProfile]);
```

### Change 2: Fix Sign Out Navigation

**File**: `/contexts/UserContext.tsx`  
**Line**: ~227 (userSignOut function)

**DO NOT** import router or add navigation here. Keep it simple.

Just ensure the function properly clears state:

```typescript
async function userSignOut() {
  try {
    setLoading(true);
    logger.log('UserContext: Signing out user');

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      // Continue anyway - clear local state
    }

    // Clear all user data IMMEDIATELY
    setUser(null);
    setProfile(null);
    setSession(null);

    // Clear event form store
    try {
      const { clearForm } = useEventFormStore.getState();
      clearForm();
    } catch (e) {
      // Don't let store errors block sign out
      console.error('Error clearing form store:', e);
    }

    logger.log('UserContext: Sign out completed');
  } catch (error: any) {
    logger.error('UserContext: Sign out error:', error);
    // Still clear local state even if supabase fails
    setUser(null);
    setProfile(null);
    setSession(null);
  } finally {
    setLoading(false);
  }
}
```

### Change 3: Simplify Root Layout

**File**: `/app/_layout.tsx`

**KEEP IT AS IS** - Don't add complex auth checking here. The current simple wrapper is fine:

```typescript
// This is FINE - don't overcomplicate it
export default function RootLayout() {
  useNavigationLogger();

  return (
    <ActionSheetProvider>
      <UserProvider>
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
      </UserProvider>
    </ActionSheetProvider>
  );
}
```

Let individual screens handle their own auth requirements (they already do this).

## That's It!

### What This Fixes

✅ Session persistence (proper session restoration on mount)
✅ Sign out (clears state even if API fails)  
✅ No infinite loading (5-second timeout failsafe)
✅ No navigation conflicts (screens handle their own routing)

### What We're NOT Changing

- ❌ No changes to `lib/supabase.ts` (it's correct)
- ❌ No changes to `useUser.ts` (it's fine)
- ❌ No complex navigation logic in root layout
- ❌ No new dependencies or libraries

## Testing Instructions

### Test 1: Session Persistence

1. Sign in with test account
2. Close app completely (swipe away)
3. Reopen app
4. **Should see**: Home screen (not Welcome)

### Test 2: Sign Out

1. From Home, go to Settings
2. Tap Sign Out
3. **Should see**: Welcome screen
4. Try to go back
5. **Should not**: Return to authenticated screens

### Test 3: Timeout Protection

1. Turn on Airplane Mode
2. Close and reopen app
3. Wait 5 seconds
4. **Should see**: Welcome screen (not infinite spinner)

### Test 4: Network Recovery

1. Sign in successfully
2. Turn on Airplane Mode
3. Close and reopen app
4. **Should**: Show Welcome after 5 seconds
5. Turn off Airplane Mode
6. Sign in again
7. **Should**: Work normally

## Debug Helpers

Add these console commands for testing:

```javascript
// Check current auth state
const { data } = await supabase.auth.getSession();
console.log('Session:', data);

// Check AsyncStorage
const keys = await AsyncStorage.getAllKeys();
const values = await AsyncStorage.multiGet(keys);
console.log('Storage:', values);

// Force clear session
await supabase.auth.signOut();
await AsyncStorage.clear();
```

## Rollback Plan

If anything goes wrong:

```bash
# Revert the changes
git checkout HEAD -- contexts/UserContext.tsx

# The other files weren't changed, so we're done
```

## Why This Will Work

1. **It's the same pattern as the working example** - just adapted to UserContext
2. **Timeout prevents infinite loading** - worst case: 5 seconds then fails safe
3. **No navigation orchestration** - screens already handle their own routing
4. **Defensive sign out** - clears state even if API fails
5. **Minimal changes** - less chance of breaking something else

## What NOT to Do

❌ Don't add navigation logic to UserContext
❌ Don't add complex auth checking to root layout  
❌ Don't create multiple sources of truth for auth state
❌ Don't add external monitoring/analytics libraries
❌ Don't try to be clever - keep it simple

## Success Metrics

- [ ] Users stay signed in after app restart
- [ ] Sign out works and navigates to Welcome
- [ ] No infinite loading spinners
- [ ] No console errors about navigation
- [ ] Works on both iOS and Android

## For the Developer

This is a MINIMAL fix. Don't expand scope. Don't add features. Just make these 2 changes to UserContext and test. If it works, ship it. If it doesn't, revert and report back.

The timeout is your safety net. If something goes wrong with session checking, the user will see the Welcome screen after 5 seconds instead of being stuck forever. That's acceptable.

Trust the existing navigation logic in the screens. They already check auth state and redirect appropriately. We don't need to centralize this.

Remember: The previous developer spent 1000+ lines trying to fix this and concluded it was impossible. They were overthinking it. Keep it simple.
