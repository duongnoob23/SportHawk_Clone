# Front End (UI/UX) Specification: SportHawk MVP

**Version:** 1.2 **Date:** 2025-07-20 **Status:** Revised for Updated Architectural Requirements

## 1\. Introduction

This document defines the user experience goals, information architecture, and user flows for the SportHawk MVP's user interface. Its purpose is to provide a clear and comprehensive guide for the development of the **mobile-only (iOS & Android) first release**, ensuring the platform is user-centric, intuitive, and aligns with the project objectives outlined in `prd.md (v1.3)`.

**This document is a companion to the Master Figma Project, which is the absolute source of truth for all visual design, component states, layouts, and styling.**

- **Visual Source of Truth (Figma):** `https://www.figma.com/design/dIIasoS5kk6Ewc4zRD1B9c/v4-SportHawk-Screens?node-id=659-2&t=YK5JldQiMuNnrj3r-1`
- **Figma Screen Index:** `_all-screens-titles-and-figma-ids.md`
- **Mandatory Style Guide:** `ad-expo-react-native-style-guide.md`

## 2\. Overall UX Goals & Principles

### 2.1. Target User Personas (MVP Focus)

- **Sarah (Club Admin):** Needs efficiency and overview for club management.
- **John (Team Admin/Coach):** Needs streamlined event, squad, and payment management.
- **Parent Pat (Member/Parent):** Needs clear information, easy payment, and simple availability tracking for their child.
- **Player Paul (Member):** Needs quick access to schedules and simple interactions.
- **General User:** Needs to discover clubs and express interest easily.

### 2.2. Key Usability Goals

- **Ease of Learning:** Volunteers should quickly understand core tasks on the mobile apps.
- **Efficiency of Use:** Common tasks should be achievable with minimal steps.
- **Error Prevention & Recovery:** Guide users to avoid mistakes and easily correct them.
- **Clarity of Information:** Schedules, availability, and payments must be unambiguous.
- **Trust & Reliability:** Users must feel confident in the platform's security and reliability.

### 2.3. Core Design Principles

- **Mobile-Native First (iOS & Android for MVP):** Design for an optimal native mobile experience.
- **Simplicity & Focus:** Prioritize clarity, avoiding unnecessary complexity.
- **Action-Oriented Design:** Make it obvious what users can do to complete their goals.
- **Clear Communication & Feedback:** The system must provide immediate feedback for all actions.
- **Empower Volunteers:** Genuinely reduce administrative burden.
- **Accessibility by Design:** Strive for WCAG 2.1 AA compliance.

## 3\. Information Architecture (IA) (Mobile MVP Focus)

### 3.1. Screen Inventory

The complete list of screens is defined by the contents of the **Master Figma Project**. The `_all-screens-titles-and-figma-ids.md` file serves as a textual index to these screens, mapping screen titles to their unique Figma IDs. Developers MUST refer to Figma for the visual and structural definition of each screen.

### 3.2. Navigation Structure (Mobile MVP)

- **Primary Navigation (Mobile):** A **Bottom Tab Bar**, implemented using \*\*Expo \*\*, with 5 tabs: Home, Teams, Explore, Alerts, and Profile.
- **Secondary Navigation:**
  - **Top Navigation** within sections (like the main application views and modal screens) \*\*MUST be implemented using Expo \*\*.
  - A Dropdown will be used for team selection within the "Teams" section.
  - A Floating Action Button (FAB) will be available for Team Admins to initiate creation tasks.
  - Contextual menus ("3 Dots") will be used for actions on detail screens.

## 4\. User Flows (Mobile MVP)

Key user flows for the MVP include:

1. **New User Onboarding & Team Discovery:** From app launch to successfully expressing interest in a team.
2. **Member Event & Payment Cycle:** From receiving an event notification to setting availability and completing a related payment request.
3. **Team Admin Event Management:** From creating an event to tracking availability and announcing the final squad.

(Detailed flow diagrams can be referenced in the Figma project or developed as needed.)

## 5\. Wireframes & Mockups (Visual Source of Truth)

**The Master Figma Project is the single, non-negotiable source of truth for all wireframes, mockups, and visual specifications.** The development goal is a "pixel perfect" implementation of the designs contained within.

- **Master Figma Project:** `https://www.figma.com/design/dIIasoS5kk6Ewc4zRD1B9c/v4-SportHawk-Screens?node-id=659-2&t=YK5JldQiMuNnrj3r-1`
- **Figma Screen Index:** `_all-screens-titles-and-figma-ids.md`

## 6\. Component Library / Design System Reference

UI components MUST be developed according to the component-based architecture defined in the `front-end-architecture.md` and `ad-expo-react-native-style-guide.md`.

- **Visual Definition:** The visual and stylistic definition of all components is contained within the **Master Figma Project**.
- **Component Suggestions:** The `components.md`, `authentication-screens-as-components.md`, and `home_screens_as_components edited.md` files provide a conceptual basis for the component library that needs to be implemented.

## 7\. Branding & Style Guide Reference

All branding elements and visual styling are defined in the **Master Figma Project**. Global style values (colors, fonts, spacing units) will be defined in the `/app/global/` directory for use within component stylesheets.

## 8\. Change Log

| Version | Date       | Author           | Change Description                                                                                                           |
| :------ | :--------- | :--------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2025-05-30 | Design Architect | Initial generation based on previous project documents.                                                                      |
| 1.1     | 2025-07-06 | UX Expert        | Updated with Figma IDs and refined content.                                                                                  |
| 1.2     | 2025-07-20 | BMad_v4_4        | Reworked to establish Figma as the absolute visual SoT, removed obsolete file refs, and mandated Expo navigation components. |
