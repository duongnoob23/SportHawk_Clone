# Detailed Refactoring Plan: expo-push-supa → SportHawk Structure

## Overview

Transform expo-push-supa to match SportHawk's architecture while maintaining working auth at each step.

---

## Phase 1: Create UserContext from Account Component

### Step 1.1: Setup Context Structure

```bash
# Create new directory structure
mkdir -p contexts
mkdir -p hooks
```

### Step 1.2: Transform Account.tsx → UserContext.tsx

```typescript
// contexts/UserContext.tsx
// Transform from component to context provider

import { createContext, PropsWithChildren, useEffect, useState, useCallback } from 'react'
import { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface UserProfile {
  id: string
  username: string | null
  website: string | null
  // Add other profile fields as needed
}

export interface UserContextType {
  user: SupabaseUser | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  authChecked: boolean
  userSignOut: () => Promise<void>
  refreshUser: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

export const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  // Move getProfile logic here
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, website')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      return null
    }
  }, [])

  // Move signOut here
  async function userSignOut() {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initialize auth state (moved from App.tsx)
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session)
        setUser(session.user)
        fetchProfile(session.user.id).then(profileData => {
          if (profileData) setProfile(profileData)
        })
      }
      setAuthChecked(true)
    })

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setSession(session)
          setUser(session.user)
          const profileData = await fetchProfile(session.user.id)
          if (profileData) setProfile(profileData)
        } else {
          setUser(null)
          setProfile(null)
          setSession(null)
        }
      }
    )

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [fetchProfile])

  // Move updateProfile here
  async function updateProfile(updates: Partial<UserProfile>) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      // Refresh profile
      const newProfile = await fetchProfile(session.user.id)
      if (newProfile) setProfile(newProfile)
    } catch (error) {
      console.error('Update profile error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function refreshUser() {
    if (session?.user) {
      const profileData = await fetchProfile(session.user.id)
      if (profileData) setProfile(profileData)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        authChecked,
        userSignOut,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
```

### Step 1.3: Create useUser Hook

```typescript
// hooks/useUser.ts
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}
```

### Step 1.4: Create New Account Component (UI Only)

```typescript
// components/Account.tsx (NEW - just UI, uses context)
import { useState, useEffect } from 'react'
import { StyleSheet, View, Alert, Text, Button, TextInput } from 'react-native'
import { useUser } from '../hooks/useUser'
import Push from './Push'

export default function Account() {
  const { session, profile, loading, updateProfile, userSignOut } = useUser()
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setWebsite(profile.website || '')
    }
  }, [profile])

  const handleUpdate = async () => {
    await updateProfile({ username, website })
    Alert.alert('Profile updated!')
  }

  return (
    <View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text>Email address</Text>
        <TextInput
          style={styles.input}
          value={session?.user?.email}
          disabled
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Text>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Text>{session?.user?.id}</Text>
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : 'Update'}
          onPress={handleUpdate}
          disabled={loading}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={userSignOut} />
      </View>

      {session && (
        <View style={[styles.verticallySpaced, { height: 200 }]}>
          <Push session={session} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
})
```

### Step 1.5: Update App.tsx

```typescript
// App.tsx
import 'react-native-url-polyfill/auto'
import { View, Text, StyleSheet } from 'react-native'
import { UserProvider } from './contexts/UserContext'
import { useUser } from './hooks/useUser'
import Auth from './components/Auth'
import Account from './components/Account'

function AppContent() {
  const { session, authChecked } = useUser()

  // Wait for auth check
  if (!authChecked) {
    return (
      <View style={styles.mt20}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={styles.mt20}>
      <Text style={styles.title}>Expo-Push-Supa</Text>
      {session && session.user ? <Account /> : <Auth />}
    </View>
  )
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 20,
    paddingBottom: 20,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    color: "yellow",
    backgroundColor: "blue",
    marginBottom: 10
  },
})
```

### Step 1.6: Test Checkpoint 1

```yaml
Tests:
  - [ ] App launches without errors
  - [ ] Can sign in successfully
  - [ ] Session persists on app restart
  - [ ] Can sign out successfully
  - [ ] Profile loads and updates work
  - [ ] Push component still receives session
```

---

## Phase 2: Add Expo Router Navigation

### Step 2.1: Install Dependencies

```bash
npm install expo-router
npx expo install expo-linking expo-constants expo-status-bar
```

### Step 2.2: Update app.json

```json
{
  "expo": {
    "scheme": "expo-push-supa"
    // ... existing config
  }
}
```

### Step 2.3: Create Navigation Structure

```bash
# Create app directory structure
mkdir -p app
mkdir -p app/(auth)
mkdir -p app/(app)
```

### Step 2.4: Create Root Layout

```typescript
// app/_layout.tsx
import React from 'react'
import { Stack } from 'expo-router'
import { UserProvider } from '../contexts/UserContext'

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UserProvider>
  )
}
```

### Step 2.5: Create Index (Welcome) Screen

```typescript
// app/index.tsx
import { useEffect } from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import { router } from 'expo-router'
import { useUser } from '../hooks/useUser'

export default function WelcomeScreen() {
  const { session, authChecked } = useUser()

  useEffect(() => {
    if (authChecked && session) {
      router.replace('/(app)/home')
    }
  }, [authChecked, session])

  const handleSignIn = () => {
    router.push('/(auth)/signin')
  }

  if (!authChecked) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expo-Push-Supa</Text>
      <Text>Welcome! Please sign in to continue</Text>
      <Button title="Sign In" onPress={handleSignIn} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: 'yellow',
    backgroundColor: 'blue',
    padding: 10,
    marginBottom: 20,
  },
})
```

### Step 2.6: Create Auth Layout

```typescript
// app/(auth)/_layout.tsx
import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signin" />
    </Stack>
  )
}
```

### Step 2.7: Move Auth to Sign In Screen

```typescript
// app/(auth)/signin.tsx
import { useEffect } from 'react'
import { router } from 'expo-router'
import { useUser } from '../../hooks/useUser'
import Auth from '../../components/Auth'

export default function SignInScreen() {
  const { session } = useUser()

  useEffect(() => {
    if (session) {
      router.replace('/(app)/home')
    }
  }, [session])

  return <Auth />
}
```

### Step 2.8: Create Protected App Layout

```typescript
// app/(app)/_layout.tsx
import { useEffect } from 'react'
import { Stack, router } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useUser } from '../../hooks/useUser'

export default function AppLayout() {
  const { session, authChecked } = useUser()

  useEffect(() => {
    if (authChecked && !session) {
      router.replace('/')
    }
  }, [authChecked, session])

  if (!authChecked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!session) {
    return null
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
    </Stack>
  )
}
```

### Step 2.9: Create Home Screen

```typescript
// app/(app)/home.tsx
import Account from '../../components/Account'

export default function HomeScreen() {
  return <Account />
}
```

### Step 2.10: Update package.json

```json
{
  "main": "expo-router/entry"
  // ... rest of config
}
```

### Step 2.11: Test Checkpoint 2

```yaml
Tests:
  - [ ] App navigates to welcome on fresh start
  - [ ] Sign in navigates to home
  - [ ] Sign out navigates back to welcome
  - [ ] Protected route redirects when not authenticated
  - [ ] Session persistence still works
  - [ ] No infinite navigation loops
```

---

## Phase 3: Final Alignment with SportHawk

### Step 3.1: Add Loading States

```typescript
// Add loading screen component
// components/LoadingScreen.tsx
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FFD700" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    marginTop: 10,
    color: '#FFD700',
  },
})
```

### Step 3.2: Add AppState Listener (from SportHawk)

```typescript
// lib/supabase.ts - Update to match SportHawk
import { AppState } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Add AppState listener for token refresh
AppState.addEventListener('change', state => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
```

### Step 3.3: Add Timeout Protection

```typescript
// contexts/UserContext.tsx - Add timeout to session check
useEffect(() => {
  let mounted = true;

  // Add timeout protection
  const timeoutId = setTimeout(() => {
    if (mounted && !authChecked) {
      console.warn('Auth check timed out after 3 seconds');
      setAuthChecked(true);
    }
  }, 3000);

  supabase.auth
    .getSession()
    .then(({ data: { session }, error }) => {
      if (!mounted) return;

      if (error) {
        console.error('Session check error:', error);
        setAuthChecked(true);
        clearTimeout(timeoutId);
        return;
      }

      if (session?.user) {
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id).then(profileData => {
          if (mounted && profileData) setProfile(profileData);
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

  // Listen for auth changes
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setSession(session);
        setUser(session.user);
        const profileData = await fetchProfile(session.user.id);
        if (mounted && profileData) setProfile(profileData);
      } else {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
    }
  );

  return () => {
    mounted = false;
    clearTimeout(timeoutId);
    authListener?.subscription?.unsubscribe();
  };
}, [fetchProfile]);
```

### Step 3.4: Add Auth Methods to Context

```typescript
// contexts/UserContext.tsx - Add sign in method
async function userSignIn(email: string, password: string) {
  try {
    setLoading(true)
    console.log("UserContext: Signing in user:", email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Session will be handled by onAuthStateChange
    return {
      success: true,
      isVerified: true // Simplified for this example
    }
  } catch (error: any) {
    console.error("UserContext: Sign in error:", error)
    throw new Error(error.message || "Sign in failed")
  } finally {
    setLoading(false)
  }
}

// Update the context provider value
return (
  <UserContext.Provider
    value={{
      user,
      profile,
      session,
      loading,
      authChecked,
      userSignIn,  // Add this
      userSignOut,
      updateProfile,
      refreshUser,
    }}
  >
    {children}
  </UserContext.Provider>
)
```

### Step 3.5: Update Auth Component for Sign In

```typescript
// components/Auth.tsx - Update to use context
import React, { useState } from 'react'
import { Alert, StyleSheet, View, Button, Text, TextInput } from 'react-native'
import { useUser } from '../hooks/useUser'

export default function Auth() {
  const { userSignIn, loading } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function signInWithEmail() {
    try {
      await userSignIn(email, password)
      // Navigation handled by auth state change
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  // ... rest of component remains similar
  return (
    <View>
      {/* ... existing UI */}
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title="Sign in"
          disabled={loading}
          onPress={signInWithEmail}
        />
      </View>
      {/* ... rest of UI */}
    </View>
  )
}
```

### Step 3.6: Final Test Checkpoint

```yaml
Tests:
  - [ ] All previous tests still pass
  - [ ] Timeout prevents infinite loading
  - [ ] Network errors handled gracefully
  - [ ] AppState listener refreshes tokens
  - [ ] Structure matches SportHawk pattern
```

---

## Phase 4: Validation & Documentation

### Step 4.1: Create Test Matrix

```yaml
Test Scenarios:
  Cold Start:
    - [ ] No session → Shows welcome
    - [ ] Valid session → Goes to home
    - [ ] Expired session → Shows welcome

  Auth Flow:
    - [ ] Sign in → Navigate to home
    - [ ] Sign out → Navigate to welcome
    - [ ] Sign up → Navigate to home (if implemented)

  Error Cases:
    - [ ] Network down → Timeout after 3s
    - [ ] Supabase error → Shows welcome
    - [ ] Profile fetch fails → Still shows home

  State Management:
    - [ ] Background/foreground → Token refreshes
    - [ ] Kill app → Session persists
    - [ ] Clear storage → Shows welcome
```

### Step 4.2: Document Key Differences

```markdown
# Architecture Comparison

## Original expo-push-supa:

- Direct state in App.tsx
- No navigation
- Simple conditional render

## Refactored expo-push-supa:

- UserContext for state
- Expo Router navigation
- Protected routes
- Timeout protection
- Matches SportHawk structure

## Key Success Factors:

1. Session check in UserContext initialization
2. authChecked flag prevents race conditions
3. Protected route pattern in (app)/\_layout.tsx
4. Timeout prevents infinite loading
5. Single source of navigation truth
```

### Step 4.3: Create Migration Checklist

```yaml
SportHawk Migration Checklist:
  - [ ] Backup current code
  - [ ] Copy UserContext pattern
  - [ ] Update root _layout.tsx
  - [ ] Add timeout protection
  - [ ] Remove conflicting navigation
  - [ ] Test all auth flows
  - [ ] Verify no infinite spinners
```

---

## Success Criteria

The refactored expo-push-supa must:

1. ✅ Still authenticate users correctly
2. ✅ Persist sessions across app restarts
3. ✅ Handle sign out properly
4. ✅ Navigate correctly based on auth state
5. ✅ Not show infinite loading spinners
6. ✅ Handle network failures gracefully
7. ✅ Match SportHawk's architecture

## Risk Mitigation

- **Each step is independently testable**
- **Git commit after each working phase**
- **Keep original App.tsx as App.tsx.backup**
- **Test on both iOS and Android**
- **Test with both good and bad network**

## Implementation Order

1. **Phase 1**: Transform to Context pattern (Test before proceeding)
2. **Phase 2**: Add navigation structure (Test before proceeding)
3. **Phase 3**: Add SportHawk features (Test before proceeding)
4. **Phase 4**: Validate everything works

## Time Estimate

- Phase 1: 1-2 hours
- Phase 2: 2-3 hours
- Phase 3: 1 hour
- Phase 4: 1 hour
- **Total: 5-7 hours**

## Notes

- **CRITICAL**: Test after each phase - do not proceed if tests fail
- **IMPORTANT**: Keep both projects running side-by-side for comparison
- **TIP**: Use git branches for each phase to enable easy rollback

This plan transforms expo-push-supa step-by-step into SportHawk's structure while maintaining working auth throughout. Once complete and verified, the exact pattern can be safely transplanted to SportHawk MVP.
