# Authentication Context Specification

**Version:** 1.0  
**Date:** 2025-08-11  
**Status:** Active  
**Purpose:** Define the complete UserContext and useUser implementation for SportHawk V4

## Overview

SportHawk V4 uses a centralized authentication approach via React Context and Hooks, providing a single source of truth for authentication state and a clean interface for all Supabase auth operations.

## Architecture

```
UserProvider (Context)
    ↓
_layout.tsx (wraps entire app)
    ↓
All Screens (access via useUser hook)
```

## UserContext Implementation

### Location

`/contexts/UserContext.tsx`

### Current State (Skeleton)

- Basic structure exists
- Some methods partially implemented
- TODOs for completion

### Required Full Implementation

```typescript
interface User {
  id: string;
  email: string;
  first_name: string;
  surname: string;
  date_of_birth: string;
  team_sort: 'men' | 'women';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface UserContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authChecked: boolean;
  userSignIn: (email: string, password: string) => Promise<void>;
  userSignOut: () => Promise<void>;
  userSignUp: (data: SignUpData) => Promise<void>;
  userVerify: (email: string, otp: string) => Promise<void>;
  userForgotPassword: (email: string) => Promise<void>;
  userResetPassword: (newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

### Key Features to Implement

1. **Session Management**
   - Automatic session recovery on app launch
   - Session refresh before expiry
   - Persist session across app restarts

2. **User Profile Management**
   - Fetch user profile from `profiles` table
   - Cache user data
   - Update user profile method

3. **Auth State Listeners**

   ```typescript
   useEffect(() => {
     const { data: authListener } = supabase.auth.onAuthStateChange(
       async (event, session) => {
         // Handle auth state changes
         // Update user and session
       }
     );
     return () => authListener.subscription.unsubscribe();
   }, []);
   ```

4. **Error Handling**
   - Consistent error messages
   - User-friendly error formatting
   - Network error recovery

5. **Loading States**
   - Initial auth check loading
   - Operation-specific loading states

## useUser Hook Implementation

### Location

`/hooks/useUser.ts`

### Current Implementation

✓ Basic structure complete
✓ Error handling for usage outside provider

### No changes needed - already correct

## Integration Points

### Root Layout (`/app/_layout.tsx`)

```typescript
import { UserProvider } from '@ctx/UserContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </UserProvider>
  );
}
```

### Protected Routes (`/app/(tabs)/_layout.tsx`)

```typescript
import { useUser } from '@hks/useUser';
import { Redirect } from 'expo-router';

export default function TabsLayout() {
  const { user, authChecked } = useUser();

  if (!authChecked) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/" />;
  }

  return <Tabs>...</Tabs>;
}
```

### Screen Usage Example

```typescript
import { useUser } from '@hks/useUser';

export default function ProfileScreen() {
  const { user, userSignOut } = useUser();

  return (
    <ShScreenContainer>
      <ShText>Welcome {user?.first_name}</ShText>
      <ShButton onPress={userSignOut} title="Sign Out" />
    </ShScreenContainer>
  );
}
```

## Implementation Tasks for Epic 0

1. **Complete UserContext Methods**
   - [ ] Implement userSignUp with full data
   - [ ] Implement userSignOut with Supabase call
   - [ ] Implement userForgotPassword
   - [ ] Implement userResetPassword
   - [ ] Implement refreshUser
   - [ ] Complete getInitialUserValue

2. **Add Session Management**
   - [ ] Store session in state
   - [ ] Implement onAuthStateChange listener
   - [ ] Handle session refresh

3. **Add User Profile Fetching**
   - [ ] Query profiles table after auth
   - [ ] Merge auth user with profile data
   - [ ] Cache user profile

4. **Add Loading States**
   - [ ] Add loading boolean to context
   - [ ] Set loading during operations
   - [ ] Handle concurrent operations

5. **Wrap App with Provider**
   - [ ] Update root \_layout.tsx
   - [ ] Update (tabs)/\_layout.tsx for protection
   - [ ] Update (auth)/\_layout.tsx if needed

6. **Update Existing Screens**
   - [ ] Update SignUp.tsx to use useUser
   - [ ] Update SignIn.tsx to use useUser
   - [ ] Remove direct Supabase auth calls

## Testing Checklist

### Unit Tests

- [ ] UserContext provider renders
- [ ] useUser hook throws outside provider
- [ ] Auth methods work correctly
- [ ] Session persistence works

### Integration Tests

- [ ] Sign up flow works end-to-end
- [ ] Sign in flow works end-to-end
- [ ] Session recovers after app restart
- [ ] Protected routes redirect correctly
- [ ] Sign out clears all user data

### Manual Tests

- [ ] User can sign up
- [ ] Email verification works
- [ ] User can sign in
- [ ] Session persists
- [ ] User can sign out
- [ ] Protected routes work
- [ ] User info displays correctly

## Benefits of This Approach

1. **Single Source of Truth**
   - All auth logic in one place
   - Consistent auth state across app
   - Easier to debug auth issues

2. **Clean Component Code**
   - Screens don't import Supabase directly
   - Simple hook interface
   - Separation of concerns

3. **Better Testing**
   - Mock UserContext for tests
   - Test auth logic separately
   - Test components without auth complexity

4. **Easier Maintenance**
   - Update auth logic in one place
   - Switch auth providers if needed
   - Add features like biometric auth easily

5. **Performance**
   - Cache user data
   - Minimize API calls
   - Optimize re-renders

## Migration Notes

### From Direct Supabase Usage

Before (in SignUp.tsx):

```typescript
import { supabase } from '@top/lib/supabase';
const { error } = await supabase.auth.signUp({...});
```

After:

```typescript
import { useUser } from '@hks/useUser';
const { userSignUp } = useUser();
await userSignUp({...});
```

### Error Handling Pattern

```typescript
try {
  await userSignIn(email, password);
  router.push('/home');
} catch (error) {
  Alert.alert('Error', error.message);
}
```

## Future Enhancements

1. **Biometric Authentication**
   - Add to UserContext
   - Store biometric preference

2. **Social Sign-In**
   - Add Google/Apple methods
   - Handle OAuth flows

3. **Offline Support**
   - Queue auth operations
   - Sync when online

4. **Multi-Factor Authentication**
   - Add MFA methods
   - Handle MFA challenges

5. **Role-Based Access**
   - Add user roles to context
   - Provide permission checks

## Conclusion

The UserContext/useUser pattern provides a robust, maintainable authentication system that centralizes all auth logic, simplifies component code, and provides a clean upgrade path for future enhancements. This approach is already partially implemented and just needs completion in Epic 0.
