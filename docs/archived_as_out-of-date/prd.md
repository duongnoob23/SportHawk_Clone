# Product Requirements Document (PRD): SportHawk MVP

**Version:** 1.5 **Date:** 2025-07-20 **Status:** Revised for Updated Architectural Requirements

## 1\. Goal, Objective and Context

**Overall Goal:** SportHawk aims to be the ultimate hub for sports communities. For the MVP, the goal is to validate that an integrated platform can significantly reduce administrative overhead for volunteer-run grassroots sports clubs and enable enthusiasts to easily connect with and participate in club activities on mobile platforms.

**Core Problem:** Grassroots sports clubs, often reliant on volunteers (like the pilot club, Fremington FC), face significant administrative burdens in managing schedules, player availability, payments, and communications. This leads to inefficiency and volunteer stress. Simultaneously, potential and existing members often struggle to find consolidated club/team information and streamlined joining processes. The core problem is the inefficiency stemming from a lack of integration between club management tools and enthusiast discovery/engagement platforms.

**MVP Objectives (Target: Friday, June 13th, 2025):**

- **Simplify Club Organisation:** Demonstrate that SportHawk can significantly simplify event scheduling (including squad selection/announcement), availability tracking, and basic one-off payment handling for the pilot football teams (initially Fremington FC's \~18-20 teams) via its mobile applications.
- **Facilitate Initial Discovery & Connection:** Enable enthusiasts (initially existing members/parents of pilot clubs) to successfully discover participating pilot clubs/teams via a map feature on the mobile apps, view basic information ('About', 'People' screens), and "Express Interest" in joining, thereby generating initial connections through the platform.
- **Validate Core Concept & Usability:** Gain positive feedback from initial club admins and enthusiasts from pilot clubs using the mobile applications, confirming the platform is intuitive, addresses their core needs for management and information access respectively, and validates the integrated approach and chosen technology stack for mobile.

**Context:** The MVP focuses on Fremington FC as the pilot club. It will provide essential tools for Club and Team Admins to manage operations and for Users/Members to access information, manage participation, and express interest in joining, all through dedicated mobile applications. The platform for the **initial MVP release will be accessible via native mobile applications for iOS and Android (built with Expo)**. Web application access is deferred to post-MVP. This PRD defines what needs to be built for the mobile-only MVP, serving as the source of truth for the solo developer and any future architectural considerations. The successful delivery of the MVP by June 13th is critical for alignment with the pilot club's pre-season starting July 1st.

## 2\. Success Metrics (MVP)

The success of the SportHawk MVP will be measured against the following initial metrics, primarily gathered from the Fremington FC pilot group using the mobile applications within the first month post-launch:

- **For Goal 1 (Simplify Club Organisation):**
  - Admin satisfaction score \>4.0 (on a 1-5 scale) regarding ease of use for event scheduling, availability tracking, and payment tools, captured via post-MVP survey.
  - 75% of pilot teams actively use the scheduling and payment features at least once per week during a typical 4-week period post-launch.
  - Task completion rate of \>90% for core admin functions (event creation, squad announcement, payment request) by pilot admins.
- **For Goal 2 (Facilitate Discovery & Connection):**
  - Generate at least 10 "Expressions of Interest" through the platform for Fremington FC teams within the first month post-MVP launch.
  - Enthusiast (player/parent) satisfaction score \>4.0 (on a 1-5 scale) regarding ease of finding their club/team information and setting availability, captured via post-MVP survey.
- **For Goal 3 (Validate Core Concept & Usability):**
  - Overall user satisfaction rating \>4.0 (on a 1-5 scale) from a combined pool of pilot admins and enthusiasts.
  - User retention rate of \>60% for registered pilot users.
  - Collect and analyze qualitative feedback from at least 10 pilot users, identifying \>3 key strengths and \<5 critical areas for immediate improvement.

## 3\. Functional Requirements (MVP)

The MVP will deliver the following core functionalities through its **native iOS and Android applications**. All UI implementations must be a "pixel perfect" match to the visual designs in Figma.

**A. Platform Access & Core User Management:**

- **Multi-Platform Access (MVP Scope):** The application must be accessible as: Native iOS App (via Expo), Native Android App (via Expo). (Web Application support is deferred to post-MVP).
- User Registration (Initial): Users must be able to initiate registration using: Email address & password (collecting First Name, Last Name, DOB (\>=16), Sex), Google Sign-In, or Apple Sign-In.
- New social sign-up users will proceed to a screen to collect First Name, Last Name, DOB (\>=16), Sex.
- Email Verification (OTP): All new users must verify their email address by entering a 6-digit One-Time Password (OTP).
- User Onboarding Wizard (Post-Verification): A multi-step wizard for all new, verified users to provide profile photos, share interests, and grant optional OS permissions.
- User Login: Registered and verified users must be able to log in using their original sign-up method.
- User Profiles: Users will have a profile displaying their information and can edit it.
- Password Reset: Users can reset a forgotten password via an email that deep-links into the app.
- User Logout: Authenticated users can log out, terminating their session.
- Welcome Screen: First screen for new/logged-out users with video visuals and registration/login options.
- Super Admin Capabilities: Foundational tools for SportHawk Admin including user impersonation and a seed.sql script.

**B. Organisation & Team Management (Admin Focused):** _(Functionality as per original PRD)_

**C. Event Management (Single Events for MVP):** _(Functionality as per original PRD)_

**D. Payments (One-Off Requests with Stripe Integration):** _(Functionality as per original PRD)_

**E. Discovery, Connection & Initial Engagement:** _(Functionality as per original PRD)_

**F. Communication (Push Notifications) & User Preferences:** _(Functionality as per original PRD)_

## 4\. Non Functional Requirements (MVP)

- **Usability:** Intuitive, consistent UI for native mobile apps (iOS, Android). The visual implementation MUST be a "pixel perfect" match to the Figma designs.
- **Performance:** Responsive mobile app (ideally \<2-3s for most ops). Efficient data handling for the pilot club load. Smooth map interaction on mobile.
- **Reliability:** Core functions available. Data integrity. Graceful error handling. Supabase provides infrastructure reliability.
- **Security:** Secure user authentication (Supabase Auth). Role-based authorization (Supabase RLS). Secure data handling and payment processing (Stripe).
- **Maintainability:** Well-organized codebase (Expo/TS, Supabase Functions/TS) strictly following the `ad-expo-react-native-style-guide.md`. Version control (Git).
- **Scalability (MVP Context):** Architecture (Supabase, Expo) should not prevent future scaling.
- **Platform & Device Support (MVP Scope):** The **latest stable Expo SDK** (at the time of writing, v53.0.0). Native mobile apps for recent major iOS and Android OS versions.
- **Deployment:** Expo EAS Build for native mobile binaries.
- **Support (MVP):** End-user support direct by SportHawk project owner.

## 5\. User Interaction and Design Goals

- **Visual Source of Truth:** The **Master Figma Project** is the single source of truth for all visual design, styles, components, colors, and typography. The goal is a "pixel perfect" implementation of these designs. The `_all-screens-titles-and-figma-ids.md` file serves as the index to correlate screen names with their corresponding Figma IDs.
- **Overall Vision & Experience:** SportHawk aims to provide a modern, clean, user-friendly, and professional digital environment on its mobile platforms that is efficient and enjoyable.
- **Key Interaction Paradigms (Mobile Focus):**
  - Mobile-Native First Design.
  - Clear Calls to Action (CTAs).
  - Intuitive Navigation: \*\*Bottom navigation MUST use Expo \*\*. \*\*Top navigation MUST use Expo \*\*.
  - Task-Oriented Flows.
- **Core Screens/Views:** All screens identified in `_all-screens-titles-and-figma-ids.md` are in scope.
- **Accessibility Aspirations (MVP):** Adherence to basic accessibility principles for mobile applications.
- **Target Devices/Platforms (MVP Scope):** Native Mobile: iOS and Android (via Expo).

## 6\. Technical Assumptions

- **Core Technology Stack:** The **latest stable Expo SDK** (at the time of writing, v53.0.0), React Native, TypeScript, Supabase (PostgreSQL, Auth, Storage, Functions), Stripe. **`expo-video` MUST be used for video playback.**
- **Repository & Service Architecture:** Monorepo (Expo app \+ Supabase functions). Serverless Functions within a BaaS model.
- **Development Methodology & Tools:** A strong component-based architecture is required. Screen files in `/app` must be simple compositions of reusable `Sh...` components. Styling and logic must be encapsulated within these components. The `ad-expo-react-native-style-guide.md` is mandatory.
- **Testing Requirements (Summary):** Unit testing (Jest, 70-80%), Integration testing (App-Supabase), Manual testing of all ACs on all mobile platforms, and UAT with Fremington FC. **Test-Driven Development (TDD) is not a requirement.**

## 7\. Epic Overview

_(Epic goals and story summaries remain as per the original PRD. All UIs implied are for the mobile applications and must match the Figma designs.)_

- Epic 1: Project Foundation, Core Authentication, User Profiles, Home Screen Shell & Super Admin Setup
- Epic 2: Club & Team Structure Management (Admin Focus)
- Epic 3: Core Event Management & Availability Tracking (Single Events for MVP)
- Epic 4: Payment Request Management & Processing (Stripe Integration)
- Epic 5: Discovery, Connection & Initial Engagement
- Epic 6: Notifications Framework & User Preferences

## 8\. Key Reference Documents

- **`project_brief.md`**
- **`business_analysis.md`**
- **Master Figma Project:** The visual source of truth.
- **`_all-screens-titles-and-figma-ids.md`**: The index for Figma screens.
- **`ad-expo-react-native-style-guide.md`**: The mandatory coding and style guide.
- Component suggestion files: `components.md`, `authentication-screens-as-components.md`, `home_screens_as_components edited.md`.

## 9\. Out of Scope for MVP (Mobile-Only First Release)

_(As per original PRD)_

- Web Application (via Expo).
- Full Recurring Events system, advanced payments, in-app Stripe onboarding, etc.

## 10\. Change Log

| Change Description                                                                                 | Date       | Version | Author      |
| :------------------------------------------------------------------------------------------------- | :--------- | :------ | :---------- |
| Initial PRD Draft for SportHawk MVP                                                                | 2025-05-17 | 1.0     | PM (Gemini) |
| Adjusted scope to mobile-only; updated UI doc references                                           | 2025-05-30 | 1.2     | PM (John)   |
| Reworked to align with new requirements: Figma as SoT, removed TDD, updated technical assumptions. | 2025-07-20 | 1.3     | BMad_v4_4   |
| Updated Expo SDK version to 53.0.0.                                                                | 2025-07-20 | 1.4     | BMad_v4_4   |
| Clarified Expo SDK requirement to "latest stable" with current version as reference.               | 2025-07-20 | 1.5     | BMad_v4_4   |
