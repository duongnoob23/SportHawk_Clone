# **Project Overview: SportHawk MVP(Minimum Viable Product on 25 screens)**

**Project** is a mobile application designed to …

## **Purpose**

…

## **Core Workflow**

- App Admin registers Clubs in the App database with their Stripe account id, and sets up Teams in the Club via SupaBase.

- Adults (initially over 18\) interested in sport, initially Football, can Sign Up (register an account) to explore to find Clubs and request to join Teams; Team Admins accept or reject requests.

- Team Members pay via Stripe (using Stripe's "destination charge" whereby the entire amount paid by the Team Member goes to the Club's Stripe account and SportHawk is charged for the transaction ) payments raised by Team Admins, for things like Annual Fees, Red/Yellow Card Fines, Travel.

- Team Admins will create Events, e.g. a football match with details, and invite Team Members; invited Team Members will respond with availability; Team Admins select the squad (those who will play).

- Push notifications get sent on various triggers: request for payment, reminder of payment, paying a payment, invited to event, reminder of event, responding to event, selected for squad.

## **Key Features**

- Team Admin

## **Optional Add-ons**

- None for MVP

- Additional product development to be covered by another MVP

## **Target Users**

- People who want to play sports with Teams at Clubs

- Club Admins, e.g. Treasurer

- Team Admins, e.g. coaches and captains

- Team Members, people paying an Annual Free to play in a Team at a Club

- App Admins

# **Full Feature & Module Listing**

## **User Modules & Features**

### **User Account Management**

- **User Registration / Login**
  - Email and password, with OTP verify

  - Forgot password and password change

- ## **…**

### **Payment Journey**

- Create/Edit/Delete Payments (Team Admins only):
  - Set amount, due date, and identify all who have to pay.

- View Payments to be made (Team Members):
  - …

- Pay Payments (Team Members):
  - …

- View Payment History (Team Members):
  - …

- View Payments and their Status (Team Admins):
  - …

  - …

### **\<other_modules_and_features\>**

-

## **Optional Future Add-ons Phase 2**

To be described in a future PRD.

## **Recommended Technology Stack**

| Layer              | Example Tech                          |
| :----------------- | :------------------------------------ |
| Mobile App         | Expo & React Native (TypeScript)      |
| Backend API        | Supabase BaaS                         |
| Database           | PostgreSQL in SupaBase                |
| Storage            | SupaBase                              |
| Authentication     | SupaBase, Email & Password            |
| Payment            | Stripe API, NB "destination charging" |
| Push Notifications | Firebase \+ Expo                      |
| Mapping            | Google Maps                           |
| Crashlytics        | FireBase Crashlytics                  |
| Hosting            | Expo                                  |
