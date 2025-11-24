# Architecture Document: SportHawk MVP

**Version:** 1.4 **Date:** 2025-07-20 **Status:** Revised for Updated Architectural Requirements

## Introduction / Preamble

This document outlines the overall project architecture for the SportHawk MVP, including backend systems leveraging Supabase, shared services, and non-UI specific concerns. Its primary goal is to serve as the guiding architectural blueprint, ensuring consistency and adherence to chosen patterns and technologies as mandated by `prd.md (v1.5)`.

The SportHawk MVP's **initial release will target native iOS and Android applications**, built using the Expo SDK. Web application support is deferred to post-MVP.

**Relationship to Frontend Architecture:** Detailed frontend architecture is specified in `front-end-architecture.md`. Core technology stack choices documented herein are definitive for the entire project.

## Technical Summary

The SportHawk MVP architecture utilizes a serverless approach with Supabase as the central BaaS provider. The frontend for the initial MVP release is a cross-platform mobile application (iOS & Android) built with Expo (React Native). The system is developed within a Monorepo structure. The architecture prioritizes leveraging Supabase's integrated services to meet the MVP's functional requirements and tight development timeline for the mobile-only first release.

## High-Level Overview

The SportHawk MVP employs a Serverless architecture built upon the Supabase BaaS platform. The entire project is organized within a Monorepo structure.

graph TD

    User\["Sports Club User (Admin, Member, Enthusiast)"\] \--|\>|Uses via iOS, Android (MVP)| SportHawkApp\["SportHawk Application (Expo SDK \- React Native)"\]

    SportHawkApp \--|\>|Interacts via Supabase Client SDK & HTTP API| SupabaseBaaS\["Supabase BaaS Platform"\]

    subgraph SupabaseBaaS

        direction LR

        SupabaseAuth\["Auth Service"\]

        SupabaseDB\["PostgreSQL Database (RLS)"\]

        SupabaseStorage\["File Storage"\]

        SupabaseFunctions\["Edge Functions (Deno/TS)"\]

        SupabaseRealtime\["Realtime Service"\]

    end

    SupabaseFunctions \--|\>|API Calls| Stripe\["Stripe Connect API"\]

    SupabaseFunctions \--|\>|API Calls| ExpoPushService\["Expo Push Notification Service"\]
