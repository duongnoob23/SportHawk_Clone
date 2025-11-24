# Screen-Component Architecture

## Overview

This document defines the strict separation of concerns between screen files and component files in the SportHawk
application.

## Core Principles

### 1. Screens are Composers

Screen files (`/app/**/*.tsx`) are responsible only for:

- Importing required components
- Configuring navigation (Stack.Screen options)
- Fetching and managing business data
- Handling business logic and events
- Composing components with props

### 2. Components are Renderers

Component files (`/components/**/*.tsx`) are responsible for:

- All visual styling and layout
- Mapping design system tokens to actual styles
- Handling UI state (hover, pressed, etc.)
- Referencing global design tokens from `/globals/*.ts`

### 3. Globals are Design Tokens

Global files (`/globals/*.ts`) contain only:

- Color palette
- Typography definitions
- Common spacing/sizing values
- Shared style objects (buttonStyles, etc.)

## Rules

### ❌ NEVER in Screens:

```tsx
// No StyleSheet in screens
const styles = StyleSheet.create({
  container: { padding: 24 }
});

// No inline styles
<View style={{ marginTop: 20 }}>

// No style objects
const buttonStyle = { backgroundColor: 'red' };

✅ ALWAYS in Screens:

// Use semantic props
<ShScreenContainer variant="scrollable" padding="standard">
  <ShSection spacing="large">
    <ShButton variant="primary" onPress={handleSubmit}>
      Submit
    </ShButton>
  </ShSection>
</ShScreenContainer>

Component Implementation:

// Components own their styles
const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: colors['Base Dark'], // from globals
  },
  // ... other component-specific styles
});

// Components map variants to styles
const getContainerStyle = (variant: string) => {
  switch(variant) {
    case 'scrollable': return styles.scrollContainer;
    case 'centered': return styles.centeredContainer;
    default: return styles.container;
  }
};

Examples

Bad Screen Implementation:

// ❌ /app/clubs/[id]/about.tsx
export default function ClubAboutScreen() {
  const styles = StyleSheet.create({
    container: { padding: 24 },
    loadingContainer: { flex: 1, justifyContent: 'center' },
    errorText: { color: '#ff0000' }
  });

  return (
    <View style={styles.container}>
      {loading && <View style={styles.loadingContainer}>...}
    </View>
  );
}

Good Screen Implementation:

// ✅ /app/clubs/[id]/about.tsx
export default function ClubAboutScreen() {
  return (
    <ShScreenContainer
      isLoading={loading}
      error={error}
      variant="scrollable"
    >
      <ShClubHero club={club} />
      <ShButton variant="primary" onPress={handleAction}>
        Express Interest
      </ShButton>
    </ShScreenContainer>
  );
}

Component Reuse

Before creating new components:
1. Check if existing component can handle the use case
2. Extend with new variants rather than creating new components
3. Ask for guidance when unsure

Example:

Instead of creating ShExpressInterestButton, extend ShButton:
<ShButton
  variant="primary"
  icon="checkmark"
  onPress={handleExpressInterest}
>
  {hasExpressed ? 'Interest Expressed' : 'Express Interest'}
</ShButton>

Enforcement

- Code reviews will reject screens containing StyleSheet definitions
- Components missing proper variant support should be enhanced, not duplicated
- When in doubt, ask: "Should I create new or extend existing?"
```
