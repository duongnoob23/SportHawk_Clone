# Architectural Analysis: Supabase Auth Session Fix

## Executive Summary

The SportHawk MVP auth issue is caused by a **timing and state synchronization problem**, not a fundamental architectural flaw. The solution requires minimal changes focused on proper session lifecycle management.

## 1. Working Pattern Analysis (expo-push-supa)

### Architecture Pattern

```
App.tsx (Root Component)
├── Direct session state management
├── Immediate session check on mount
├── Single auth listener (no cleanup)
└── Conditional render: Auth OR Account
```

### Key Success Factors

1. **Synchronous Initial Check**: `getSession()` called immediately in useEffect
2. **Simple State**: Single `session` state variable
3. **Direct Rendering**: No navigation, just conditional component swap
4. **No Loading States**: App shows Auth component by default

## 2. Current System Architecture (SportHawk MVP)

### Architecture Pattern

```
app/_layout.tsx (Root)
├── UserProvider (Context)
│   ├── Session restoration
│   ├── Auth state listener
│   └── Profile fetching
└── Stack Navigator
    ├── index.tsx (Welcome)
    ├── (auth) screens
    └── (app) screens with tabs
```

### Current Issues Identified

#### Issue 1: Missing Root-Level Auth Check

- **Location**: `/app/_layout.tsx`
- **Problem**: Root layout doesn't check auth state, just wraps with UserProvider
- **Impact**: Navigation stack renders before auth is determined

#### Issue 2: Async Session Restoration

- **Location**: `UserContext.tsx:358-372`
- **Problem**: `authChecked` set to true even if session check fails
- **Impact**: Components think auth is checked when it might have errored

#### Issue 3: Navigation Timing

- **Location**: Multiple components trying to navigate
- **Problem**: `/app/index.tsx` and `/app/(app)/_layout.tsx` both navigate based on auth
- **Impact**: Race conditions and conflicting navigation

## 3. Root Cause Analysis

### The Core Problem

**The app renders the navigation stack before knowing auth state**, causing:

1. Welcome screen shows briefly even for authenticated users
2. Protected screens render before auth check completes
3. Multiple components race to control navigation

### Why Working Example Works

1. No navigation involved - just component swap
2. Synchronous default state (shows Auth by default)
3. Single point of truth for rendering decision

## 4. Minimal Technical Solution

### Design Principles

1. **Fix the timing, not the architecture**
2. **Add safety valves, not complexity**
3. **One source of navigation truth**

### Solution Architecture

#### Phase 1: Add Root Auth Gate

```typescript
// app/_layout.tsx - Add auth-aware rendering
export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if UserContext is ready
    const checkAuth = async () => {
      try {
        // Give UserContext time to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsReady(true);
      } catch {
        setIsReady(true); // Proceed even on error
      }
    };
    checkAuth();
  }, []);

  if (!isReady) {
    return <SplashScreen />; // Or your loading component
  }

  return (
    <ActionSheetProvider>
      <UserProvider>
        <AuthGate />
      </UserProvider>
    </ActionSheetProvider>
  );
}

// New component to handle auth-based routing
function AuthGate() {
  const { authChecked } = useUser();

  if (!authChecked) {
    return <SplashScreen />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack screenOptions={{...}} />
    </View>
  );
}
```

#### Phase 2: Fix UserContext Session Check

```typescript
// UserContext.tsx - Add timeout and error handling
useEffect(() => {
  let mounted = true;
  const timeoutId = setTimeout(() => {
    if (mounted && !authChecked) {
      console.warn('Auth check timeout - proceeding without session');
      setAuthChecked(true);
    }
  }, 3000); // 3 second timeout

  supabase.auth.getSession()
    .then(({ data: { session }, error }) => {
      if (!mounted) return;

      if (error) {
        console.error('Session check error:', error);
        // Still set authChecked on error
        setAuthChecked(true);
        clearTimeout(timeoutId);
        return;
      }

      if (session?.user) {
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id).then(profile => {
          if (mounted && profile) setProfile(profile);
        });
      }

      setAuthChecked(true);
      clearTimeout(timeoutId);
    })
    .catch(err => {
      if (mounted) {
        console.error('Session check failed:', err);
        setAuthChecked(true);
        clearTimeout(timeoutId);
      }
    });

  // Auth state listener remains the same
  const { data: authListener } = supabase.auth.onAuthStateChange(...);

  return () => {
    mounted = false;
    clearTimeout(timeoutId);
    authListener?.subscription?.unsubscribe();
  };
}, [fetchProfile]);
```

#### Phase 3: Simplify Navigation Logic

```typescript
// app/index.tsx - Remove auth check (let protected routes handle it)
export default function WelcomeScreen() {
  // Remove useEffect with auth check
  // Just be a simple welcome screen

  const handleGetStarted = () => {
    router.push(Routes.SignUp);
  };

  // ... rest of component
}

// app/(app)/_layout.tsx - Keep simple protection
export default function AppLayout() {
  const { user, authChecked } = useUser();

  useEffect(() => {
    if (authChecked && !user) {
      router.replace(Routes.Welcome);
    }
  }, [authChecked, user]);

  if (!authChecked) {
    return <LoadingView />;
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <Tabs>...</Tabs>;
}
```

## 5. Implementation Specification

### File Changes Required

#### 1. `/app/_layout.tsx`

- Add `AuthGate` component
- Move Stack rendering inside AuthGate
- Add splash/loading screen for initial load

#### 2. `/contexts/UserContext.tsx`

- Add 3-second timeout to session check
- Add proper error handling
- Add mounted flag to prevent stale updates
- Ensure authChecked always gets set

#### 3. `/app/index.tsx`

- Remove auth checking logic
- Make it a pure welcome screen

### Success Criteria

1. ✅ App restart with valid session → Direct to Home (no Welcome flash)
2. ✅ Sign out → Clears session and shows Welcome
3. ✅ Network failure → Shows Welcome after 3 seconds (no infinite spinner)
4. ✅ Sign in → Navigate to Home smoothly

### Risk Mitigation

1. **Timeout Protection**: 3-second max wait prevents infinite loading
2. **Mounted Flags**: Prevents state updates after unmount
3. **Error Boundaries**: Auth check proceeds even on errors
4. **Single Navigation Source**: Only protected routes handle redirects

## 6. Testing Protocol

### Manual Test Cases

1. **Cold Start with Session**: Kill app, restart → Should go to Home
2. **Cold Start without Session**: Clear storage, restart → Should show Welcome
3. **Sign Out**: From Home, sign out → Should show Welcome
4. **Network Failure**: Airplane mode, restart → Should show Welcome after 3s

### Debug Commands

```javascript
// Check current auth state
console.log(await AsyncStorage.getItem('supabase.auth.token'));

// Force clear session
await AsyncStorage.clear();

// Check Supabase session
const {
  data: { session },
} = await supabase.auth.getSession();
console.log('Session:', session);
```

## Summary

The fix requires **3 small changes** totaling approximately **40 lines of code**:

1. Add AuthGate wrapper (15 lines)
2. Add timeout/error handling to UserContext (20 lines)
3. Remove auth check from Welcome screen (−10 lines)

This is a **timing fix**, not an architectural change. The existing UserContext and navigation structure remain intact.
