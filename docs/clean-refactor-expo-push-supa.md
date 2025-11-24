# Clean Refactoring Plan: expo-push-supa Structure Only

## Core Principle

**Keep ALL working auth logic from expo-push-supa intact. Only change project structure to match SportHawk's shape.**

## What We Will NOT Change

- ❌ NO UserContext (keep session state in App/root)
- ❌ NO auth logic changes
- ❌ NO state management patterns from SportHawk
- ❌ NO complex abstractions
- ❌ Keep the simple, working auth exactly as is

## What We WILL Change

- ✅ Add expo-router navigation
- ✅ Create SportHawk's folder structure
- ✅ Split screens into similar patterns
- ✅ Add protected routes
- ✅ Match file organization

---

# Phase 1: Add Expo Router (Keep Auth Logic Intact)

## Step 1.1: Install Expo Router

```bash
cd /Users/adimac/Documents/Andrew/Dev/expo-push-supa
npm install expo-router expo-linking expo-constants
npx expo install expo-status-bar
```

## Step 1.2: Update package.json

```json
{
  "main": "expo-router/entry"
  // ... rest stays the same
}
```

## Step 1.3: Update app.json

```json
{
  "expo": {
    "scheme": "expo-push-supa"
    // ... existing config
  }
}
```

## Step 1.4: Create app directory

```bash
mkdir -p app
```

## Step 1.5: Move App Logic to app/\_layout.tsx

```typescript
// app/_layout.tsx
import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { Stack } from 'expo-router'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'

// Export session for child components
export let globalSession: Session | null = null

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      globalSession = session
      setIsReady(true)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      globalSession = session
    })
  }, [])

  if (!isReady) {
    return null // Or a splash screen
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Home'
        }}
      />
    </Stack>
  )
}
```

## Step 1.6: Create app/index.tsx (Main App Logic)

```typescript
// app/index.tsx
import { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { supabase } from '../lib/supabase'
import Auth from '../components/Auth'
import Account from '../components/Account'
import { Session } from '@supabase/supabase-js'

export default function HomeScreen() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  return (
    <View style={styles.mt20}>
      <Text style={styles.title}>Expo-Push-Supa</Text>
      {session && session.user ? <Account key={session.user.id} session={session} /> : <Auth />}
    </View>
  )
}

const styles = StyleSheet.create({
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

## Step 1.7: Test Checkpoint

```yaml
Test:
  - [ ] App still launches
  - [ ] Can sign in
  - [ ] Session persists
  - [ ] Can sign out
  - [ ] No errors in console
```

---

# Phase 2: Add SportHawk's Folder Pattern (No Auth Changes)

## Step 2.1: Create SportHawk Structure

```bash
# Create SportHawk-like structure
mkdir -p app/(auth)
mkdir -p app/(app)
```

## Step 2.2: Create Welcome Screen

```typescript
// app/index.tsx - Update to be a welcome/router screen
import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'

export default function WelcomeScreen() {
  const [session, setSession] = useState<Session | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setChecked(true)

      // Auto-navigate if already signed in
      if (session) {
        router.replace('/(app)/home')
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        router.replace('/(app)/home')
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const handleSignIn = () => {
    router.push('/(auth)/signin')
  }

  if (!checked) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    )
  }

  // Only show welcome if not authenticated
  if (session) {
    return null
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expo-Push-Supa</Text>
      <Text style={styles.subtitle}>Welcome!</Text>
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
    color: "yellow",
    backgroundColor: "blue",
    padding: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
})
```

## Step 2.3: Create Auth Layout

```typescript
// app/(auth)/_layout.tsx
import { Stack } from 'expo-router'

export default function AuthLayout() {
  // No auth protection here - these are public screens
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signin" />
    </Stack>
  )
}
```

## Step 2.4: Move Auth to Sign In Screen

```typescript
// app/(auth)/signin.tsx
import { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import Auth from '../../components/Auth'
import { Session } from '@supabase/supabase-js'

export default function SignInScreen() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(app)/home')
      }
    })

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        router.replace('/(app)/home')
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  return <Auth />
}
```

## Step 2.5: Create Protected App Layout

```typescript
// app/(app)/_layout.tsx
import { useEffect, useState } from 'react'
import { Stack, router } from 'expo-router'
import { View, Text } from 'react-native'
import { supabase } from '../../lib/supabase'
import { Session } from '@supabase/supabase-js'

export default function AppLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)

      if (!session) {
        router.replace('/')
      }
    })

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        router.replace('/')
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
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

## Step 2.6: Create Home Screen

```typescript
// app/(app)/home.tsx
import { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'
import Account from '../../components/Account'
import { Session } from '@supabase/supabase-js'

export default function HomeScreen() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  if (!session) {
    return (
      <View style={styles.container}>
        <Text>No session</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expo-Push-Supa</Text>
      <Account key={session.user.id} session={session} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    color: "yellow",
    backgroundColor: "blue",
    marginBottom: 10,
    padding: 10,
  },
})
```

## Step 2.7: Keep Original Components Unchanged

```
components/
├── Auth.tsx (NO CHANGES - works perfectly)
├── Account.tsx (NO CHANGES - works perfectly)
└── Push.tsx (NO CHANGES)

lib/
└── supabase.ts (NO CHANGES - works perfectly)
```

## Step 2.8: Test Checkpoint

```yaml
Test:
  - [ ] App launches to welcome screen
  - [ ] Sign In button navigates to auth
  - [ ] Successful sign in goes to home
  - [ ] Sign out returns to welcome
  - [ ] Session persists on app restart
  - [ ] Protected routes work
  - [ ] No infinite loops
```

---

# Phase 3: Optional - Add Tab Navigation (Like SportHawk)

## Step 3.1: Update Protected Layout for Tabs

```typescript
// app/(app)/_layout.tsx - Update to use Tabs
import { useEffect, useState } from 'react'
import { Tabs, router } from 'expo-router'
import { View, Text } from 'react-native'
import { supabase } from '../../lib/supabase'
import { Session } from '@supabase/supabase-js'

export default function AppLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)

      if (!session) {
        router.replace('/')
      }
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        router.replace('/')
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    )
  }

  if (!session) {
    return null
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopWidth: 1,
          borderTopColor: '#333',
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  )
}
```

## Step 3.2: Create Profile Tab

```typescript
// app/(app)/profile.tsx
import { useEffect, useState } from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'
import { Session } from '@supabase/supabase-js'

export default function ProfileScreen() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>User: {session?.user?.email}</Text>
      <View style={styles.button}>
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
  },
})
```

## Step 3.3: Final Test Checkpoint

```yaml
Test:
  - [ ] All previous tests pass
  - [ ] Tab navigation works
  - [ ] Sign out from any tab works
  - [ ] Session state consistent across tabs
```

---

# Phase 4: Validation

## What We've Proven

1. ✅ expo-push-supa auth works with Expo Router
2. ✅ expo-push-supa auth works with protected routes
3. ✅ expo-push-supa auth works with SportHawk's folder structure
4. ✅ Session management stays simple and working
5. ✅ No need for UserContext or complex state

## What We've Learned

- The folder structure is NOT the problem
- Navigation pattern is NOT the problem
- The problem IS in how SportHawk manages auth state
- Simple session state in root works perfectly

## Key Success Factors

```typescript
// What makes expo-push-supa work:
1. Direct session state management
2. Simple auth state checks
3. No complex abstractions
4. Auth listeners in each screen that needs them
5. No central UserContext trying to control everything
```

---

# Migration Strategy for SportHawk

## Now We Can Safely:

1. **Remove UserContext** from SportHawk
2. **Copy the simple session pattern** from refactored expo-push-supa
3. **Keep SportHawk's UI components** but use expo-push-supa's auth logic
4. **Test incrementally** as we replace each piece

## What NOT to Migrate:

- ❌ Don't keep UserContext
- ❌ Don't keep complex auth abstractions
- ❌ Don't keep multiple sources of truth
- ❌ Don't keep complex navigation logic

## What TO Migrate:

- ✅ Simple session state in layouts
- ✅ Direct supabase.auth calls
- ✅ Auth listeners where needed
- ✅ Simple, direct approach

---

# Summary

This plan:

1. **Preserves working auth** from expo-push-supa
2. **Adds SportHawk's structure** without breaking anything
3. **Proves compatibility** between structure and auth
4. **Provides clear migration path** for SportHawk

Total changes: ~200 lines of navigation/structure code
Auth changes: ZERO (that's the point!)

The working auth remains untouched, proving that SportHawk's structure is compatible with simple, working authentication.
