# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Prompt Logging Requirement

**IMPORTANT**: Append all user input prompts to `/private-prompt-log.md` for the user's archive. This is NOT for Claude to reference - use CLAUDE.md, LESSONS_LEARNED.md, and /docs for guidance. Simply append each prompt with timestamp.

## Project Overview

SportHawk is a React Native Expo application (v4) built with TypeScript. It's a sports-focused mobile app with user authentication, video content, and a custom component library.

## Development Commands

```bash
# Start development server
npm start

# Run on specific platforms
npm run ios
npm run android

# Lint the codebase
npm run lint

### This app is NOT for the web

## Architecture

### Tech Stack
- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router (file-based routing in `/app` directory)
  - **CRITICAL NAVIGATION RULES**:
    - **TOP NAVIGATION**: MUST use Expo Stack component exclusively - NO custom back buttons
    - **BOTTOM NAVIGATION**: MUST use Expo Tabs component exclusively
    - **NEVER** implement custom back buttons (TouchableOpacity with chevron icons, etc.)
    - **IGNORE** top navigation bars shown in Figma designs - Stack handles this automatically
    - Configure Stack.Screen options for navigation instead of custom implementations
- **Language**: TypeScript with strict mode enabled
- **Authentication**: Supabase client
- **Styling**: React Native StyleSheet with centralized color palette

### Project Structure
- `/app` - Expo Router pages and layouts
  - `(auth)` - Authentication screens (SignIn, SignUp, VerifyEmail)
  - `(design)` - Design system showcase screens
  - `_layout.tsx` - Root layout with Stack navigation
- `/components` - Reusable UI components (all prefixed with "Sh")
- `/config` - Configuration files (colors, typography, spacing, buttons, icons)
- `/lib` - External service integrations (Supabase)
- `/assets` - Static assets (images, icons, videos)

### Path Aliases
The project uses TypeScript path aliases configured in `tsconfig.json`:
- `@top/*` → Root directory
- `@ass/*` → `/assets/*`
- `@cmp/*` → `/components/*`
- `@cfg/*` → `/config/*`
- `@ico/*` → `/assets/icons/*`
- `@icx/*` → `/assets/icons/icons_export_2025-06-07/*`
- `@ctx/*` → `/contexts/*`
- `@hks/*` → `/hooks/*`

### Component Naming Convention
All custom components are prefixed with "Sh" (e.g., ShButton, ShText, ShIcon) and exported through barrel exports in `/components/index.ts`.

### Color System
Centralized color palette in `/config/colors.ts` with TypeScript type safety using `ColorName` type. Primary theme color is gold (#eabd22) with a dark base (#161615).

### Environment Variables
Supabase configuration requires:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## SENIOR DEVELOPER PROTOCOL - MANDATORY STOPS

Before ANY action, you MUST:
1. STATE: "STOP 1: What exactly is the error message telling me?"
2. STATE: "STOP 2: What have I verified vs assumed?"
3. STATE: "STOP 3: What would I check BEFORE changing code?"
4. Get explicit approval: "May I proceed with [specific action]?"

If you skip these STOPs, the user will restart the conversation.

## MANDATORY RESEARCH PROTOCOL - FOR ALL FIXES

**THIS APPLIES TO EVERYTHING - NOT JUST NAVIGATION**

### Three Strikes Rule
1. **First failed attempt**: Document what you didn't research
2. **Second failed attempt**: STOP and research comprehensively
3. **Third failed attempt**: User will restart conversation

### Before ANY Fix Attempt:
1. **RESEARCH FIRST (MANDATORY)**:
   - Search for known issues with WebSearch
   - Check official documentation
   - Look for existing patterns in codebase
   - Verify framework/library behavior
   - DO NOT trial-and-error code

2. **VISUAL EVIDENCE PROTOCOL**:
   - When user provides screenshot/image: EXAMINE IT CAREFULLY
   - State what you observe in the image
   - Don't assume - describe what you actually see
   - Match your fix to the visual evidence

3. **FRAMEWORK-SPECIFIC RESEARCH**:
   - Expo Router: Check Expo docs, not React Navigation
   - React Native: Verify platform-specific behavior
   - Supabase: Check API response formats
   - TypeScript: Verify type definitions

4. **ROOT CAUSE ANALYSIS**:
   - Don't fix symptoms - find root causes
   - Check parent components before changing children
   - Verify data flow before adding new fetches
   - Understand existing patterns before creating new ones

5. **PENALTIES FOR SKIPPING RESEARCH**:
   - Wasted time = Document failure in LESSONS_LEARNED.md
   - Trial-and-error attempts = Junior developer behavior
   - Pattern of research skipping = Loss of autonomy

**Example of PROPER approach**:
- Error occurs → Research the exact error → Find documented solution → Implement correctly ONCE

**Example of JUNIOR approach**:
- Error occurs → Try random fixes → Fail multiple times → Frustrate user → Finally research

## MANDATORY BEFORE ANY CODE - STOP AND THINK

Before writing ANY code, you MUST:

### 1. UNDERSTAND THE CONTEXT (10 minutes minimum)
- Read the file you're modifying completely
- Check all files that import it
- Check all files it imports
- Understand the data flow
- Check parent and sibling components
- Look for existing patterns

### 2. CHECK WHAT EXISTS (5 minutes minimum)
- Is this functionality already implemented somewhere?
- Are there existing utilities/helpers?
- What patterns are already established?
- What data is already available in context/props?
- Check if parent/sibling components already fetch needed data

### 3. QUESTION YOUR APPROACH
- Why am I making this change?
- Is there a simpler solution?
- Am I fixing symptoms or root causes?
- Will this break existing functionality?
- Should I share data instead of fetching it multiple times?

### 4. VERIFY ASSUMPTIONS
- Check database schema (types/database.ts)
- Check actual database state (via MCP if needed)
- Test queries before implementing
- Verify environment configuration (.env file)
- Use project ID from .env URL: `https://[PROJECT_ID].supabase.co`

### 5. PENALTIES FOR SKIPPING
- If you skip these steps and waste time, document it in LESSONS_LEARNED.md as a failure
- Each violation reduces trust and requires more explicit instructions
- Pattern of violations indicates junior-level work requiring supervision

## Development Rules

### CRITICAL: No Magic Values Policy
- **NEVER write hardcoded values** - Use config files from the start
  - Colors: Use `colorPalette` from `@cfg/colors`
  - Spacing/sizes: Use `spacing` from `@cfg/spacing`
  - Typography: Use `fontWeights`, `fontSizes` from `@cfg/typography`
  - ANY literal value (numbers, colors, strings) should come from config
- **If a value doesn't exist in config**:
  1. STOP coding immediately
  2. Add it to the appropriate config file with a meaningful name
  3. Only then use it in your component
- **Examples of violations**:
  - ❌ `backgroundColor: 'white'`
  - ✅ `backgroundColor: colorPalette.white`
  - ❌ `borderWidth: 1`
  - ✅ `borderWidth: spacing.borderWidthThin`
  - ❌ `fontWeight: '600'`
  - ✅ `fontWeight: fontWeights.semiBold`

### MANDATORY FIGMA CHECKLIST - MUST DO BEFORE ANY UI CODE
**FIGMA IS THE SOURCE OF TRUTH - ASSUMPTIONS ARE ALWAYS WRONG**

Before writing ANY UI component code, you MUST:
1. **Open Figma design** using MCP tools
2. **Document ALL properties** for EVERY element:
   - Font family, size, weight, line height, letter spacing
   - Colors for ALL states (default, hover, active, disabled)
   - Spacing, padding, margins (exact values)
   - Borders (width, color, radius)
   - Shadows, opacity, any other visual properties
3. **Explicitly state what CHANGES** between states
4. **Explicitly state what STAYS THE SAME** between states
5. **Present this analysis to user** and get approval BEFORE coding
6. **NEVER assume ANY styling** - if Figma doesn't show bold, it's NOT bold

**The Stop and State Protocol**:
When user mentions Figma or provides a node ID:
1. STOP immediately - do not code
2. STATE: "I will now check Figma comprehensively"
3. LIST every property found
4. WAIT for user confirmation before proceeding

**Violations**:
- First assumption = Warning in LESSONS_LEARNED.md
- Second assumption = REPEATED FAILURE
- Third assumption = User should restart conversation

### Mandatory Pre-Completion Checklist
Before declaring ANY task complete, you MUST:
1. **Run linting**: Execute `npm run lint` and fix all issues
2. **Check for magic values**: Review EVERY line of new/modified code
3. **Verify imports**: Ensure all config values are properly imported
4. **Test the changes**: Verify functionality works as expected
5. **Verify against Figma**: Ensure implementation matches design exactly
6. **NEVER declare work "Perfect!" or "Complete!" without these checks**

### Other Development Rules
- **NO TODO COMMENTS**: Never leave TODO comments in code without explicit permission
- **Complete Implementation**: All functionality must be fully implemented before marking as complete
- **No Incomplete Features**: If unable to implement, ask for permission and provide justification
- **ICON USAGE**: Always use IconName enum from configuration, never string literals
  - If icon doesn't exist in enum, STOP and request it to be added
  - Example: Use `IconName.VerifyEmail` not `"mail-check"`
- **AUTHENTICATION ARCHITECTURE**: All user-related Supabase calls MUST be in UserContext
  - NEVER import `supabase` directly in screen components for user/auth operations
  - Always use `useUser()` hook to access authentication state and methods
  - UserContext is the single source of truth for auth state

## Key Dependencies
- `expo-router` - File-based navigation
- `@supabase/supabase-js` - Backend integration
- `expo-video` - Video playback
- `expo-image` - Optimized image handling with SVG support
- `react-native-url-polyfill` - URL polyfill for Supabase

## Expo Configuration
- **Scheme**: `sporthawk`
- **Orientation**: Portrait only
- **Platforms**: iOS, Android, Web
- **EAS Project ID**: `35d580bc-83c3-49e1-812a-3f174507464f`
```
