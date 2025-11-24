# Database Schema QA Report

**Date:** 2025-08-11  
**Project:** SportHawk MVP V4  
**Database:** vwqfwehtjnjenzrhzgol  
**QA Persona:** AI (BMad Framework)  
**Status:** CONDITIONAL APPROVAL with Required Actions

## Executive Summary

The database schema from V3 has been reviewed and found to be structurally sound with good table organization and relationships. However, there are **critical security issues** that must be addressed before proceeding with development.

## Schema Overview

### Tables Identified (32 total)

- **Core Tables**: profiles, clubs, teams, events, payments
- **Relationship Tables**: club_members, team_members, club_admins, team_admins
- **Event Tables**: event_availability, event_invitations, event_locations, event_participants, event_squads
- **Payment Tables**: payment_requests, payment_request_members, payment_request_users, payment_transactions
- **Notification Tables**: notifications, notification_preferences, notification_queue, notification_templates
- **Other**: stripe_accounts, interest_expressions, push_tokens, device_tokens, admin_logs, broadcast_messages

### Data Model Strengths ✅

1. **Normalized Structure**: Proper separation of concerns with dedicated tables
2. **Clear Relationships**: Foreign keys properly defined between related entities
3. **Timestamp Tracking**: created_at/updated_at fields present
4. **UUID Usage**: Using UUIDs for primary keys (security best practice)
5. **Hierarchical Organization**: Club → Team → Events/Payments structure is logical

## Critical Issues Found 🚨

### 1. RLS Policies Missing (CRITICAL)

**19 tables have RLS enabled but NO policies defined:**

- broadcast_messages
- club_search_index
- event_availability
- event_invitations
- event_locations
- event_squads
- events (core table!)
- interest_expressions
- notification_preferences
- notifications
- payment_reminders
- payment_request_members
- payment_requests (core table!)
- payment_transactions
- push_tokens
- stripe_accounts
- team_admins
- team_members
- teams (core table!)

**Impact**: These tables are completely inaccessible via the Supabase client, blocking all functionality.

### 2. Function Security Warnings (MAJOR)

**14 functions have mutable search_path issues:**

- is_super_admin
- generate_invitation_token
- set_invitation_token
- update_updated_at_column
- search_users
- search_users_for_team
- start_impersonation
- end_impersonation
- notify_event_created
- notify_event_updated
- notify_event_cancelled
- notify_payment_requested
- notify_payment_success

**Impact**: Potential SQL injection vulnerability if search_path is manipulated.

### 3. Leaked Password Protection Disabled (MAJOR)

- HaveIBeenPwned integration is disabled
- Users can use compromised passwords

**Impact**: Reduced security for user accounts.

## Tables with Working RLS ✅

Only these tables have proper RLS policies:

1. **profiles**: User profile access controls
2. **clubs**: Admin and public viewing permissions
3. **payments**: User payment visibility
4. **club_admins**: (limited policies)
5. **club_members**: (limited policies)

## Required Actions Before Development

### Priority 1: Create Missing RLS Policies (BLOCKING)

Must create policies for core tables immediately:

```sql
-- Example for teams table
CREATE POLICY "Users can view teams they belong to"
ON teams FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM team_members WHERE team_id = teams.id
  )
);

CREATE POLICY "Team admins can update their teams"
ON teams FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM team_admins WHERE team_id = teams.id
  )
);

-- Similar policies needed for events, payment_requests, etc.
```

### Priority 2: Fix Function Security

Add search_path to all functions:

```sql
ALTER FUNCTION is_super_admin() SET search_path = public;
-- Repeat for all 14 functions
```

### Priority 3: Enable Password Protection

- Enable leaked password protection in Supabase Auth settings
- Configure minimum password requirements

## Recommendations

### Immediate Actions (Before any development):

1. **Create RLS policies** for all 19 tables missing them
2. **Fix search_path** for all 14 functions
3. **Enable password protection** in Auth settings
4. **Test core flows** after RLS implementation

### Architecture Improvements:

1. Consider adding indexes for frequently queried columns
2. Add check constraints for data validation
3. Implement audit logging triggers
4. Consider partitioning for large tables (future)

## QA Verdict

### Status: CONDITIONAL APPROVAL ⚠️

**Conditions for Approval:**

1. ✅ Schema structure is sound
2. ✅ Table relationships are correct
3. ❌ **MUST FIX**: Create RLS policies for 19 tables
4. ❌ **MUST FIX**: Secure 14 functions with search_path
5. ❌ **SHOULD FIX**: Enable password protection

**The schema cannot be used for development until the RLS policies are created. This is a complete blocker.**

## Next Steps

1. **Immediate**: Create RLS policies for core tables (teams, events, payment_requests)
2. **Today**: Fix function security issues
3. **Before Auth Implementation**: Enable password protection
4. **Document**: Create RLS policy documentation for each table

## Appendix: RLS Policy Templates Needed

### Teams Table

- SELECT: Team members and admins can view
- INSERT: Club admins can create teams
- UPDATE: Team admins can update
- DELETE: Super admins only

### Events Table

- SELECT: Team members can view team events
- INSERT: Team admins can create events
- UPDATE: Event creators and team admins
- DELETE: Event creators and team admins

### Payment Requests Table

- SELECT: Team members can view team payment requests
- INSERT: Team admins can create
- UPDATE: Payment request creators
- DELETE: Super admins only

[Continue for all 19 tables...]

---

**QA Sign-off**: Database schema structure APPROVED, RLS implementation REJECTED
**Required Actions**: Must implement RLS policies before any development can proceed
