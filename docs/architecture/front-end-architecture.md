# Front-End Architecture: SportHawk MVP

**Version:** 2.0  
**Date:** 2025-09-03  
**Status:** Active - Brownfield Implementation  
**Project State:** ~10% Complete with Foundation Established

## 1. Introduction

This document describes the IMPLEMENTED front-end architecture of the SportHawk MVP. It serves as the technical reference for understanding and extending the existing React Native/Expo application architecture.

### Document Purpose

- Document the ACTUAL architecture in use
- Provide patterns for consistent extension
- Define boundaries and constraints
- Reference real implementation examples

## 2. Application Architecture Overview

### Tech Stack Layers

```
┌─────────────────────────────────────────────┐
│         Presentation Layer                  │
│     React Native Components (Sh*)           │
├─────────────────────────────────────────────┤
│         Navigation Layer                    │
│     Expo Router (File-based)                │
├─────────────────────────────────────────────┤
│         State Management Layer              │
│     React Context (UserContext)             │
├─────────────────────────────────────────────┤
│         API Abstraction Layer               │
│     /lib/api/* (Mandatory for data)         │
├─────────────────────────────────────────────┤
│         External Services                   │
│     Supabase Client                         │
└─────────────────────────────────────────────┘
```

### Core Technologies

| Technology   | Version     | Purpose              |
| ------------ | ----------- | -------------------- |
| React Native | 0.76.6      | Mobile framework     |
| Expo         | SDK 53      | Development platform |
| TypeScript   | Strict Mode | Type safety          |
| Expo Router  | 4.1         | Navigation           |
| Supabase JS  | 2.x         | Backend client       |

## 3. Project Structure

### Directory Architecture

```
/SportHawk_MVP_v4
├── /app                        # SCREENS (Expo Router)
│   ├── /(auth)                # Auth flow screens
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── verify-email.tsx
│   ├── /(tabs)                # Tab navigation
│   │   ├── _layout.tsx        # Tab configuration
│   │   ├── home.tsx
│   │   ├── teams.tsx
│   │   ├── explore.tsx
│   │   ├── alerts.tsx
│   │   └── profile.tsx
│   ├── /events               # Event screens
│   │   ├── create-event.tsx  # Pattern reference
│   │   └── [id]/
│   ├── /teams                # Team screens
│   │   └── [id]/
│   │       ├── index.tsx
│   │       └── /admin/
│   ├── /user                 # User screens
│   │   └── payment-history.tsx
│   └── _layout.tsx           # Root Stack
│
├── /components               # UI COMPONENTS
│   ├── index.ts             # Barrel exports
│   ├── /ShButton           # Button component folder
│   │   ├── ShButton.tsx
│   │   └── index.ts
│   ├── /ShText             # Text component folder
│   │   ├── ShText.tsx
│   │   └── index.ts
│   ├── /ShIcon             # Icon component folder
│   │   ├── ShIcon.tsx
│   │   └── index.ts
│   ├── /ShFormFieldEmail   # Email field folder
│   │   ├── ShFormFieldEmail.tsx
│   │   └── index.ts
│   └── [other component folders following same pattern]
│
├── /config                 # CONFIGURATION
│   ├── colors.ts          # Color palette
│   ├── typography.ts      # Text styles
│   ├── spacing.ts         # Spacing system
│   ├── buttons.ts         # Button variants
│   ├── icons.ts           # Icon enum
│   └── routes.ts          # Route constants
│
├── /contexts              # STATE MANAGEMENT
│   └── UserContext.tsx    # Auth state
│
├── /lib                   # INTEGRATIONS
│   ├── /api              # API layer
│   │   ├── users.ts
│   │   ├── teams.ts
│   │   └── events.ts
│   └── supabase.ts       # Client config
│
└── /types                # TYPE DEFINITIONS
    └── database.ts       # Supabase types
```

## 4. Navigation Architecture

### Expo Router Implementation

#### File-Based Routing

```
/app
  /(auth)/sign-in.tsx  → /sign-in
  /(tabs)/home.tsx     → /home
  /teams/[id]/index.tsx → /teams/123
```

#### Root Layout Configuration

Reference: `/app/_layout.tsx`

```typescript
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="events" />
      <Stack.Screen name="teams" />
    </Stack>
  );
}
```

#### Tab Navigation Setup

Reference: `/app/(tabs)/_layout.tsx`

```typescript
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorPalette.primary,
        tabBarInactiveTintColor: colorPalette.textSecondary,
        tabBarStyle: {
          backgroundColor: colorPalette.background,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <ShIcon name={IconName.Home} color={color} />
          ),
        }}
      />
      {/* Other tabs */}
    </Tabs>
  );
}
```

### Navigation Patterns

#### Programmatic Navigation

```typescript
import { router } from 'expo-router';
import { Routes } from '@cfg/routes';

// Navigate to screen
router.push(Routes.TeamDetail(teamId));

// Replace current screen
router.replace(Routes.Home);

// Go back
router.back();

// Navigate with params
router.push({
  pathname: Routes.TeamDetail(),
  params: { id: teamId },
});
```

#### Route Constants Configuration

```typescript
// /config/routes.ts
export const Routes = {
  Home: '/(tabs)/home',
  Teams: '/(tabs)/teams',
  TeamDetail: (id?: string) => (id ? `/teams/${id}` : '/teams/[id]'),
  CreateEvent: '/events/create-event',
  SignIn: '/(auth)/sign-in',
  SignUp: '/(auth)/sign-up',
  // All routes defined here
} as const;
```

#### Stack Screen Options

```typescript
<Stack.Screen
  name="create-event"
  options={{
    title: "Create Event",
    presentation: 'modal', // or 'card'
    headerLeft: () => <BackButton />,
    headerRight: () => <SaveButton />,
  }}
/>
```

## 5. Component Architecture

### Component Hierarchy

```
ShScreenContainer
├── ShText (heading)
├── ShSpacer
├── Content Components
│   ├── ShFormFieldEmail
│   ├── ShFormFieldPassword
│   └── ShButton
└── ShSpacer
```

### Component Composition Pattern

#### Base Component Structure

```typescript
// /components/ShComponent.tsx
interface ShComponentProps {
  // Variant from config
  variant?: keyof typeof componentVariants;

  // Standard RN props
  style?: StyleProp<ViewStyle>;

  // Component specific
  onPress?: () => void;
  children?: React.ReactNode;
}

export function ShComponent({
  variant = 'default',
  style,
  children,
  ...props
}: ShComponentProps) {
  const variantStyle = componentVariants[variant];

  return (
    <View style={[styles.base, variantStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    // Use config values only
    padding: spacing.medium,
    backgroundColor: colorPalette.surface,
  },
});
```

### Barrel Export Pattern

Reference: `/components/index.ts`

```typescript
// Single point of export for all components
export { ShButton } from './ShButton';
export { ShText } from './ShText';
export { ShIcon } from './ShIcon';
export { ShFormFieldEmail } from './ShFormFieldEmail';
export { ShFormFieldPassword } from './ShFormFieldPassword';
// ... all other components

// Each component folder also has its own index.ts
// /components/ShButton/index.ts
export { ShButton } from './ShButton';

// Usage in screens
import { ShButton, ShText, ShIcon } from '@top/components';
```

## 6. State Management Architecture

### Context Pattern Implementation

#### UserContext (Authentication)

Reference: `/contexts/UserContext.tsx`

```typescript
interface UserContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType>();

export function UserProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);

  // Auth state management
  useEffect(() => {
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Provide methods
  const value = {
    user,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Hook for consuming
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be within UserProvider');
  return context;
};
```

### Form State Management with Zustand

#### Cross-Component Form State

```typescript
// /stores/paymentFormStore.ts
import { create } from 'zustand';

interface PaymentFormState {
  formData: {
    amount: string;
    description: string;
    dueDate: Date | null;
    members: string[];
  };
  errors: Record<string, string>;
  updateField: (field: string, value: any) => void;
  clearForm: () => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
}

export const usePaymentFormStore = create<PaymentFormState>(set => ({
  formData: {
    amount: '',
    description: '',
    dueDate: null,
    members: [],
  },
  errors: {},
  updateField: (field, value) =>
    set(state => ({
      formData: { ...state.formData, [field]: value },
      errors: { ...state.errors, [field]: undefined },
    })),
  clearForm: () =>
    set({
      formData: { amount: '', description: '', dueDate: null, members: [] },
      errors: {},
    }),
  setError: (field, error) =>
    set(state => ({ errors: { ...state.errors, [field]: error } })),
  clearError: field =>
    set(state => ({ errors: { ...state.errors, [field]: undefined } })),
}));

// Usage in component
function PaymentForm() {
  const { formData, updateField, clearForm } = usePaymentFormStore();

  const handleSubmit = async () => {
    try {
      await paymentApi.createRequest(formData);
      clearForm();
      router.back();
    } catch (error) {
      // Handle error
    }
  };
}
```

### Local Component State

For simple, component-specific state, use React's useState:

```typescript
function SimpleComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  // Component-only state that doesn't need sharing
}
```

## 7. API Layer Architecture

### API Abstraction Pattern

#### API Module Structure

Reference: `/lib/api/payments.ts`

```typescript
import { supabase } from '@lib/supabase';
import type { PaymentRequest, Payment } from '@typ/database';

export const paymentApi = {
  // Create payment request
  async createRequest(data: Partial<PaymentRequest>) {
    const { data: request, error } = await supabase
      .from('payment_requests')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return request;
  },

  // Get user payments
  async getUserPayments(userId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(
        `
        *,
        payment_request:payment_requests(*)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update payment status
  async updatePaymentStatus(
    paymentId: string,
    status: 'pending' | 'paid' | 'failed'
  ) {
    const { error } = await supabase
      .from('payments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', paymentId);

    if (error) throw error;
  },
};
```

### Usage in Screens

```typescript
// CORRECT: Using API layer
import { paymentApi } from '@lib/api/payments';

function PaymentScreen() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await paymentApi.getUserPayments(userId);
      setPayments(data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
  };
}

// WRONG: Direct Supabase usage in screens
// import { supabase } from '@lib/supabase';
// const { data } = await supabase.from('payments').select();
```

## 8. Data Flow Architecture

### Request Flow

```
User Action → Screen Component → API Layer → Supabase → Response
                ↓                    ↑
            Validation           Transform
                ↓                    ↑
            Local State          Error Handle
```

### Data Transformation Pattern

```typescript
// In API layer - transform external to internal
export const teamApi = {
  async getTeam(id: string): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .select('*, members:team_members(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Transform data shape
    return {
      ...data,
      memberCount: data.members?.length || 0,
      isActive: data.status === 'active',
    };
  },
};
```

## 9. Error Handling Architecture

### Global Error Boundary

```typescript
// /app/_layout.tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <ShScreenContainer>
      <ShText variant="error">Something went wrong</ShText>
      <ShText>{error.message}</ShText>
      <ShButton title="Try again" onPress={resetErrorBoundary} />
    </ShScreenContainer>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Stack>
        {/* Routes */}
      </Stack>
    </ErrorBoundary>
  );
}
```

### API Error Handling

```typescript
// Consistent error handling in API layer
export const apiWrapper = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error('API Error:', error);

    // Transform Supabase errors
    if (error.code === 'PGRST116') {
      throw new Error('Record not found');
    }

    throw error;
  }
};
```

## 10. List Rendering

### Using FlatList (Expo/React Native)

```typescript
import { FlatList } from 'react-native';
import { ShListItem, ShSpacer } from '@top/components';

<FlatList
  data={items}
  renderItem={({ item }) => <ShListItem item={item} />}
  keyExtractor={item => item.id}
  ItemSeparatorComponent={() => <ShSpacer size="small" />}
  ListEmptyComponent={() => <ShText>No items found</ShText>}
  refreshing={isRefreshing}
  onRefresh={handleRefresh}
/>
```

### Image Loading with Expo

```typescript
import { Image } from 'expo-image';

// Expo Image component (preferred)
<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  contentFit="cover"
  transition={200}
/>
```

## 11. TypeScript Architecture

### Type Definition Structure

```typescript
// /types/database.ts - Generated from Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          created_at: string;
        };
        Insert: Omit<Row, 'id' | 'created_at'>;
        Update: Partial<Insert>;
      };
      // Other tables...
    };
  };
}

// Component-specific types
export type User = Database['public']['Tables']['users']['Row'];
```

### Strict Type Usage

```typescript
// Props typing
interface ScreenProps {
  route: {
    params: {
      id: string;
    };
  };
}

// API return types
async function getUser(id: string): Promise<User> {
  // Implementation
}

// Event handlers
const handlePress = (event: GestureResponderEvent) => {
  // Handle
};
```

## 12. Build & Deployment Architecture

### Environment Configuration

```typescript
// Environment variables in /.env file
EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=[YOUR_STRIPE_KEY]

// Usage in code - /lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Build Commands

```json
{
  "scripts": {
    "start": "expo start",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "build:ios": "eas build --platform ios",
    "build:android": "eas build --platform android"
  }
}
```

## Appendices

### A. Key Pattern Files

- `/app/events/create-event.tsx` - Navigation pattern
- `/components/ShButton/ShButton.tsx` - Component pattern
- `/lib/api/users.ts` - API pattern
- `/contexts/UserContext.tsx` - Context pattern
- `/stores/paymentFormStore.ts` - Zustand store pattern

### B. Common Imports

```typescript
// Components - each on its own line
import {
  ShButton,
  ShText,
  ShIcon,
  ShSpacer,
  ShScreenContainer,
  ShFormFieldEmail,
  ShFormFieldPassword,
} from '@top/components';

// Config
import { colorPalette } from '@cfg/colors';
import { spacing } from '@cfg/spacing';
import { ShTextVariant } from '@cfg/typography';
import { IconName } from '@cfg/icons';
import { Routes } from '@cfg/routes';

// Hooks
import { useUser } from '@ctx/UserContext';

// Stores (Zustand)
import { usePaymentFormStore } from '@stores/paymentFormStore';

// API
import { userApi } from '@lib/api/users';

// Navigation
import { router } from 'expo-router';
```

### C. Development Workflow

1. Check Figma design
2. Identify needed components
3. Use existing patterns
4. Follow API layer
5. Test both platforms
6. Verify no regressions
7. Commit with clear message
