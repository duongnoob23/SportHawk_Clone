# App Architecture \- Code Style \- Developer Guidelines \- Sep'2025

## Summary

The SportHawk App is now a BROWNFIELD project as about 10% of the screens are done atop a core structure, particularly the main components of the Design System of the UI.

This is the fifth attempt to use BMad to drive development, other attempts have failed for a variety of reasons. In this attempt the key principles to be used are:

- Extending a core working App
- Develop one, or a few, screens/pages then build and test, before continuing, effectively one story at a time and NOT YOLO mode
- Enhance the App one EPIC at a time for which a design document will be provided that covers infrastructure, user flow and correlates to Figma node IDs.
- Develop the App to be readily debuggable with built in console logs and error traps
- Avoid local styling in the App screens/pages by using the components and global config
- Avoid magic values buried in code, instead use values pre-defined by name in global config, or add new named values in the global config
- Abide by the UI and UX design (described below)
- Avoid direct database access in the App screen/pages, instead use existing API's defined in /lib/api or develop new API's in the same folder
- Using Claude Code, behaving as a Senior Developer for development, spending 70% effort on thinking and research before 30% effort on coding; if there is an error or fault, to do a root cause analysis, including searching the web for similar issues, and presenting a plan and await confirmation to continue.
- Do not alter or break existing working code.
- Use the coding practices shown by the existing App, if not defined then use Expo, SupaBase and React Native best practice, if that doesn't cover it then stop and ask.

The BMad documents from the previous attempt are in: /docs/archived_as_out-of-date , and include the old: [prd.md](http://prd.md), [architecture.md](http://architecture.md), [front-end-spec.md](http://front-end-spec.md), [front-end-architecture.md](http://front-end-architecture.md)

## UI

The entire UI look of the SportHawk App is wholly defined in Figma, with a few variations that will be explicitly specified.

The design of the screen flows will reference Figma node IDs.

The Figma screens are based on a "Design System" in Figma, which constrains to a few named variants:

- Color palette
- Text styles
- Buttons
- Icons

This Figma "Design System" has been replicated in the App using a combination of named global values in config files and core components, including:

- /config/colors \- to restrict colors to a small set of named variants that correlate with Figma
- /config/icons \- to restrict the iconography to set of named graphics that correlate with Figma
- /config/spacing \- a large set of named spacing values to avoid "magic values"
- /config/typography \- to restrict text to a small set of named variants that define all aspects of the font usage and correlate with Figma
- /config/buttons \- to restrict buttons to a very small set of named variants that correlate with Figma

Claude Code can use MCP to access the screens and pages in Figma and should look beyond the detail (e.g. font, size, weight etc.) to find the named variant in Figma and correlate that name to what's defined in the App.

The App top navigation should use the Expo \<Stack\> component possibly with custom left and right actions as necessary (as per /app/events/create-event.tsx).

The App bottom navigation should use the Expo \<Tabs\> components.

## Components

The JSX/TSX in the screens should be made as simple as is practical using named components that are imported.

The project uses "Sh" as the prefix to all its visual components

The components are made available using "barrel pattern" and abbreviations for directories in /tsconfig.json, so that the screens/pages can import in this pattern:

import {  
 ShText,  
 ShButton,  
 ShFormFieldEmail,  
 ShFormFieldPassword,  
 ShSpacer,  
 ShLogoAndTitle,  
} from '@top/components';

The existing components by category are:

Core UI Components

- ShButton \- Touchable button that triggers actions
- ShText \- Text display with configurable size and style from globals
- ShIcon \- Display named icons or logos with positioning and styling
- ShSpacer \- Vertical spacing using named values from globals
- ShCheckbox \- Checkbox input component

Authentication & Welcome

- ShWelcomeVideo \- Welcome video player with opacity overlay
- ShWelcomeLogo \- Welcome screen logo component
- ShWelcomeContentWrapper \- Container for welcome screen content
- ShLogoAndTitle \- Combined logo and "SportHawk" title display

Form Fields

- ShFormFieldEmail \- Email input with validation
- ShFormFieldPassword \- Password input (hidden) with validation
- ShFormFieldName \- Name input with validation
- ShFormFieldText \- Single-line text input
- ShFormFieldTextArea \- Multi-line text input
- ShFormFieldDate \- Date picker with min/max validation
- ShFormFieldDateTime \- Combined date and time picker
- ShFormFieldTime \- Time picker input
- ShFormFieldChoice \- Multiple choice field with buttons
- ShFormFieldEventType \- Event type selector
- ShFormFieldLocation \- Location input field
- ShOTPInput \- One-time password input field

Navigation & Layout

- ShScreenContainer \- Screen container component
- ShNavItem \- Navigation item component
- ShTextWithLink \- Text with embedded clickable links

User & Team Components

- ShAvatar \- User avatar display
- ShUserList \- List of users display
- ShMemberListItem \- Team member list item
- ShTeamListItem \- Team list item display
- ShProfileTabs \- Profile screen tab navigation

Content Display

- ShPostCard \- Complete post card with header, content, and interactions
- ShMapView \- Map view component
- ShPlayingTimes \- Playing times display
- ShStatsCard \- Statistics card display
- ShTeamStatsInfo \- Team statistics information display

Components must be used in the screens/pages

## Project Level Guidelines

Keypoints

- Use TypeScript
- Avoid "magic" values
- **ICON USAGE \- CRITICAL**:
  - **NEVER** use string literals for icon names (e.g., "mail-check", "chevron-left")
  - **ALWAYS** use IconName enum from configuration (e.g., IconName.VerifyEmail)
  - If an icon doesn't exist in IconName enum, STOP and request it to be added
  - Do NOT proceed with string literals as a temporary solution
- **NO TODO COMMENTS \- CRITICAL**:
  - **NEVER** leave TODO comments in code without explicit user permission
  - **NEVER** mark development as complete with outstanding TODOs
  - If functionality cannot be implemented, ask for permission before adding TODO
  - Provide clear justification why code cannot be implemented immediately
  - All functionality must be fully implemented or explicitly deferred with user approval
- Use Expo Router, with the main app entry point defined in package.json as: "main": "expo-router/entry". All strings for routes to be defined in /config/routes.ts
- **NAVIGATION RULES \- CRITICAL**:
  - **TOP NAVIGATION**: MUST use Expo Stack component
  - **BOTTOM NAVIGATION**: MUST use Expo Tabs component
  - **IMPORTANT**: IGNORE top navigation bars shown in Figma designs \- Stack handles this automatically
  - Let Stack navigation handle all header bars, back buttons, and navigation gestures
  - Configure Stack.Screen options for titles, headerShown, etc. instead of custom implementations
- Where practical use Expo components
- Use expo-video DO NOT use expo-av

# Folder structure

Main top level folders, with abbreviation (starting "@") defined in /tsconfig.json, and brief description:

- / , @top, root of the project
- /app , @app, for the source code for the screens/pages
- /assets , @ass, for images, icons, videos, fonts etc.
- /components , @cmp, for visual components
- /contexts , @ctx, for application contexts
- /config , @cfg, for global values such as constants, colors, and some high level style settings
- /hooks , @hks, for hooks
- /lib , @lib, for libraries to access 3rd parties, e.g. APIs, supabase
- /types , @typ, for TypeScript type definitions /utils

## Notifications

Notification delivery to Android and iOS phones will be done using Edge functions in Supabase. The App will insert a row into a SupaBase table that includes the user id (UUID), Supabase Edge functions will take care of delivering the message to the user's phone.

## React and JSX

When writing React components, place your declarations and static methods near the top, followed by the constructor and lifecycle methods, followed by the render method and methods it calls, and other methods.

## Boolean names

If it helps, consider naming Boolean variables with “is” or a similar verb at the beginning. Sometimes the names of Boolean variables can ambiguously describe an object (or program state) or reference an object, and using verbs like “is”, “was”, and “did” help communicate the variable’s purpose.

// AMBIGUOUS

console.log(history.deleted);

// CLEAR

console.log(history.isDeleted);

## UX

We will provide a design document for the UX, user flow, for each EPIC that gets added to the App.
