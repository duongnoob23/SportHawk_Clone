# Technology Stack and Design System Integration

**Version:** 1.0  
**Date:** 2025-09-03  
**Status:** Active

## Overview

This document defines the technology stack for SportHawk MVP and critical integration patterns between design and code.

## Core Technology Stack

### Frontend Framework

- **React Native** with **Expo** (SDK 51)
- **TypeScript** for type safety
- **Expo Router** for file-based navigation

### State Management

- **React Context** for global state
- **Zustand** for complex state management
- **React Query** for server state (future)

### Backend Services

- **Supabase** for backend infrastructure
  - Authentication
  - PostgreSQL database
  - Real-time subscriptions
  - Storage for files

### Payment Processing

- **Stripe** for payment processing
- **Stripe Connect** for marketplace payments

### Development Tools

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** compiler for type checking

## Design System Integration

### Figma to Code Workflow - CRITICAL

**MANDATORY PROCESS for implementing any UI:**

#### 1. Design Extraction Protocol

Before writing ANY UI code:

```typescript
// Step 1: Get the Figma node code
mcp__figma-dev-mode-mcp-server__get_code(nodeId: "559:2954")

// Step 2: Extract semantic variable definitions
mcp__figma-dev-mode-mcp-server__get_variable_defs(nodeId: "559:2954")
// Returns semantic names like:
// - "Primary Gold": #eabd22
// - "Body Text": Font(family: 'Inter', style: Regular, size: 16)
// - "Subheading Text": Font(family: 'Inter', style: Medium, size: 20)

// Step 3: Get visual reference
mcp__figma-dev-mode-mcp-server__get_image(nodeId: "559:2954")
```

#### 2. Semantic Mapping Requirements

**ALL Figma semantic names MUST map to our config:**

| Design Element | Figma Tool          | Our Config File         | Example Mapping                                 |
| -------------- | ------------------- | ----------------------- | ----------------------------------------------- |
| Colors         | `get_variable_defs` | `/config/colors.ts`     | "Primary Gold" → `colorPalette.primaryGold`     |
| Text Styles    | `get_variable_defs` | `/config/typography.ts` | "Body Text" → `ShTextVariant.Body`              |
| Spacing        | `get_code`          | `/config/spacing.ts`    | padding: 16 → `spacing.md`                      |
| Components     | `get_code`          | Component props         | Button/Primary → `<ShButton variant="primary">` |

#### 3. Implementation Rules

**NEVER hardcode values from Figma:**

```typescript
// ❌ WRONG - Direct from Figma
color: '#eabd22';
fontSize: 16;
fontWeight: '500';

// ✅ CORRECT - Mapped to config
color: colorPalette.primaryGold;
fontSize: fontSizes.body;
fontWeight: fontWeights.medium;
```

### Design Token Architecture

#### Color System

```typescript
// /config/colors.ts
export const colorPalette = {
  // Semantic colors (NOT raw hex values)
  primaryGold: '#eabd22', // Figma: "Primary Gold"
  baseDark: '#1a1a1a', // Figma: "Base Dark"
  lightText: '#eceae8', // Figma: "Light Text"
  stoneGrey: '#9e9b97', // Figma: "Stone Grey"

  // Component-specific
  surface: '#2a2a2a',
  borderInputField: '#3a3a3a',

  // State colors
  error: '#ff4444',
  success: '#00aa00',
};
```

#### Typography System

```typescript
// /config/typography.ts
export enum ShTextVariant {
  Heading1 = 'heading1', // Figma: "Heading Text"
  SubHeading = 'subheading', // Figma: "Subheading Text"
  Body = 'body', // Figma: "Body Text"
  Small = 'small', // Figma: "Small Text"
  Label = 'label', // Figma: "Label Text"
}

export const fontSizes = {
  heading1: 28, // Must match Figma
  subheading: 20, // Must match Figma
  body: 16, // Must match Figma
  small: 14, // Must match Figma
};
```

### Component Property Mappings

#### From Figma Properties to Component Props

| Figma Property      | Detection Method    | Component Implementation         |
| ------------------- | ------------------- | -------------------------------- |
| Required field (\*) | Visual in design    | `required` prop on form fields   |
| Disabled state      | Layer opacity/color | `disabled` or `editable={false}` |
| Loading state       | Presence of spinner | `loading` prop                   |
| Error state         | Red color/border    | `error` prop with message        |
| Read-only           | Background color    | `ShFormFieldReadOnly` component  |

### Design Verification Tools

#### MCP Figma Integration

The project uses Model Context Protocol (MCP) for Figma integration:

```typescript
// Available MCP tools for design verification:
mcp__figma - dev - mode - mcp - server__get_code; // Extract component code
mcp__figma - dev - mode - mcp - server__get_variable_defs; // Get semantic names
mcp__figma - dev - mode - mcp - server__get_image; // Visual reference
mcp__figma - dev - mode - mcp - server__get_metadata; // Structure overview
```

**CRITICAL:** Always use these tools to verify implementation matches design.

## API Architecture

### API Layer Pattern

```typescript
// /lib/api/payments.ts
export const paymentsApi = {
  async create(data: PaymentRequest) {
    // Implementation
  },
  async getById(id: string) {
    // Implementation
  },
};
```

### Supabase Integration

- **NEVER** import Supabase directly in screens
- **ALWAYS** use API layer abstraction
- **Use** TypeScript types generated from database

## Navigation Architecture

### File-Based Routing (Expo Router)

```
/app
  /(auth)
    sign-in.tsx
    sign-up.tsx
  /(tabs)
    index.tsx
    teams.tsx
  payments/
    create-payment.tsx
    [id].tsx
```

### Navigation Patterns

- **Stack Navigator** for screen flows
- **Tab Navigator** for main navigation
- **Modal presentation** for overlays

## Build and Deploy

### Development Commands

```bash
npm start           # Start Expo dev server
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run lint       # Run ESLint
npx tsc --noEmit   # TypeScript check
```

### Environment Configuration

```typescript
// Using Expo's environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_KEY;
```

## Performance Considerations

### Image Optimization

- Use **expo-image** for optimized image loading
- Implement lazy loading for lists
- Cache images appropriately

### Bundle Size

- Use dynamic imports where appropriate
- Tree-shake unused code
- Monitor bundle size with Metro bundler

## Testing Strategy

### Component Testing

- **Jest** for unit tests
- **React Native Testing Library** for component tests
- **Detox** for E2E testing (future)

### Design Compliance Testing

```typescript
// Verify against Figma before PR:
1. Extract Figma semantic names
2. Verify all mapped correctly
3. Visual comparison with get_image
4. Check responsive behavior
```

## Security Considerations

### Authentication

- JWT tokens stored securely
- Biometric authentication support
- Session management via Supabase

### Data Protection

- No sensitive data in code
- Environment variables for secrets
- Secure storage for user data

## Documentation Requirements

### Code Documentation

- TypeScript interfaces for all props
- JSDoc comments for complex functions
- README files for major features

### Design Documentation

- Map all Figma components to code components
- Document semantic name mappings
- Maintain design token changelog

## Migration and Updates

### Design System Updates

When Figma designs change:

1. Re-run semantic extraction
2. Update config mappings
3. Verify all usages
4. Test visual regression

### Technology Updates

- Follow Expo SDK upgrade guides
- Test on both platforms after updates
- Update TypeScript definitions

## Troubleshooting

### Common Integration Issues

| Issue                    | Solution                             |
| ------------------------ | ------------------------------------ |
| Figma colors don't match | Re-extract with `get_variable_defs`  |
| Component props missing  | Check component TypeScript interface |
| Navigation not working   | Verify Expo Router setup             |
| Styles not applying      | Check semantic name mapping          |

## Summary

The tech stack is optimized for:

- **Rapid development** with Expo and TypeScript
- **Design consistency** via Figma integration
- **Maintainability** through strict patterns
- **Scalability** with proper architecture

**Remember:** Every UI implementation MUST start with Figma semantic extraction!
