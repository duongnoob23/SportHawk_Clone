# Frontend Architecture Document: SportHawk MVP

**Version:** 1.6 **Date:** 2025-07-20 **Status:** Revised for Updated Architectural Requirements

## Introduction

This document details the technical architecture specifically for the frontend of the SportHawk **MVP native mobile applications (iOS & Android)**. It is the primary technical blueprint for developers and AI agents. It complements the main `architecture.md (v1.4)` and the `front-end-spec.md (v1.2)`.

The goal is a **"pixel perfect" implementation of the Figma designs**, built upon a strict, reusable component model and adhering to all mandated technologies and coding standards.

- **Visual Source of Truth (Figma):** `https://www.figma.com/design/dIIasoS5kk6Ewc4zRD1B9c/v4-SportHawk-Screens?node-id=659-2&t=YK5JldQiMuNnrj3r-1`
- **Mandatory Style Guide:** `ad-expo-react-native-style-guide.md`
- **Mandatory Navigation:** `expo-router` with `Expo Stack` and `Expo Tabs`.
- **Mandatory Project Structure:** Source code MUST reside in `/app`.

## Overall Frontend Philosophy & Patterns

- **Framework & Core Libraries:**
  - The application will be built using the **latest stable Expo SDK (at the time of writing, targeting v53.0.0)**, which utilizes React Native and TypeScript (`~5.4.x`).
  - This choice enables cross-platform development, with the MVP first release targeting **native iOS and Android**.
  - **Navigation:** Handled exclusively by **Expo Router (`~3.5.0`)**. Top navigation (headers, modals) \*\*MUST use Expo \*\*. Bottom navigation \*\*MUST use Expo \*\*.
  - **Video:** **`expo-video` (`~1.2.0`) MUST be used for all video playback.** `expo-av` is forbidden.
- **Component Architecture (CRITICAL):**
  - A strict, modular, component-based approach is mandatory.
  - **Screen files within `/app` MUST be simple compositions of reusable components.** They should contain minimal to no inline styling or complex logic.
  - **All custom visual components MUST be prefixed with "Sh"** (e.g., `ShButton`, `ShFormFieldEmail`).
  - Styling, business logic, and state management related to a component's function MUST be encapsulated within that component's directory.
  - The `components.md`, `authentication-screens-as-components.md`, and `home_screens_as_components edited.md` files serve as conceptual guides for the component library to be built.
- **State Management Strategy:**
  - React Context API for localized, subtree state.
  - Zustand is an option for complex global state (e.g., user session).
  - Local component state (`useState`, `useReducer`) is the default.
- **Styling Approach:**
  - Styling will be implemented using React Native's `StyleSheet.create()` objects within each component's directory.
  - Global theme values (colors, fonts, spacing) are defined in `/app/global/` and imported into component stylesheets.

## Detailed Frontend Directory Structure

The project **MUST** use the following `expo-router` compliant folder structure. The `src` directory is not used for application code.

/

├── app/ \# MANDATORY: Expo Router source code for all screens and layouts

│ ├── (auth)/ \# Route group for authentication screens (e.g., SignIn.tsx, SignUp.tsx)

│ ├── (tabs)/ \# Route group for main app screens behind the tab bar

│ │ ├── \_layout.tsx \# Defines the Expo Tabs bottom navigator

│ │ └── home.tsx \# Example screen for the 'home' tab

│ ├── \_layout.tsx \# Root layout, manages auth state and defines root Expo Stack navigator

│ └── index.tsx \# App entry point (Welcome screen)

├── assets/ \# Static assets (images, icons, videos, fonts)

├── components/ \# Globally reusable UI Components

│ ├── ui/ \# Base UI elements (e.g., ShButton, ShText)

│ └── layout/ \# Layout components (e.g., ShHeaderBar, ShBottomNav)

├── contexts/ \# React Context providers

├── global/ \# Global values (constants.ts, colors.ts, typography.ts)

├── hooks/ \# Globally reusable custom React Hooks

├── lib/ \# Library configurations (e.g., supabaseClient.ts)

└── ... \# Other root level config files
