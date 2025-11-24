# **Project Overview: SportHawk MVP (Minimum Viable Product \- 25 Screens) (v1.01 2025-09-29)**

**SportHawk** is a mobile application designed to reduce administrative burden for grassroots sports clubs while enabling members to easily connect and participate in club activities.

## **Purpose**

SportHawk aims to be the ultimate hub for sports communities, starting with grassroots football clubs. The platform addresses the significant administrative challenges faced by volunteer-run clubs in managing event scheduling, squad selection, player availability tracking, payment collection, and team communications.

## **Core MVP Workflow**

1. **App Admin** registers Clubs in the App database with their Stripe account id, and sets up Teams in the Club via Supabase.

2. **Adults (initially over 18\)** interested in sport, initially Football, can Sign Up (register an account) to explore to find Clubs and request to join Teams; Team Admins accept or reject requests.

3. **Team Members** pay via Stripe (using Stripe's "destination charge" whereby the entire amount paid by the Team Member goes to the Club's Stripe account and SportHawk is charged for the transaction) payments raised by Team Admins, for things like Annual Fees, Red/Yellow Card Fines, Travel.

4. **Team Admins** will create Events, e.g. a football match with details, and invite Team Members; invited Team Members will respond with availability; Team Admins select the squad (those who will play).

5. **Push notifications** get sent on various triggers: request for payment, reminder of payment, paying a payment, invited to event, reminder of event, responding to event, selected for squad.

## **Target Users**

- **Pilot Club**: Fremington FC (\~18-20 teams, initially one team of 20 Members))
- People who want to play sports with Teams at Clubs
- Club Admins (e.g., Treasurer)
- Team Admins (e.g., coaches and captains)
- Team Members (people paying Annual Fees to play in a Team at a Club)
- App Admins

## **MVP Scope \- 25 Screens**

**Figma Design File**: [SportHawk_2025-07-02](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02) _Note: Design journeys and prototype walkthroughs are documented in Appendix B_

### **Authentication (6 screens)**

- App Loading \- [559-480](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-480)
- Welcome \- [559-467](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-467)
- Sign Up (with OTP verification) \- [559-415](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-415)
- Sign In \- [559-444](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-444)
- Forgot Password \- [559-216](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-216)
- Reset Password \- [559-200](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-200)

### **Profile/Settings (2 screens)**

- Profile (basic info display) \- [559-7103](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-7103)
- Profile Settings (Sign Out, Payment History) \- [559-7013](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-7013)

### **Events Management (8 screens)**

- Events List \- [559-3163](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-3163)
- Create Event \- [559-2816](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2816)
- Event Details \- [559-3117](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-3117)
- Teams Edit Event Dropdown \- [582-8822](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=582-8822)
- Edit Event \- [559-2833](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2833)
- Select Squad \- [559-2853](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2853)
- Edit Squad \- [559-2881](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2881)
- Event Details Squad \- [609-10067](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=609-10067)

### **Payments System (6 screens)**

- Payments List \- [559-3087](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-3087)
- Create Payment Request \- [559-2744](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2744)
- Payment Details (with Stripe integration) \- [559-3055](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-3055)
- Payment History Details \- [559-2792](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2792)
- Teams Edit Payment Dropdown \- [582-8918](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=582-8918)
- Edit Payment \- [559-2709](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2709)

### **Members Management (3 screens \+ 1 bonus)**

- Members List \- [559-3033](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-3033)
- Manage Members \- [559-2682](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2682)
- Add Members \- [559-2661](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2661)
- Manage Team Admins (bonus 26th screen) \- [559-2613](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2613)

### **Discovery (2 screens)**

- Explore Map (Fremington FC minimum) \- [559-5596](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5596)
- Team About (with join functionality) \- [559-5728](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5728)

# **Full Feature & Module Listing**

## **User Account Management**

- **User Registration/Login**
  - Email and password with OTP verification
  - Forgot password and password reset via email link
  - Session management
  - Profile creation and editing
  - Profile picture and background picture upload

## **Payment Journey (Stripe Integration)**

**Stripe Elements Reference**: [Stripe Custom Checkout](https://stripe.com/gb/payments/elements) _Note: Detailed payment lifecycle is documented in Appendix B.2_

### **Create/Edit/Cancel Payments (Team Admins only)**

- Create Payment Request \- Figma [559-2744](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2744)
- Set payment title and description
- Set amount (stored as pence integers)
- Set due date
- Select payment type (Required/Optional)
- Identify team members who need to pay \- Figma [559-3204](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-3204)
- View Stripe account ID (read-only)
- Send payment notifications

### **View Payments (Team Members)**

- Payments List \- Figma [559-3087](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-3087)
- Empty state \- Figma [559-3105](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-3105)
- Filter by: Next 7 days / Next 30 days / All \- default is Next 30 days
- View payment request details
- See payment amount and due date
- Access payment history \- Figma [559-7147](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-7147)
- Payment history detail \- Figma [559-7357](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-7357)

### **Make Payments (Team Members)**

- Payment Details Screen \- Figma [559-3055](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-3055)
- Pay via Stripe Payment Sheet
- Support for card payments
- Support for Apple Pay
- Support for Google Pay
- Receive payment confirmation

### **Payment Management (Team Admins)**

- Admin Payments List \- Figma [559-2776](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2776)
- Payment Details Admin View \- Figma [559-2792](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2792)
- View list of payment requests raised
- See payment status per member (paid/unpaid)
- Send reminder notifications
- Edit payment details \- Figma [559-2709](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2709)
- Cancel payments (with notifications)

## **Team & Member Management**

### **Discovery & Joining**

- Explore Map \- Figma [559-5596](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5596)
- Map-based club discovery
- Search clubs by name, location, sport type
- Club Details \- Figma [559-5678](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5678)
- Teams List \- Figma [559-5817](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5817)
- Team About \- Figma [559-5728](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5728)
- Team Members \- Figma [559-5787](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-5787)
- Express interest in joining teams
- Admin approval workflow

### **Member Administration (Team Admins)**

- Manage Members \- Figma [559-2682](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2682)
- Add Members (process join requests) \- Figma [559-2661](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2661)
- Accept/Ignore join requests
- Add/Remove team members
- Search and filter members
- View member lists
- Send notifications for membership changes

### **Admin Management (Super Admins)**

- Manage Team Admins \- Figma [559-2613](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2613)
- Admin Dashboard \- Figma [559-2966](https://www.figma.com/design/sQdskqCCzOaDSg0J4iHSP1/SportHawk_2025-07-02?node-id=559-2966)
- Appoint team admins
- Remove team admins
- Manage admin permissions

## **Events Module**

### **Event Creation & Management (Team Admins)**

- Create events with type, location, date/time
- Edit event details
- Cancel events
- Send event invitations

### **Squad Management**

- Select squad members
- Edit squad selections
- Notify selected players

### **Member Participation**

- View event invitations
- Respond with availability
- View event details
- Receive event notifications

## **Notification System**

### **Payment Notifications**

- Payment request created
- Payment reminder
- Payment confirmation
- Payment cancelled
- Payment details changed

### **Event Notifications**

- Event invitation
- Event reminder
- Squad selection
- Event changes/cancellation

### **Member Notifications**

- Join request accepted/ignored
- Added/removed from team
- Admin role granted/removed

## **Technical Architecture**

### **Frontend**

- React Native \+ Expo SDK
- TypeScript (strict mode)
- Native iOS and Android apps
- Only for online use
- Sub-3 second app launch
- Sub-2 second API response times

### **Backend**

- Supabase BaaS Platform
- PostgreSQL Database with RLS
- Supabase Auth Service
- Supabase Storage
- Edge Functions (Deno/TypeScript)
- Real-time subscriptions

### **Payment Processing**

- Stripe Connect with Destination Charges
- SportHawk pays transaction fees
- Full amount reaches team accounts

### **Database Schema (Existing)**

Key tables already implemented and used by the app:

**User & Profile Tables:**

- `profiles` \- User profiles linked to auth.users (first_name, last_name, DOB, photo, FCM token)
- `device_tokens` \- Push notification tokens for iOS/Android devices

**Organization Tables:**

- `clubs` \- Club information (name, location, sports, contact details, social links)
- `teams` \- Team details within clubs (sport, training times, home ground)
- `team_members` \- Team membership records with status (active/inactive/suspended)
- `club_admins` \- Club administrator roles and permissions
- `team_admins` \- Team administrator roles (Manager, Coach, etc.)

**Event Tables:**

- `events` \- Event records (matches, training, social events)
- `event_invitations` \- Event invite status tracking
- `event_squads` \- Squad selection for matches

**Payment Tables:**

- `payment_requests` \- Payment records with amount_pence
- `payment_request_members` \- Individual payment tracking
- `payment_transactions` \- Stripe transaction details
- `payment_reminders` \- Reminder history
- `stripe_accounts` \- Team Stripe Connect accounts

**Communication Tables:**

- `notifications` \- In-app/push notifications (see detailed spec below)
- `notification_preferences` \- FUTURE User notification settings
- `notification_queue` \- FUTURE Scheduled notification processing
- `notification_templates` \- FUTURE Message templates
- `broadcast_messages` \- FUTURE Team-wide announcements

**Other Tables:**

- `interest_expressions` \- Join requests for teams
- `team_invitations` \- FUTURE Formal team invitations with tokens
- `admin_logs` \- FUTURE Audit trail for admin actions

### **Notifications Table \- Detailed Specification**

The `notifications` table is central to the push notification system:

**Core Columns:**

- `id` (uuid) \- Auto-allocated unique identifier
- `user_id` (uuid) \- References auth.users & profiles
- `notification_type` (varchar) \- Format: `<main_type>.<detail>`
  - **Event types**: `event.invite`, `event.reminder`, `event.cancel`, `event.updated`, `event.response`, `event.squad`
  - **Payment types**: `payment.due`, `payment.reminder`, `payment.updated`, `payment.cancel`, `payment.paid`, `payment.failed`, `payment.received`
  - **Member types**: `member.interest`, `member.approve`, `member.decline`, `member.remove`
  - **Admin types**: `admin.add`, `admin.accept`, `admin.reject`, `admin.remove`
- `title` (varchar) \- e.g., "New Event Invite: {Club Name}"
- `message` (text) \- e.g., "You've been invited to {Event Name} on {Event Date}"
- `data` (jsonb) \- Additional structured data for the notification
- `related_entity` (varchar) \- Table name (e.g., "events", "payment_requests")
- `related_entity_id` (uuid) \- ID of the related record
- `is_read` (boolean) \- For future in-app alerts feature
- `read_at` (timestamp) \- For future in-app alerts feature
- `created_at` (timestamp) \- Auto-set on insert
- `expires_at` (timestamp) \- Event date, payment due date, or now() \+ 4 weeks

**Important Notes:**

- Notification type strings should be defined as constants in `/config/notifications.ts`
- The soft foreign key pattern (related_entity/related_entity_id) requires careful orphan management
- Future features planned: do-not-disturb settings, email delivery option, notification templates

### **Existing Supabase Functions & Stored Procedures**

WARNING\! These functions have not been verified to align with the current design.  
**Security & Admin Functions:**

- `is_super_admin()` \- Check if user has super admin privileges (better name is App Admin)
- `user_is_club_admin(club_uuid)` \- Verify club admin status
- `user_is_team_member_in_club(club_uuid)` \- Check team membership in club
- `user_is_primary_club_admin(club_uuid)` \- Verify primary admin status
- `user_is_club_admin_for_team(team_uuid)` \- Check club admin for specific team
- `user_can_access_event(event_uuid)` \- Validate event access permissions
- `user_can_manage_payment_request(payment_uuid)` \- Check payment management rights
- `start_impersonation(target_user_id)` \- Admin impersonation (super admin only)
- `end_impersonation()` \- End admin impersonation session

**Payment Processing Functions:**

- `process_payment_success(payment_intent_id, member_id, charge_id, amount_pence)` \- Handle successful Stripe payment
- `process_payment_failure(payment_intent_id, member_id, failure_reason)` \- Handle failed payment
- `process_payment_canceled(payment_intent_id, member_id)` \- Handle cancelled payment

**Notification Trigger Functions:**

- `notify_event_created()` \- Trigger when new event created
- `notify_event_updated()` \- Trigger when event details change
- `notify_event_cancelled()` \- Trigger when event cancelled
- `notify_payment_requested()` \- Trigger when payment request created
- `notify_payment_success()` \- Trigger when payment successful

**User Management Functions:**

- `handle_new_user()` \- Create profile for new auth user
- `search_users(search_term)` \- Search users (super admin only)
- `search_users_for_team(team_id, search_term, limit)` \- Search for team invite candidates

**Utility Functions:**

- `update_updated_at_column()` \- Auto-update timestamp trigger
- `generate_invitation_token()` \- Create unique invitation tokens
- `set_invitation_token()` \- Trigger to set token on invitation

### **Security Requirements**

- No client-side Stripe API calls
- Secure token management
- Role-based access control (RBAC)
- Row Level Security (RLS) policies
- Data encryption at rest and in transit
- Email OTP verification for new accounts

## **UI/UX Standards**

### **Navigation**

- Bottom tab navigation (Home, Teams, Explore, Alerts, Profile)
- Stack navigation for sub-screens
- Custom back navigation with arrow icons
- Header action buttons (yellow primary actions)

### **Forms**

- Required field validation
- 500ms debounce on search inputs
- Error display only after field interaction
- Native OS date/time pickers
- Clear state on mount (except sub-navigation returns)
- Proper field type usage (DateTime when time needed)

### **Design Requirements**

- Pixel-perfect Figma implementation
- Semantic color usage (no hex values)
- Consistent spacing system
- Native platform patterns
- Accessibility compliance

## **Development Priorities**

### **Phase 1: Core Infrastructure**

- Authentication flow
- Basic navigation structure
- Supabase integration
- Core UI components

### **Phase 2: Payment System**

- Stripe Connect setup
- Payment request creation
- Payment processing
- Payment history

### **Phase 3: Team Management**

- Member management
- Join request workflow
- Admin controls

### **Phase 4: Events System**

- Event creation
- Squad selection
- Availability tracking

### **Phase 5: Discovery**

- Club/team discovery
- Map integration
- Search functionality

## **Success Criteria**

- All 25 screens fully functional
- Pixel-perfect Figma implementation
- Complete payment flow with real transactions
- Team Admins capability for Team and Event management
- Push notifications working for all triggers
- Successful pilot with Fremington FC

## **Known Limitations (MVP)**

- No payment refunds mechanism
- No partial payment adjustments
- Manual Stripe account setup by App Admin
- No chat/messaging features
- No file attachments for events
- Limited to football clubs initially

## **Recommended Technology Stack**

| Layer              | Technology                        |
| :----------------- | :-------------------------------- |
| Mobile App         | Expo & React Native (TypeScript)  |
| Backend API        | Supabase BaaS                     |
| Database           | PostgreSQL in Supabase            |
| Storage            | Supabase Storage                  |
| Authentication     | Supabase Auth (Email & Password)  |
| Payment            | Stripe API (destination charging) |
| Push Notifications | Expo Push Notification Service    |
| Mapping            | Google Maps                       |
| Crashlytics        | Firebase Crashlytics              |
| Hosting            | Expo                              |

## **Appendix A: Complete Database Schema**

### **Database Overview**

**Project**: SportHawk (vwqfwehtjnjenzrhzgol) **Region**: EU-North-1 **Status**: Active

The database uses PostgreSQL with Row Level Security (RLS) enabled on all tables. The schema is already fully implemented and should NOT be changed during refactoring.

### **Core Tables**

#### **profiles**

User profile information, linked to auth.users

- `id` (uuid) \- Primary key, references auth.users.id
- `first_name` (text) \- User's first name
- `last_name` (text) \- User's last name
- `date_of_birth` (date) \- User's birth date
- `team_sort` (text) \- Team preference ('Men', 'Women')
- `profile_photo_uri` (text) \- Profile photo URL
- `background_image_uri` (text) \- Background image URL
- `is_sporthawk_admin` (boolean) \- Super admin flag
- `fcm_token` (text) \- Firebase Cloud Messaging token
- `created_at` (timestamptz) \- Record creation time
- `updated_at` (timestamptz) \- Last update time

#### **clubs**

Sports club information

- `id` (uuid) \- Primary key
- `name` (varchar) \- Club name
- `slug` (varchar) \- URL-friendly identifier (unique)
- `sport_type` (varchar) \- Primary sport type
- `sports` (text\[\]) \- Array of supported sports
- `location_city` (varchar) \- City location
- `location_state` (varchar) \- State/region
- `location_country` (varchar) \- Country (default: 'UK')
- `location_postcode` (varchar) \- Postal code
- `location_latitude` (numeric) \- GPS latitude
- `location_longitude` (numeric) \- GPS longitude
- `founded_year` (int) \- Year established
- `about_description` (varchar) \- Club description
- `club_badge_url` (text) \- Badge/logo URL
- `background_image_url` (text) \- Header image
- `website_url` (text) \- Official website
- `facebook_url` (text) \- Facebook page
- `instagram_url` (text) \- Instagram profile
- `twitter_url` (text) \- Twitter/X profile
- `contact_email` (varchar) \- Contact email
- `contact_phone` (varchar) \- Contact phone
- `is_active` (boolean) \- Active status
- `created_by` (uuid) \- Creator user ID
- `created_at` (timestamptz) \- Creation time
- `updated_at` (timestamptz) \- Last update

#### **teams**

Team information within clubs

- `id` (uuid) \- Primary key
- `club_id` (uuid) \- Parent club reference
- `name` (varchar) \- Team name
- `team_type` (varchar) \- Team category
- `sport` (varchar) \- Sport played
- `league_name` (varchar) \- League participation
- `team_level` (varchar) \- Competition level
- `team_sort` (varchar) \- Gender category ('Men', 'Women', 'Mixed')
- `age_group` (varchar) \- Age category
- `home_ground` (varchar) \- Home venue name
- `home_ground_address` (text) \- Venue address
- `home_ground_latitude` (numeric) \- Venue GPS lat
- `home_ground_longitude` (numeric) \- Venue GPS lon
- `founded_year` (int) \- Year established
- `motto` (text) \- Team motto
- `team_photo_url` (text) \- Team photo
- `training_day_1` (varchar) \- First training day
- `training_time_1` (time) \- First training time
- `training_day_2` (varchar) \- Second training day
- `training_time_2` (time) \- Second training time
- `match_day` (varchar) \- Usual match day
- `match_time` (time) \- Usual match time
- `is_active` (boolean) \- Active status
- `created_at` (timestamptz) \- Creation time
- `updated_at` (timestamptz) \- Last update

### **Membership Tables**

#### **team_members**

Team membership records

- `id` (uuid) \- Primary key
- `team_id` (uuid) \- Team reference
- `user_id` (uuid) \- Member reference
- `position` (varchar) \- Playing position
- `jersey_number` (int) \- Jersey number (1-99)
- `member_status` (varchar) \- Status ('active', 'inactive', 'suspended', 'injured')
- `joined_at` (timestamptz) \- Join date
- `left_at` (timestamptz) \- Leave date
- `added_by` (uuid) \- Who added member

#### **interest_expressions**

Join requests for teams

- `id` (uuid) \- Primary key
- `user_id` (uuid) \- Requester
- `team_id` (uuid) \- Target team
- `interest_status` (varchar) \- Status ('pending', 'accepted', 'declined', 'withdrawn')
- `message` (text) \- Request message
- `response_message` (text) \- Admin response
- `expressed_at` (timestamptz) \- Request time
- `responded_at` (timestamptz) \- Response time
- `responded_by` (uuid) \- Admin who responded

### **Administration Tables**

#### **club_admins**

Club administrator roles

- `id` (uuid) \- Primary key
- `club_id` (uuid) \- Club reference
- `user_id` (uuid) \- Admin user
- `role` (varchar) \- Admin role
- `title` (varchar) \- Position title
- `permissions` (text\[\]) \- Permission list
- `is_primary` (boolean) \- Primary admin flag
- `assigned_at` (timestamptz) \- Assignment date
- `assigned_by` (uuid) \- Who assigned role

#### **team_admins**

Team administrator roles

- `id` (uuid) \- Primary key
- `team_id` (uuid) \- Team reference
- `user_id` (uuid) \- Admin user
- `role` (varchar) \- Role (default: 'Manager')
- `title` (varchar) \- Position title
- `permissions` (text\[\]) \- Permission list
- `is_primary` (boolean) \- Primary admin flag
- `assigned_at` (timestamptz) \- Assignment date
- `assigned_by` (uuid) \- Who assigned role

### **Events Tables**

#### **events**

Event records

- `id` (uuid) \- Primary key
- `team_id` (uuid) \- Team reference
- `created_by` (uuid) \- Creator
- `title` (varchar) \- Event title
- `event_type` (varchar) \- Type ('home_match', 'away_match', 'training', 'match', 'social', 'meeting', 'other')
- `description` (text) \- Event description
- `event_date` (date) \- Event date
- `start_time` (time) \- Start time
- `end_time` (time) \- End time
- `location_name` (varchar) \- Venue name
- `location_address` (text) \- Venue address
- `location_latitude` (numeric) \- GPS latitude
- `location_longitude` (numeric) \- GPS longitude
- `opponent` (varchar) \- Opponent team
- `is_home_event` (boolean) \- Home/away flag
- `max_participants` (int) \- Participant limit
- `notes` (text) \- Additional notes
- `event_status` (varchar) \- Status ('active', 'cancelled', 'completed')
- `cancelled_reason` (text) \- Cancellation reason
- `cancelled_at` (timestamptz) \- Cancellation time
- `cancelled_by` (uuid) \- Who cancelled
- `weather_consideration` (boolean) \- Weather dependent
- `feedback_requested` (boolean) \- Request feedback
- `created_at` (timestamptz) \- Creation time
- `updated_at` (timestamptz) \- Last update

#### **event_squads**

Squad selection for events

- `id` (uuid) \- Primary key
- `event_id` (uuid) \- Event reference
- `user_id` (uuid) \- Selected player
- `selected_by` (uuid) \- Selector
- `position` (varchar) \- Playing position
- `squad_role` (varchar) \- Squad role
- `selection_notes` (text) \- Selection notes
- `selected_at` (timestamptz) \- Selection time

#### **event_invitations**

Event invitations

- `id` (uuid) \- Primary key
- `event_id` (uuid) \- Event reference
- `user_id` (uuid) \- Invitee
- `invited_by` (uuid) \- Inviter
- `invited_at` (timestamptz) \- Invitation time
- `invitation_status` (enum) \- Status ('pending', 'sent', 'accepted', 'declined', 'maybe')

### **Payment Tables**

#### **payment_requests**

Payment request records

- `id` (uuid) \- Primary key
- `team_id` (uuid) \- Team reference
- `created_by` (uuid) \- Creator (Treasurer)
- `title` (varchar) \- Payment title
- `description` (text) \- Payment description
- `amount_pence` (int) \- Amount in pence (\>0)
- `currency` (varchar) \- Currency ('GBP', 'EUR', 'USD')
- `due_date` (date) \- Due date (\>= today)
- `payment_type` (varchar) \- Type ('required', 'optional')
- `request_status` (varchar) \- Status ('active', 'cancelled', 'completed')
- `total_members` (int) \- Total members to pay
- `paid_members` (int) \- Members who paid
- `total_collected_pence` (int) \- Total collected
- `created_at` (timestamptz) \- Creation time
- `updated_at` (timestamptz) \- Last update

#### **payment_request_members**

Individual payment tracking

- `id` (uuid) \- Primary key
- `payment_request_id` (uuid) \- Request reference
- `user_id` (uuid) \- Member reference
- `payment_status` (varchar) \- Status ('unpaid', 'paid', 'refunded', 'failed')
- `amount_pence` (int) \- Amount in pence
- `currency` (varchar) \- Currency (default: 'GBP')
- `paid_at` (timestamptz) \- Payment time
- `payment_method` (varchar) \- Payment method
- `stripe_payment_intent_id` (varchar) \- Stripe ID
- `failure_reason` (text) \- Failure reason
- `payment_id` (uuid) \- Payment reference
- `created_at` (timestamptz) \- Creation time
- `updated_at` (timestamptz) \- Last update

#### **payment_transactions**

Stripe transaction records

- `id` (uuid) \- Primary key
- `payment_request_member_id` (uuid) \- Member payment reference
- `stripe_payment_intent_id` (varchar) \- Stripe intent ID (unique)
- `stripe_charge_id` (varchar) \- Stripe charge ID
- `amount_pence` (int) \- Transaction amount
- `currency` (varchar) \- Currency
- `platform_fee_pence` (int) \- Platform fee (SportHawk pays)
- `net_amount_pence` (int) \- Net to team
- `payment_method` (varchar) \- Method used
- `payment_method_details` (jsonb) \- Method details
- `transaction_status` (varchar) \- Status ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')
- `stripe_status` (varchar) \- Stripe status
- `failure_code` (varchar) \- Failure code
- `failure_message` (text) \- Failure message
- `created_at` (timestamptz) \- Creation time
- `updated_at` (timestamptz) \- Last update

#### **stripe_accounts**

Team Stripe Connect accounts

- `id` (uuid) \- Primary key
- `team_id` (uuid) \- Team reference (unique)
- `stripe_account_id` (varchar) \- Stripe account ID (unique)
- `account_status` (varchar) \- Status ('pending', 'active', 'restricted', 'disabled')
- `charges_enabled` (boolean) \- Can receive charges
- `payouts_enabled` (boolean) \- Can receive payouts
- `country` (varchar) \- Country (default: 'GB')
- `currency` (varchar) \- Currency (default: 'GBP')
- `account_email` (varchar) \- Account email
- `business_type` (varchar) \- Business type
- `created_at` (timestamptz) \- Creation time
- `updated_at` (timestamptz) \- Last update

### **Notification Tables**

#### **notifications**

User notifications

- `id` (uuid) \- Primary key
- `user_id` (uuid) \- Recipient
- `notification_type` (varchar) \- Type identifier
- `title` (varchar) \- Notification title
- `message` (text) \- Notification body
- `data` (jsonb) \- Additional data
- `related_entity_type` (varchar) \- Related entity
- `related_entity_id` (uuid) \- Related ID
- `priority` (varchar) \- Priority ('low', 'normal', 'high', 'urgent')
- `is_read` (boolean) \- Read status
- `read_at` (timestamptz) \- Read time
- `delivery_method` (varchar) \- Method ('in_app', 'push', 'email')
- `delivery_status` (varchar) \- Status ('pending', 'sent', 'delivered', 'failed')
- `delivery_attempts` (int) \- Attempt count
- `last_delivery_attempt` (timestamptz) \- Last attempt
- `created_at` (timestamptz) \- Creation time
- `expires_at` (timestamptz) \- Expiration time

#### **notification_queue**

Queued notifications for processing

- `id` (uuid) \- Primary key
- `user_id` (uuid) \- Recipient
- `template_id` (text) \- Template identifier
- `variables` (jsonb) \- Template variables
- `scheduled_for` (timestamptz) \- Schedule time
- `priority` (int) \- Priority level
- `status` (text) \- Status ('pending', 'sent', 'failed', 'cancelled')
- `attempts` (int) \- Attempt count
- `last_attempt` (timestamptz) \- Last attempt
- `error` (text) \- Error message
- `created_at` (timestamptz) \- Creation time

#### **notification_templates**

Notification template definitions

- `id` (uuid) \- Primary key
- `type` (text) \- Type ('event', 'payment', 'message', 'system')
- `trigger` (text) \- Trigger identifier (unique)
- `title` (text) \- Template title
- `body` (text) \- Template body
- `variables` (text\[\]) \- Variable list
- `actions` (jsonb) \- Action buttons
- `priority` (text) \- Priority ('high', 'normal', 'low')
- `category` (text) \- Category
- `is_active` (boolean) \- Active status
- `created_at` (timestamptz) \- Creation time
- `updated_at` (timestamptz) \- Last update

#### **device_tokens**

Push notification tokens

- `id` (uuid) \- Primary key
- `user_id` (uuid) \- User reference
- `token` (text) \- Device token
- `platform` (text) \- Platform ('ios', 'android')
- `device_id` (text) \- Device identifier
- `app_version` (text) \- App version
- `is_active` (boolean) \- Active status
- `last_used` (timestamptz) \- Last use time
- `created_at` (timestamptz) \- Creation time
- `updated_at` (timestamptz) \- Last update

### **Row Level Security (RLS) Policies**

The database implements comprehensive RLS policies for data security:

#### **Key RLS Patterns**

1. **Public Read**: Clubs, teams (active only)
2. **User Own Data**: Profiles, notifications, preferences
3. **Team Member Access**: Events, payments (for team members)
4. **Admin Management**: Full CRUD for team/club admins
5. **Super Admin Override**: Full access via is_super_admin()

#### **Active RLS Policies by Table**

- **profiles**: User can read/update own profile
- **clubs**: Public read (active), admin update
- **teams**: Team member/admin access
- **events**: Team member read, admin CRUD
- **payments**: Member view own, admin manage all
- **notifications**: User manage own
- **device_tokens**: User manage own
- **interest_expressions**: User create own, admin view all

### **Database Functions**

WARNING\! These functions have not been verified to align with the current design.

#### **Security Functions**

- `is_super_admin()` \- Check super admin status
- `user_is_club_admin(club_uuid)` \- Check club admin
- `user_is_team_member_in_club(club_uuid)` \- Check team membership
- `user_is_primary_club_admin(club_uuid)` \- Check primary admin
- `user_can_access_event(event_uuid)` \- Check event access
- `user_can_manage_payment_request(payment_request_uuid)` \- Check payment management

#### **Payment Processing Functions**

- `process_payment_success(...)` \- Handle successful payment
- `process_payment_failure(...)` \- Handle failed payment
- `process_payment_canceled(...)` \- Handle cancelled payment

#### **Notification Functions**

- `notify_event_created()` \- Trigger for new events
- `notify_event_updated()` \- Trigger for event updates
- `notify_event_cancelled()` \- Trigger for cancellations
- `notify_payment_requested()` \- Trigger for payment requests
- `notify_payment_success()` \- Trigger for successful payments

#### **Utility Functions**

- `update_updated_at_column()` \- Auto-update timestamps
- `generate_invitation_token()` \- Create invitation tokens
- `set_invitation_token()` \- Set token on invitation
- `handle_new_user()` \- Create profile for new auth user
- `search_users()` \- Search users (super admin only)
- `search_users_for_team()` \- Search for team invites

### **Database Triggers**

#### **Timestamp Triggers**

All major tables have `BEFORE UPDATE` triggers calling `update_updated_at_column()`:

- clubs, teams, events, payments, etc.

#### **Notification Triggers**

- **events table**:
  - `AFTER INSERT`: notify_event_created()
  - `AFTER UPDATE`: notify_event_updated()
  - `AFTER UPDATE`: notify_event_cancelled()
- **payment_requests table**:
  - `AFTER INSERT`: notify_payment_requested()
- **payments table**:
  - `AFTER UPDATE`: notify_payment_success()

#### **Push Notification Webhook**

- **notifications table**:
  - `AFTER INSERT`: HTTP webhook to Edge Function for FCM

### **Edge Functions & Webhooks**

WARNING\! These functions have not been verified to align with the current design.

#### **Push Notification Service**

- Endpoint: `/functions/v1/send-fcm-notification`
- Triggered by notification inserts
- Sends Firebase Cloud Messaging notifications

#### **Stripe Webhooks (to be implemented)**

- Payment intent succeeded
- Payment intent failed
- Charge succeeded
- Account updated

### **Security Notes**

1. **RLS Enabled**: All tables have RLS enabled
2. **Auth Integration**: Uses Supabase Auth (auth.users)
3. **Super Admin Override**: is_super_admin() bypasses all RLS
4. **Stripe Security**: All Stripe calls via Edge Functions
5. **Token Management**: FCM tokens stored per user
6. **Audit Logging**: admin_logs table for admin actions

### **Data Integrity Constraints**

- Foreign keys enforced on all relationships
- Check constraints on enums and ranges
- Unique constraints on slugs, tokens, Stripe IDs
- Non-null constraints on required fields
- Positive integer constraints on amounts

## **Appendix B: Design Specifications and User Journeys**

### **B.1 Design Resources**

The SportHawk MVP includes comprehensive design documentation and prototype walkthroughs to guide implementation:

1. **Design Journeys** \- Detailed user journey maps for each major feature area
2. **Prototype Walkthroughs** \- Interactive demonstrations of key user flows
3. **Screen Specifications** \- Pixel-perfect designs for all 25 MVP screens

All designs are maintained in the primary Figma file with specific node IDs referenced throughout this document.

### **B.2 Payment Lifecycle \- Detailed Specification**

#### **Overview**

The payment system uses Stripe Connect with "destination charging" to ensure the full payment amount reaches the team's bank account, with SportHawk paying transaction fees.

#### **Payment Setup Process**

1. **Club/Team Treasurer Registration**
   - Treasurer creates Stripe Connect account manually
   - Example: Fremington FC has two accounts \- Men's teams (David) and Women's/Youth teams (Rew/Nicky)
   - SportHawk staff assists with onboarding process

2. **Stripe Account Connection**
   - SportHawk staff onboards destination account
   - Links Team's Stripe Connect account to SportHawk platform
   - Records Stripe account ID in team settings

#### **Payment Request Flow**

1. **Creation (Team Admin/Treasurer)**
   - Navigate: Teams → Admins → '+' button → "Payment Request" card
   - Fill form: Title, Description, Due date, Type (Required/Optional), Members, Amount
   - System inserts payment_request record and payment_request_members rows

2. **Member Notification**
   - All selected members receive push/in-app notification
   - Notification includes amount, description, and due date

3. **Member Payment Process**
   - Member views payment request in app
   - Taps to pay, triggering Stripe Payment Sheet
   - Chooses payment method: Card, Apple Pay, or Google Pay
   - Stripe processes payment using destination charge

4. **Transaction Processing**
   - Member pays £X
   - Stripe charges SportHawk account transaction fee (\~£0.21 on £25)
   - Full £X transferred to Team's Stripe Connect account
   - Team receives full amount, SportHawk absorbs fee

5. **Post-Payment Actions**
   - Payment status updated to "paid"
   - Treasurer receives notification
   - Member can view in payment history
   - Automatic reminders cancelled

#### **Management Features**

- **Treasurer Dashboard**: View all payment requests and status
- **Send Reminders**: Manual reminders to unpaid members
- **Edit Payments**: Modify details (with restrictions if payments made)
- **Cancel Payments**: Cancel with notifications to all members
- **Payment History**: Full audit trail for members and admins

### **B.3 Team Members Lifecycle \- Detailed Specification**

#### **Discovery & Joining Flow**

1. **Explore Screen**
   - Map-based discovery with search
   - Filter by sport type (initially Football)
   - Search by: Name, City, State, Description, Postcode, Phone
   - Results show as tappable cards

2. **Club Details**
   - View club information and teams
   - "All teams" button shows full team list
   - Each team card is tappable

3. **Team Details**
   - About tab: Team information
   - Members tab: Current team roster
   - "Join Us" button for interested users

4. **Join Request Process**
   - User taps "Join Us"
   - Confirmation popup appears
   - System creates interest_expression record
   - Team Admin receives notification

#### **Admin Member Management**

1. **Manage Members Screen**
   - Shows members for selected team
   - "Add members" card shows pending requests count
   - Search functionality for existing members
   - Remove member with confirmation dialogs

2. **Add Members (Process Join Requests)**
   - Shows all pending interest_expressions
   - Accept: Adds to team_members, notifies user
   - Ignore: Updates status, notifies user
   - All actions require confirmation

3. **Manage Team Admins**
   - Only accessible to Super Admins
   - Add/remove team admin roles
   - Search members to promote
   - All changes trigger notifications

### **B.4 Events Lifecycle \- Detailed Specification**

#### **Event Creation**

- Team Admin creates event with type, location, date/time
- Select members to invite
- System creates event and event_participants records
- All invited members receive notification

#### **Member Response Flow**

- Members receive event invitation
- Respond with availability (Yes/No/Maybe)
- Responses tracked in event_availability table
- Admin can view all responses

#### **Squad Selection**

- Admin reviews availability responses
- Selects squad for match events
- Selected players receive notification
- Squad stored in event_squads table

#### **Event Updates/Cancellation**

- Changes trigger update notifications
- Cancellations notify all participants
- Reminders sent 24 hours and 1 hour before

### **B.5 User Authentication & Profile Journey**

#### **First-Time User Flow**

1. App Open → Loading Screen
2. Welcome Screen → Sign Up or Sign In
3. Sign Up: Email, Password, First/Last Name, DOB
4. OTP Verification via email
5. Profile setup (optional): Photo, background image
6. Home screen access

#### **Returning User Flow**

1. App Open → Loading Screen
2. Auto-login if session valid
3. Home screen with personalized content
4. Profile accessible via navigation

#### **Password Recovery**

1. Sign In → "Forgot Password" link
2. Enter email address
3. Receive reset email with link
4. Reset Password screen in app
5. Enter new password twice
6. Auto-redirect to Sign In

#### **Profile Management**

- View/edit personal information
- Upload profile and background photos
- View payment history
- Sign out option
- Notification preferences

---

_This document serves as the functional specification for the SportHawk MVP refactoring project. For detailed technical implementation guidelines and API specifications, refer to the accompanying technical documentation._
