# Architecture Addendum: V4 Implementation Approach

**Version:** 1.0  
**Date:** 2025-08-11  
**Status:** Active  
**Parent Document:** architecture.md (v1.4)

## Purpose

This addendum supplements the main architecture document with V4-specific implementation details based on lessons learned from V3's failure. It defines the tactical approach to realizing the architecture described in the parent document.

## Architectural Principles for V4

### 1. Component-Driven Architecture

**Principle**: UI components are the atomic unit of development.

**Implementation**:

- Each component is self-contained with its own styles and logic
- Components are discovered from Figma designs, not invented
- Component specifications are documented before creation
- Shared components are identified and reused across screens

**Component Hierarchy**:

```
Atomic Components (Sh prefix)
  ├── ShText
  ├── ShButton
  ├── ShIcon
  └── ShSpacer

Molecular Components
  ├── ShFormFieldEmail (uses ShText, ShIcon)
  ├── ShFormFieldPassword
  └── ShLogoAndTitle

Screen Components
  ├── ShScreenContainer
  └── ShWelcomeContentWrapper

Screens (in /app)
  └── Composition of components only
```

### 2. Configuration-Driven Styling

**Principle**: No magic values anywhere in the codebase.

**Implementation**:

```typescript
// All values centralized
/config/
  ├── colors.ts      // ColorName type, colorPalette
  ├── spacing.ts     // Spacing constants
  ├── typography.ts  // Text variants and sizes
  └── buttons.ts     // Button variants and styles

// Usage enforcement
- ESLint rules to catch inline values
- Code review rejection for magic values
- Component props accept config types only
```

### 3. Figma-First Design System

**Principle**: Figma is the single source of truth for UI.

**Implementation**:

- Every screen has a Figma node ID
- Components are derived from Figma analysis
- Design tokens extracted from Figma
- Pixel-perfect implementation required

**Figma Integration via MCP**:

```
1. Fetch design → 2. Analyze components → 3. Generate specs → 4. Build components
```

### 4. Progressive Enhancement

**Principle**: Build incrementally with continuous testing.

**Implementation Stages**:

```
Stage 1: Component in isolation
  └── Test in Storybook/Design System view

Stage 2: Screen assembly
  └── Test in Expo Go

Stage 3: Flow integration
  └── Test complete user journey

Stage 4: Production deployment
  └── TestFlight/Play Store release
```

## Technical Architecture Refinements

### Frontend Architecture (Mobile-First)

**Screen Lifecycle**:

```typescript
// 1. Route Definition (file-based)
/app/(auth)/SignIn.tsx

// 2. Screen Composition
import { ShComponents } from '@top/components';
import { config } from '@cfg/config';

// 3. Data Fetching
const { data } = useSupabase();

// 4. Render with Components
return <ShScreenContainer>...</ShScreenContainer>;
```

**State Management Strategy**:

- Local state for form inputs
- UserContext for auth state (centralized Supabase auth)
- useUser hook for accessing auth in components
- Supabase real-time for shared data
- AsyncStorage for preferences

### Component Architecture

**Component Structure**:

```
/components/ShButton/
  ├── ShButton.tsx       # Component implementation
  ├── ShButton.types.ts  # TypeScript interfaces
  ├── ShButton.test.tsx  # Component tests
  └── index.ts          # Barrel export
```

**Component Documentation**:

```
/docs/screen-components/
  └── [sequence]-[screen].md
      ├── Figma Analysis
      ├── Required Components
      ├── Props & Configuration
      └── Implementation Notes
```

### Data Flow Architecture

**Request Flow**:

```
Mobile App → UserContext → Supabase Client SDK → Supabase Services
                                                   ├── Auth
                                                   ├── Database (RLS)
                                                   ├── Storage
                                                   └── Edge Functions
```

**Authentication Flow**:

```
Screen → useUser Hook → UserContext → Supabase Auth
         ↓                ↓
         Get user state   Manage session
         Trigger actions  Handle tokens
```

**Real-time Updates**:

```
Database Change → Supabase Realtime → Mobile Subscription → UI Update
```

### Navigation Architecture

**Expo Router Structure**:

```
/app/
  ├── _layout.tsx          # Root layout (Stack + UserProvider)
  ├── index.tsx           # Welcome screen
  ├── (auth)/            # Auth group
  │   ├── _layout.tsx    # Auth layout (uses UserContext)
  │   ├── SignIn.tsx     # Uses useUser hook
  │   └── SignUp.tsx     # Uses useUser hook
  └── (tabs)/            # Main app
      ├── _layout.tsx    # Tab layout (protected by UserContext)
      ├── home.tsx       # Uses useUser for user info
      ├── teams.tsx      # Uses useUser for permissions
      └── profile.tsx    # Uses useUser for profile data
```

## Implementation Patterns

### Screen Implementation Pattern

```typescript
// Standard screen structure
export default function ScreenName() {
  // 1. Hooks (navigation, auth, etc.)
  const router = useRouter();
  const { user, userSignIn, userSignOut } = useUser();

  // 2. Local state
  const [loading, setLoading] = useState(false);

  // 3. Data fetching
  const { data, error } = useSupabaseQuery();

  // 4. Handlers
  const handleSubmit = async () => {
    // Use Supabase client
  };

  // 5. Render with Sh components only
  return (
    <ShScreenContainer>
      <ShHeader />
      <ShContent>
        {/* Composed from Sh components */}
      </ShContent>
    </ShScreenContainer>
  );
}
```

### Component Creation Pattern

```typescript
// Standard component structure
interface ShComponentProps {
  variant?: ShComponentVariant;
  color?: ColorName;
  onPress?: () => void;
  // ... other typed props
}

export const ShComponent: React.FC<ShComponentProps> = ({
  variant = ShComponentVariant.Default,
  color = 'textLight',
  onPress,
  ...props
}) => {
  // Use configuration values
  const styles = getStyles(variant, colorPalette[color]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {/* Component implementation */}
    </TouchableOpacity>
  );
};
```

### Data Access Pattern

```typescript
// Supabase query pattern
const fetchTeamData = async (teamId: string) => {
  const { data, error } = await supabase
    .from('teams')
    .select(
      `
      *,
      team_members (
        user_id,
        role,
        users (
          first_name,
          surname,
          avatar_url
        )
      )
    `
    )
    .eq('id', teamId)
    .single();

  if (error) throw error;
  return data;
};
```

## Quality Assurance Architecture

### Automated Checks

**Pre-commit Hooks**:

```json
{
  "hooks": {
    "pre-commit": [
      "npm run lint", // No magic values
      "npm run type-check", // TypeScript validation
      "npm run test:unit" // Component tests
    ]
  }
}
```

**Continuous Integration**:

- Build verification on each commit
- Expo Go compatibility check
- Component screenshot tests

### Manual Verification

**Component Review**:

1. Figma comparison
2. Configuration usage
3. TypeScript types
4. Export structure

**Screen Review**:

1. Component composition
2. Navigation flow
3. Data integration
4. Expo Go testing

## Deployment Architecture

### Build Pipeline

```
Development → Expo Go Testing → EAS Build → TestFlight/Internal Testing → Production
```

### Environment Configuration

```typescript
// Environment-specific configs
const ENV = {
  dev: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL_DEV,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY_DEV,
  },
  staging: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL_STAGING,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY_STAGING,
  },
  production: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
};
```

## Performance Considerations

### Mobile Optimization

- Lazy loading of screens
- Image optimization with expo-image
- Minimal bundle size
- Efficient list rendering

### Data Optimization

- Selective field queries
- Pagination for lists
- Optimistic updates
- Cache management

## Security Architecture

### Client Security

- No sensitive data in code
- Environment variables for keys
- Secure storage for tokens
- Certificate pinning

### API Security

- Row Level Security (RLS)
- JWT validation
- Rate limiting
- Input sanitization

## Monitoring Architecture

### Error Tracking (Firebase Crashlytics)

- Firebase Crashlytics integration for crash reporting
- Real-time crash alerts and dashboards
- Automatic crash grouping and analysis
- User impact metrics
- Error boundaries for React components
- Custom error logging to Crashlytics
- Breadcrumb trails for debugging

### Analytics (Firebase Analytics)

- Firebase Analytics for user behavior tracking
- Custom event tracking for key actions
- User journey and funnel analysis
- Screen view tracking
- User properties and audiences
- Conversion tracking
- Retention metrics
- Integration with Firebase console for insights

### Implementation

```typescript
// Firebase initialization
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getCrashlytics } from 'firebase/crashlytics';

const firebaseConfig = {
  // Config from Firebase console
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const crashlytics = getCrashlytics(app);

// Track custom events
analytics.logEvent('sign_up_completed', {
  method: 'email',
  team_sort: 'men',
});

// Log errors to Crashlytics
crashlytics.recordError(error);
```

## Future Considerations

### Post-MVP Architecture

- Web application support
- Offline capabilities
- Push notification service
- Advanced caching

### Scalability Planning

- Microservices migration path
- CDN integration
- Database sharding strategy
- Multi-region deployment

## Conclusion

This addendum provides the tactical implementation details for V4 while maintaining alignment with the strategic architecture defined in the parent document. The key innovation is the component-first, documentation-driven approach that ensures quality and maintainability while preventing the issues encountered in V3.

## Change Log

| Date       | Version | Changes                                | Author            |
| ---------- | ------- | -------------------------------------- | ----------------- |
| 2025-08-11 | 1.0     | Initial addendum for V4 implementation | BMad Orchestrator |
