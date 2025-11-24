# Accessibility Requirements for Members Stories

## Screen Reader Support

### MEM-001: Explore Map

- **Search input**: Label "Search for clubs"
- **Filter buttons**: Announce selected sport
- **Club cards**: Read as "Club name, Location, X members, button"
- **Map markers**: Accessible labels with club names
- **Bottom sheet**: Announce "X clubs nearby"

### MEM-002: Club Details

- **Tab navigation**: Announce active tab and available tabs
- **Team cards**: Read as "Team name, Age group, Gameplay level, button"
- **View All button**: Clear action "View all teams"
- **Images**: Alt text for club logos and hero images

### MEM-003: Team Details

- **Join button**: Announce state changes (enabled/disabled/pending)
- **Stats cards**: Read label and value pairs
- **Map**: Provide text alternative for location

### MEM-004: Members List

- **Section headers**: Announce "Admins section" and "Members section"
- **Member cards**: Read "Name, Role, button"
- **Empty state**: Clear message when no members

### MEM-005: Join Request

- **Dialog**: Focus trap when open
- **Buttons**: Clear labels for Cancel/Continue
- **Success/Error**: Announce alerts to screen reader

## Keyboard Navigation

- All interactive elements reachable via keyboard
- Tab order follows visual flow
- Escape key closes dialogs
- Enter/Space activate buttons

## Visual Accessibility

### Color Contrast

- Text on dark backgrounds: Minimum 4.5:1 ratio
- Primary gold (#F5C842) on dark: Already meets WCAG AA
- Error states: Use icons plus color

### Text Sizing

- Support Dynamic Type on iOS
- Minimum touch targets: 44x44 points
- Readable at 200% zoom

### Motion

- Respect "Reduce Motion" settings
- No auto-playing animations
- Smooth but not disorienting transitions

## Testing Tools

- iOS: VoiceOver
- Android: TalkBack
- React Native: Accessibility Inspector
- Automated: react-native-a11y-tests

## Implementation Guidelines

```typescript
// Example: Accessible button
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Join First Team Football"
  accessibilityRole="button"
  accessibilityState={{ disabled: isDisabled }}
  accessibilityHint="Sends join request to team admin"
>

// Example: Screen reader only text
<Text accessibilityElementsHidden={!isScreenReaderEnabled}>
  {members.length} members in this team
</Text>

// Example: Grouped content
<View
  accessible={true}
  accessibilityLabel={`${club.name}, ${club.location}, ${club.memberCount} members`}
>
```
