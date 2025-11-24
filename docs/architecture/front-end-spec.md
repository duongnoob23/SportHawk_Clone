# Front-End Specification: SportHawk MVP

**Version:** 2.0  
**Date:** 2025-09-03  
**Status:** Active - Brownfield Implementation  
**Project State:** ~10% Complete with Core Design System Implemented

## 1. Introduction

This document specifies the front-end implementation approach for the SportHawk MVP brownfield project. It documents the ACTUAL IMPLEMENTED design system and provides specifications for extending it.

### Key Principles

- **Figma is Truth**: All visual design comes from Figma
- **Config-Driven**: All values from configuration files
- **Component-Based**: UI built with Sh\* components
- **Pattern Consistency**: Follow established patterns

## 2. Design System Implementation

### Visual Source of Truth

**Master Figma Project**: The ONLY source for visual design

- Node IDs map to screen implementations
- Design tokens match config values
- Component states defined in Figma
- Spacing, colors, typography all from Figma

### Figma to Code Workflow

1. **Access Figma via MCP**

```typescript
// Step 1: Get the code for the node
mcp__figma-dev-mode-mcp-server__get_code(nodeId: "559:2954")

// Step 2: CRITICAL - Extract semantic style names
mcp__figma-dev-mode-mcp-server__get_variable_defs(nodeId: "559:2954")
// Returns: {"Subheading Text": "Font(...)", "Primary Gold": "#eabd22"}
```

2. **Map Figma Style Names to Config**

**Text Style Mapping:**
| Figma Style Name | ShTextVariant | Usage |
|-----------------|---------------|-------|
| Subheading Text | ShTextVariant.SubHeading | Screen titles, section headers |
| Body Text | ShTextVariant.Body | Default text content |
| Small Text | ShTextVariant.Small | Help text, captions |
| Label Text | ShTextVariant.Label | Form field labels |
| Light Text | ShTextVariant.Light | Placeholder text |

**Color Style Mapping:**
| Figma Style Name | Config Value | Usage |
|-----------------|--------------|-------|
| Primary Gold | colorPalette.primary | CTA buttons, highlights |
| Base Dark | colorPalette.background | Screen backgrounds |
| Stone Grey | colorPalette.textSecondary | Muted text |
| Light Text | colorPalette.textPrimary | Primary text |

3. **Implement Using Sh Components with Style Names**

```typescript
import { ShTextVariant } from '@cfg/typography';

// ❌ WRONG - Using raw values
<ShText style={{ fontSize: 20, fontWeight: '500' }}>Title</ShText>

// ✅ CORRECT - Using Figma style name mapping
<ShText variant={ShTextVariant.SubHeading}>Title</ShText>
```

## 3. Component Library Specification

### Component Categories

#### Core UI Components

| Component  | Purpose           | Config Dependencies      |
| ---------- | ----------------- | ------------------------ |
| ShButton   | Touchable actions | buttons.ts, colors.ts    |
| ShText     | Text display      | typography.ts, colors.ts |
| ShIcon     | Icon display      | icons.ts, colors.ts      |
| ShSpacer   | Vertical spacing  | spacing.ts               |
| ShCheckbox | Boolean input     | colors.ts, spacing.ts    |

#### Form Components

| Component           | Purpose      | Validation   |
| ------------------- | ------------ | ------------ |
| ShFormFieldEmail    | Email input  | Email regex  |
| ShFormFieldPassword | Secure text  | Min length   |
| ShFormFieldName     | Name input   | Required     |
| ShFormFieldText     | Single line  | Optional     |
| ShFormFieldTextArea | Multi line   | Max length   |
| ShFormFieldDate     | Date picker  | Min/max date |
| ShFormFieldTime     | Time picker  | Format       |
| ShOTPInput          | 6-digit code | Numeric only |

#### Layout Components

| Component         | Purpose         | Usage       |
| ----------------- | --------------- | ----------- |
| ShScreenContainer | Screen wrapper  | All screens |
| ShNavItem         | Navigation item | Menu items  |
| ShTextWithLink    | Inline links    | Terms, etc  |

### Component Structure Pattern

```typescript
// Standard component structure
interface ShComponentProps {
  // Required props
  variant?: keyof typeof configVariants;

  // Optional props with defaults
  size?: 'small' | 'medium' | 'large';

  // Event handlers
  onPress?: () => void;

  // Style overrides (rarely used)
  style?: StyleProp<ViewStyle>;
}

export function ShComponent({
  variant = 'default',
  size = 'medium',
  ...props
}: ShComponentProps) {
  // Get config values
  const colors = colorPalette;
  const spacing = spacingConfig;

  // Build styles from config
  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors[variant],
      padding: spacing[size],
      // NO MAGIC VALUES
    }
  });

  return (
    <View style={styles.container}>
      {/* Component content */}
    </View>
  );
}
```

## 4. Screen Composition Patterns

### Standard Screen Structure

```typescript
// /app/feature/screen.tsx
import {
  ShScreenContainer,
  ShText,
  ShButton,
  ShSpacer
} from '@top/components';

export default function FeatureScreen() {
  return (
    <ShScreenContainer>
      <ShText variant="heading">Screen Title</ShText>
      <ShSpacer size="medium" />

      {/* Screen content using Sh components */}

      <ShButton
        variant="primary"
        onPress={handleAction}
        title="Action"
      />
    </ShScreenContainer>
  );
}
```

### Navigation Configuration

#### Stack Navigation (Top)

```typescript
<Stack.Screen
  name="screen-name"
  options={{
    title: "Screen Title",
    headerStyle: {
      backgroundColor: colorPalette.background,
    },
    headerTintColor: colorPalette.white,
    // Custom actions if needed
    headerLeft: () => <CustomComponent />,
  }}
/>
```

#### Tab Navigation (Bottom)

```typescript
<Tabs.Screen
  name="tab-name"
  options={{
    tabBarLabel: 'Label',
    tabBarIcon: ({ color, size }) => (
      <ShIcon name={IconName.Home} color={color} size={size} />
    ),
  }}
/>
```

## 5. Styling System

### Configuration Files

#### colors.ts

```typescript
export const colorPalette = {
  // Primary colors
  primary: '#eabd22', // Gold
  primaryDark: '#d4a91f', // Darker gold

  // Base colors
  background: '#161615', // Dark background
  surface: '#1e1e1d', // Card background

  // Text colors
  textPrimary: '#ffffff', // White text
  textSecondary: '#a0a0a0', // Gray text

  // Semantic colors
  error: '#ff4444',
  success: '#00c851',
  warning: '#ffbb33',

  // UI colors
  border: '#333333',
  divider: '#2a2a2a',
};
```

#### typography.ts

```typescript
export const fontSizes = {
  tiny: 10,
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
  huge: 32,
};

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.8,
};
```

#### spacing.ts

```typescript
export const spacing = {
  // Base spacing
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  huge: 48,

  // Component specific
  buttonPaddingH: 20,
  buttonPaddingV: 12,
  cardPadding: 16,
  screenPadding: 20,

  // Borders
  borderWidthThin: StyleSheet.hairlineWidth,
  borderWidthNormal: 1,
  borderWidthThick: 2,

  // Radius
  borderRadiusSmall: 4,
  borderRadiusMedium: 8,
  borderRadiusLarge: 12,
  borderRadiusRound: 9999,
};
```

### Style Application Rules

1. **NEVER use inline literal values**

```typescript
// ❌ WRONG
<View style={{ padding: 16, backgroundColor: 'white' }}>

// ✅ CORRECT
<View style={{
  padding: spacing.medium,
  backgroundColor: colorPalette.white
}}>
```

2. **Use StyleSheet.create for performance**

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.screenPadding,
    backgroundColor: colorPalette.background,
  },
});
```

3. **Compose styles when needed**

```typescript
<View style={[
  styles.base,
  isActive && styles.active,
  customStyle
]}>
```

## 6. Form Handling Patterns

### Standard Form Implementation

```typescript
import {
  ShFormFieldEmail,
  ShFormFieldPassword,
  ShButton,
} from '@top/components';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    // Validation
    const newErrors = {};
    if (!email) newErrors.email = 'Required';
    if (!password) newErrors.password = 'Required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API call via API layer
    try {
      await authApi.signIn(email, password);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <>
      <ShFormFieldEmail
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />

      <ShFormFieldPassword
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />

      <ShButton
        variant="primary"
        title="Sign In"
        onPress={handleSubmit}
      />
    </>
  );
}
```

## 7. Responsive Design

### Screen Size Handling

```typescript
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Breakpoints
const isSmallDevice = screenWidth < 375;
const isMediumDevice = screenWidth >= 375 && screenWidth < 414;
const isLargeDevice = screenWidth >= 414;

// Responsive values
const dynamicPadding = isSmallDevice ? spacing.small : spacing.medium;
```

### Platform-Specific Styling

```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: colorPalette.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

## 8. Animation Patterns

### Basic Animations

```typescript
import { Animated } from 'react-native';

export function ShAnimatedComponent() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Content */}
    </Animated.View>
  );
}
```

## 9. Accessibility Requirements

### Component Accessibility

```typescript
<ShButton
  title="Submit"
  accessibilityLabel="Submit form"
  accessibilityHint="Double tap to submit the form"
  accessibilityRole="button"
/>

<ShText
  accessibilityRole="header"
  accessibilityLevel={1}
>
  Page Title
</ShText>
```

### Screen Reader Support

- All interactive elements have labels
- Images have descriptions
- Form fields have error announcements
- Navigation changes are announced

## 10. Performance Guidelines

### Image Optimization

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  contentFit="cover"
  transition={200}
  placeholder={blurhash}
/>
```

### List Optimization

```typescript
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={renderItem}
  estimatedItemSize={100}
  keyExtractor={item => item.id}
/>
```

### Memoization

```typescript
const MemoizedComponent = React.memo(({ data }) => {
  return <ShText>{data.title}</ShText>;
}, (prevProps, nextProps) => {
  return prevProps.data.id === nextProps.data.id;
});
```

## 11. Testing Approach

### Testing Environment

- **Platforms**: iOS and Android phones only
- **Orientation**: Portrait mode only
- **Devices**: Physical devices (not simulators)
- **Performed by**: QA team after developer submission

### Visual Testing Checklist

- [ ] Matches Figma design exactly
- [ ] All text uses typography config
- [ ] All colors from palette
- [ ] All spacing from config
- [ ] No magic values
- [ ] Portrait orientation correct
- [ ] iOS phone appearance correct
- [ ] Android phone appearance correct

### Interaction Testing

- [ ] All buttons respond to press
- [ ] Forms validate correctly
- [ ] Navigation works
- [ ] Error states display
- [ ] Loading states show
- [ ] Empty states handled
- [ ] Portrait-only orientation lock working

## 12. Common Patterns Reference

### Loading State

```typescript
if (isLoading) {
  return (
    <ShScreenContainer>
      <ActivityIndicator size="large" color={colorPalette.primary} />
    </ShScreenContainer>
  );
}
```

### Error State

```typescript
if (error) {
  return (
    <ShScreenContainer>
      <ShText variant="error">{error.message}</ShText>
      <ShButton title="Retry" onPress={retry} />
    </ShScreenContainer>
  );
}
```

### Empty State

```typescript
if (data.length === 0) {
  return (
    <ShScreenContainer>
      <ShIcon name={IconName.Empty} size="large" />
      <ShText>No items found</ShText>
    </ShScreenContainer>
  );
}
```

## Appendices

### A. Component Quick Reference

| Need   | Use Component     | Import From     |
| ------ | ----------------- | --------------- |
| Button | ShButton          | @top/components |
| Text   | ShText            | @top/components |
| Input  | ShFormField\*     | @top/components |
| Space  | ShSpacer          | @top/components |
| Icon   | ShIcon            | @top/components |
| Screen | ShScreenContainer | @top/components |

### B. Config Quick Reference

| Need    | Import                 | From            |
| ------- | ---------------------- | --------------- |
| Colors  | colorPalette           | @cfg/colors     |
| Spacing | spacing                | @cfg/spacing    |
| Fonts   | fontSizes, fontWeights | @cfg/typography |
| Icons   | IconName               | @cfg/icons      |

### C. Pattern Examples

- Form: `/app/(auth)/sign-in.tsx`
- List: `/app/teams/[id]/members.tsx`
- Navigation: `/app/events/create-event.tsx`
- API Usage: `/app/user/profile.tsx`
