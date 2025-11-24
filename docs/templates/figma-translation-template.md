# Figma-to-Code Translation Layer Template

**Story:** [STORY-ID] - [Story Title]  
**Figma Node:** [Node ID]  
**Screen Location:** `/app/[path]/[file].tsx`  
**Reference Implementation:** [Existing similar screen]

## 🎯 Component Architecture Analysis

### Step 1: Visual Elements Breakdown

List each distinct visual element from Figma:

1. [Element 1 - e.g., Custom header]
2. [Element 2 - e.g., Title section]
3. [Element 3 - e.g., Content area]
   [Continue for all elements]

### Step 2: Component Mapping

Map each visual element to components:

| Visual Element | Component Needed  | Exists?  | Location/Action |
| -------------- | ----------------- | -------- | --------------- |
| Custom header  | ShCustomHeader    | ❌ No    | Create new      |
| Title section  | ShText + ShSpacer | ✅ Yes   | Use existing    |
| Content card   | ShCard            | ✅ Yes   | Use existing    |
| [Element]      | [Component]       | [Yes/No] | [Action]        |

### Step 3: Missing Components List

Components that need to be created BEFORE implementing the screen:

- [ ] `ShComponentA` - [Brief description]
- [ ] `ShComponentB` - [Brief description]

### Step 4: Config Values Needed

Values to add to /config files:

```typescript
// spacing.ts additions:
export const spacing = {
  ...existing,
  newValue1: 16,
  newValue2: 24,
};

// colors.ts additions:
export const colorPalette = {
  ...existing,
  newColor1: 'rgba(x,x,x,0.x)', // TODO: Add semantic name
};
```

## 📦 Component Specifications

### Component: ShComponentName

```typescript
interface ShComponentNameProps {
  prop1: string;
  prop2?: boolean;
  onAction?: () => void;
}

// Visual requirements:
- Height: [value]
- Background: [color]
- Border: [specification]
- Content: [description]
```

## 🔨 Implementation Plan

### Phase 1: Create Missing Components

1. Create `ShComponentA` in `/components/ShComponentA/`
2. Create `ShComponentB` in `/components/ShComponentB/`
3. Add components to `/components/index.ts`

### Phase 2: Screen Implementation

The screen file should ONLY compose components:

```typescript
// CORRECT - Component composition only
export default function ScreenName() {
  // Business logic here

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colorPalette.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ShScreenContainer>
        <ShComponentA />
        <ShComponentB />
        <ShComponentC />
      </ShScreenContainer>
    </SafeAreaView>
  );
}
```

## ❌ NEVER Include in Screen Files

- NO `StyleSheet.create()`
- NO style objects beyond `{ flex: 1, backgroundColor: colorPalette.background }`
- NO inline styles with multiple properties
- NO magic numbers
- NO color literals
- NO dimension calculations

## ✅ The Acid Test

The screen JSX should read like a story:

- Components only
- Minimal props
- Clear intent
- No styling logic

## 📋 Pre-Implementation Checklist

- [ ] All components identified and mapped
- [ ] Missing components created
- [ ] Config values added
- [ ] Reference implementation studied
- [ ] NO StyleSheet in screen file
- [ ] NO inline styles beyond minimal SafeAreaView
- [ ] Screen is pure component composition

## 🚨 Implementation Notes

[Any specific requirements or warnings for this screen]
