# USR Stories - Manual Test Plan

## Test Environment Setup

### Prerequisites

- [ ] Test on both iOS and Android devices/simulators
- [ ] Have access to email for receiving password reset links
- [ ] Test account credentials ready
- [ ] Clear app data/cache before testing (fresh install state)
- [ ] Network connection (WiFi and cellular)

### Test Accounts Needed

1. **Existing user account** - Has profile, payment history
2. **New user account** - No profile picture, no payment history
3. **Invalid account** - For negative testing

---

## USR-001: Password Forgot Enhancement

### Test ID: USR-001-01 - Navigation to Forgot Password

**Priority:** High  
**Precondition:** User on Sign In screen, not logged in

| Step | Action                               | Expected Result                                   | Pass/Fail | Notes |
| ---- | ------------------------------------ | ------------------------------------------------- | --------- | ----- |
| 1    | Open app, navigate to Sign In screen | Sign In screen displays                           |           |       |
| 2    | Look for "Forgot Password" link      | Link is visible and styled correctly (gold color) |           |       |
| 3    | Tap "Forgot Password" link           | Navigates to Forgot Password screen               |           |       |
| 4    | Verify screen layout                 | Matches Figma ID 559-216                          |           |       |
| 5    | Check for back navigation button     | Top nav back button present and functional        |           |       |

### Test ID: USR-001-02 - Email Validation

**Priority:** High  
**Precondition:** On Forgot Password screen

| Step | Action                                         | Expected Result                     | Pass/Fail | Notes |
| ---- | ---------------------------------------------- | ----------------------------------- | --------- | ----- |
| 1    | Leave email field empty, tap "Send Reset Link" | Error: "Email is required"          |           |       |
| 2    | Enter invalid email "notanemail"               | Real-time validation shows error    |           |       |
| 3    | Enter partial email "test@"                    | Error: "Please enter a valid email" |           |       |
| 4    | Enter valid email "test@example.com"           | No error shown, button enabled      |           |       |
| 5    | Clear email field                              | Error state returns                 |           |       |

### Test ID: USR-001-03 - Send Reset Email

**Priority:** Critical  
**Precondition:** Valid email entered

| Step | Action                         | Expected Result                                    | Pass/Fail | Notes |
| ---- | ------------------------------ | -------------------------------------------------- | --------- | ----- |
| 1    | Enter registered email address | Email accepted                                     |           |       |
| 2    | Tap "Send Reset Link"          | Loading indicator shows on button                  |           |       |
| 3    | Wait for response              | Success screen displays                            |           |       |
| 4    | Verify success title           | Shows "Reset Password Triggered"                   |           |       |
| 5    | Verify success message         | Shows full instructional text about checking email |           |       |
| 6    | Check email inbox              | Reset email received within 2 minutes              |           |       |
| 7    | Try navigating back            | Navigation is prevented/restricted                 |           |       |

### Test ID: USR-001-04 - Help Section

**Priority:** Medium  
**Precondition:** On Forgot Password screen

| Step | Action                        | Expected Result                      | Pass/Fail | Notes |
| ---- | ----------------------------- | ------------------------------------ | --------- | ----- |
| 1    | Scroll to bottom of screen    | "Need Help?" section visible         |           |       |
| 2    | Verify "Contact Support" link | Mail icon present, text in gold      |           |       |
| 3    | Tap "Contact Support"         | Opens email client or support screen |           |       |
| 4    | Verify "FAQ" link             | Help icon present, text in gold      |           |       |
| 5    | Tap "FAQ"                     | Opens FAQ screen or webpage          |           |       |

### Test ID: USR-001-05 - Error Handling

**Priority:** High  
**Precondition:** On Forgot Password screen

| Step | Action                                       | Expected Result                          | Pass/Fail | Notes |
| ---- | -------------------------------------------- | ---------------------------------------- | --------- | ----- |
| 1    | Enter unregistered email                     | Error alert: "User not found" or similar |           |       |
| 2    | Turn off network, try sending                | Network error message displays           |           |       |
| 3    | Enter email, quickly tap send multiple times | Only one request sent (button disabled)  |           |       |

---

## USR-002: Password Reset

### Test ID: USR-002-01 - Deep Link Handling

**Priority:** Critical  
**Precondition:** Received password reset email

| Step | Action                     | Expected Result                   | Pass/Fail | Notes |
| ---- | -------------------------- | --------------------------------- | --------- | ----- |
| 1    | Open reset email on device | Email contains reset link/button  |           |       |
| 2    | Tap reset link in email    | SportHawk app opens automatically |           |       |
| 3    | Verify navigation          | Lands on Password Reset screen    |           |       |
| 4    | Check screen layout        | Matches Figma ID 559-200          |           |       |
| 5    | Verify back button         | Can navigate back to sign in      |           |       |

### Test ID: USR-002-02 - Password Validation

**Priority:** High  
**Precondition:** On Password Reset screen via deep link

| Step | Action                              | Expected Result                       | Pass/Fail | Notes |
| ---- | ----------------------------------- | ------------------------------------- | --------- | ----- |
| 1    | Leave both fields empty             | Reset button disabled                 |           |       |
| 2    | Enter "short" in new password       | Shows "Must be at least 8 characters" |           |       |
| 3    | Enter "password123" in new password | No error, field valid                 |           |       |
| 4    | Enter different password in confirm | Reset button remains disabled         |           |       |
| 5    | Enter matching passwords (8+ chars) | Reset button enables                  |           |       |
| 6    | Make passwords not match            | Reset button disables again           |           |       |

### Test ID: USR-002-03 - Password Reset Success

**Priority:** Critical  
**Precondition:** Valid matching passwords entered

| Step | Action                           | Expected Result             | Pass/Fail | Notes |
| ---- | -------------------------------- | --------------------------- | --------- | ----- |
| 1    | Enter valid matching passwords   | Both fields show as valid   |           |       |
| 2    | Tap "Reset Password"             | Loading state shows         |           |       |
| 3    | Wait for completion              | Success popup displays      |           |       |
| 4    | Read success message             | Clear confirmation message  |           |       |
| 5    | Dismiss popup                    | Navigates to Sign In screen |           |       |
| 6    | If was logged in                 | User is logged out first    |           |       |
| 7    | Try signing in with OLD password | Login fails                 |           |       |
| 8    | Sign in with NEW password        | Login succeeds              |           |       |

### Test ID: USR-002-04 - Token Expiration

**Priority:** High  
**Precondition:** Have an expired reset link (>1 hour old)

| Step | Action                   | Expected Result               | Pass/Fail | Notes |
| ---- | ------------------------ | ----------------------------- | --------- | ----- |
| 1    | Click expired reset link | App opens to reset screen     |           |       |
| 2    | Enter valid passwords    | Fields accept input           |           |       |
| 3    | Tap "Reset Password"     | Error: "Reset link expired"   |           |       |
| 4    | Verify error message     | Suggests requesting new reset |           |       |

---

## USR-003: Payment History

### Test ID: USR-003-01 - Navigation to Payment History

**Priority:** High  
**Precondition:** User logged in with payment history

| Step | Action                      | Expected Result               | Pass/Fail | Notes |
| ---- | --------------------------- | ----------------------------- | --------- | ----- |
| 1    | Navigate to Profile screen  | Profile displays              |           |       |
| 2    | Find Payment History option | Option visible in settings    |           |       |
| 3    | Tap Payment History         | Navigates to payment list     |           |       |
| 4    | Verify screen layout        | Matches Figma ID 559-7147     |           |       |
| 5    | Check top navigation        | Back button and title present |           |       |

### Test ID: USR-003-02 - Payment List Display

**Priority:** High  
**Precondition:** On Payment History screen

| Step | Action                  | Expected Result                  | Pass/Fail | Notes |
| ---- | ----------------------- | -------------------------------- | --------- | ----- |
| 1    | View payment list       | Shows all user's payments        |           |       |
| 2    | Check each payment card | Shows: title, amount, date, team |           |       |
| 3    | Verify sort indicator   | "Most Recent" shown by default   |           |       |
| 4    | Check currency display  | Shows £ symbol correctly         |           |       |
| 5    | Verify date format      | Consistent date display          |           |       |

### Test ID: USR-003-03 - Sorting (iOS)

**Priority:** Medium  
**Precondition:** Multiple payments in history

| Step | Action                | Expected Result              | Pass/Fail | Notes |
| ---- | --------------------- | ---------------------------- | --------- | ----- |
| 1    | Tap sort dropdown     | Action sheet appears (iOS)   |           |       |
| 2    | Select "Name A-Z"     | List re-sorts alphabetically |           |       |
| 3    | Select "Paid First"   | Paid items appear first      |           |       |
| 4    | Select "Most Recent"  | Returns to date sort         |           |       |
| 5    | Cancel sort selection | List remains unchanged       |           |       |

### Test ID: USR-003-04 - Payment Details

**Priority:** High  
**Precondition:** Payment list displayed

| Step | Action                    | Expected Result             | Pass/Fail | Notes |
| ---- | ------------------------- | --------------------------- | --------- | ----- |
| 1    | Tap "View Payment" button | Navigates to detail screen  |           |       |
| 2    | Verify layout             | Matches Figma ID 559-7357   |           |       |
| 3    | Check payment title       | Displays correctly          |           |       |
| 4    | Check "Requested by"      | Shows team name with avatar |           |       |
| 5    | Verify status badge       | Shows Paid/Pending status   |           |       |
| 6    | Check description         | Full description visible    |           |       |
| 7    | Verify total amount       | Displays with currency      |           |       |
| 8    | Tap back button           | Returns to payment list     |           |       |

### Test ID: USR-003-05 - Empty State

**Priority:** Medium  
**Precondition:** User with no payment history

| Step | Action                      | Expected Result               | Pass/Fail | Notes |
| ---- | --------------------------- | ----------------------------- | --------- | ----- |
| 1    | Navigate to Payment History | Screen loads                  |           |       |
| 2    | Check for empty state       | Message: "No payment history" |           |       |
| 3    | Verify helpful text         | Explains how to make payments |           |       |

### Test ID: USR-003-06 - Pull to Refresh

**Priority:** Medium  
**Precondition:** On Payment History screen

| Step | Action              | Expected Result           | Pass/Fail | Notes |
| ---- | ------------------- | ------------------------- | --------- | ----- |
| 1    | Pull down on list   | Refresh indicator appears |           |       |
| 2    | Release to refresh  | Loading animation shows   |           |       |
| 3    | Wait for completion | List updates if new data  |           |       |

---

## USR-004: Home Page Reminders

### Test ID: USR-004-01 - Profile Picture Reminder

**Priority:** High  
**Precondition:** User with NO profile picture

| Step | Action                  | Expected Result                      | Pass/Fail | Notes |
| ---- | ----------------------- | ------------------------------------ | --------- | ----- |
| 1    | Navigate to Home screen | Home feed displays                   |           |       |
| 2    | Check above first post  | Reminders section visible            |           |       |
| 3    | Verify section title    | Shows "Reminders"                    |           |       |
| 4    | Check expand arrow      | Down arrow visible on right          |           |       |
| 5    | Verify reminder card    | "Set profile picture" button visible |           |       |
| 6    | Check button styling    | Primary yellow button style          |           |       |

### Test ID: USR-004-02 - Expand/Collapse

**Priority:** Medium  
**Precondition:** Reminders section visible

| Step | Action                | Expected Result                   | Pass/Fail | Notes |
| ---- | --------------------- | --------------------------------- | --------- | ----- |
| 1    | Note initial state    | Section expanded by default       |           |       |
| 2    | Tap arrow/header      | Section collapses smoothly        |           |       |
| 3    | Verify arrow rotation | Arrow points right when collapsed |           |       |
| 4    | Tap again             | Section expands smoothly          |           |       |
| 5    | Verify arrow rotation | Arrow points down when expanded   |           |       |
| 6    | Scroll feed           | Collapse state persists           |           |       |

### Test ID: USR-004-03 - Navigation to Edit Profile

**Priority:** High  
**Precondition:** Profile reminder visible

| Step | Action                    | Expected Result               | Pass/Fail | Notes |
| ---- | ------------------------- | ----------------------------- | --------- | ----- |
| 1    | Tap "Set profile picture" | Navigates to Edit Profile     |           |       |
| 2    | Add profile picture       | Picture upload works          |           |       |
| 3    | Save profile              | Returns to previous screen    |           |       |
| 4    | Navigate to Home          | Reminder no longer shows      |           |       |
| 5    | Check reminders section   | Section hidden (no reminders) |           |       |

### Test ID: USR-004-04 - No Reminders State

**Priority:** Medium  
**Precondition:** User WITH profile picture

| Step | Action               | Expected Result                | Pass/Fail | Notes |
| ---- | -------------------- | ------------------------------ | --------- | ----- |
| 1    | Navigate to Home     | Home feed displays             |           |       |
| 2    | Check above posts    | No reminders section           |           |       |
| 3    | Verify post position | Posts start at normal position |           |       |

### Test ID: USR-004-05 - Session Persistence

**Priority:** Low  
**Precondition:** Reminders section visible

| Step | Action                     | Expected Result              | Pass/Fail | Notes |
| ---- | -------------------------- | ---------------------------- | --------- | ----- |
| 1    | Collapse reminders section | Section collapses            |           |       |
| 2    | Navigate away from Home    | Other screen loads           |           |       |
| 3    | Return to Home             | Reminders still collapsed    |           |       |
| 4    | Force close app            | App closes                   |           |       |
| 5    | Reopen app, go to Home     | Reminders expanded (default) |           |       |

---

## Cross-Story Integration Tests

### Test ID: INT-01 - Complete Password Reset Flow

**Priority:** Critical

| Step | Action                      | Expected Result               | Pass/Fail | Notes |
| ---- | --------------------------- | ----------------------------- | --------- | ----- |
| 1    | Sign out of app             | Lands on welcome/sign in      |           |       |
| 2    | Navigate to Forgot Password | Screen loads correctly        |           |       |
| 3    | Request password reset      | Email sent successfully       |           |       |
| 4    | Click email link            | Opens Password Reset screen   |           |       |
| 5    | Reset password              | Success, navigates to Sign In |           |       |
| 6    | Sign in with new password   | Login successful              |           |       |
| 7    | Check profile intact        | User data preserved           |           |       |

### Test ID: INT-02 - New User Journey

**Priority:** High

| Step | Action                      | Expected Result                | Pass/Fail | Notes |
| ---- | --------------------------- | ------------------------------ | --------- | ----- |
| 1    | Create new account          | Account created                |           |       |
| 2    | Navigate to Home            | Profile picture reminder shows |           |       |
| 3    | Navigate to Payment History | Empty state displays           |           |       |
| 4    | Set profile picture         | Reminder disappears            |           |       |
| 5    | Make a payment              | Shows in payment history       |           |       |

---

## Performance Tests

### Test ID: PERF-01 - Screen Load Times

**Priority:** Medium

| Screen                      | Target Load Time | Actual Time | Pass/Fail | Notes |
| --------------------------- | ---------------- | ----------- | --------- | ----- |
| Forgot Password             | < 1 second       |             |           |       |
| Password Reset              | < 1 second       |             |           |       |
| Payment History (10 items)  | < 2 seconds      |             |           |       |
| Payment History (50+ items) | < 3 seconds      |             |           |       |
| Home with Reminders         | < 2 seconds      |             |           |       |

### Test ID: PERF-02 - Animation Smoothness

**Priority:** Low

| Animation                | Expected FPS | Smooth? | Pass/Fail | Notes |
| ------------------------ | ------------ | ------- | --------- | ----- |
| Reminder expand/collapse | 60 FPS       |         |           |       |
| Navigation transitions   | 60 FPS       |         |           |       |
| Pull to refresh          | 60 FPS       |         |           |       |

---

## Edge Cases & Negative Tests

### Test ID: EDGE-01 - Network Issues

| Test Case                           | Expected Behavior           | Pass/Fail | Notes |
| ----------------------------------- | --------------------------- | --------- | ----- |
| No network when sending reset email | Error message, retry option |           |       |
| Network drops during password reset | Error handled gracefully    |           |       |
| Slow network loading payments       | Loading indicator, no crash |           |       |

### Test ID: EDGE-02 - Invalid Data

| Test Case            | Expected Behavior       | Pass/Fail | Notes |
| -------------------- | ----------------------- | --------- | ----- |
| Malformed deep link  | Error screen or sign in |           |       |
| Corrupt payment data | Error message, no crash |           |       |
| Missing profile data | Graceful fallback       |           |       |

### Test ID: EDGE-03 - Concurrent Actions

| Test Case                          | Expected Behavior      | Pass/Fail | Notes |
| ---------------------------------- | ---------------------- | --------- | ----- |
| Multiple password reset requests   | Only latest valid      |           |       |
| Collapse reminder while navigating | No crash, stable state |           |       |
| Pull refresh while sorting         | One action completes   |           |       |

---

## Accessibility Tests

### Test ID: A11Y-01 - Screen Reader

**Priority:** Medium

| Element          | Should Announce               | Pass/Fail | Notes |
| ---------------- | ----------------------------- | --------- | ----- |
| Password field   | "Password, secure text field" |           |       |
| Error messages   | Full error text               |           |       |
| Success messages | Full success text             |           |       |
| Reminder state   | "Expanded/Collapsed"          |           |       |
| Payment amount   | "120 pounds"                  |           |       |

### Test ID: A11Y-02 - Font Scaling

**Priority:** Medium

| Setting       | Expected Behavior               | Pass/Fail | Notes |
| ------------- | ------------------------------- | --------- | ----- |
| Largest text  | All text visible, no truncation |           |       |
| Smallest text | Still readable                  |           |       |

---

## Test Execution Summary

### Test Coverage Matrix

| Story         | Total Tests | Critical | High | Medium | Low |
| ------------- | ----------- | -------- | ---- | ------ | --- |
| USR-001       | 5           | 1        | 3    | 1      | 0   |
| USR-002       | 4           | 2        | 2    | 0      | 0   |
| USR-003       | 6           | 0        | 3    | 3      | 0   |
| USR-004       | 5           | 0        | 2    | 2      | 1   |
| Integration   | 2           | 1        | 1    | 0      | 0   |
| Performance   | 2           | 0        | 0    | 2      | 0   |
| Edge Cases    | 3           | 0        | 3    | 0      | 0   |
| Accessibility | 2           | 0        | 0    | 2      | 0   |

### Pass/Fail Criteria

- All Critical tests must pass
- 90% of High priority tests must pass
- 80% of Medium priority tests must pass
- Low priority tests are informational

### Sign-off

| Role          | Name | Date | Signature |
| ------------- | ---- | ---- | --------- |
| Tester        |      |      |           |
| Developer     |      |      |           |
| Product Owner |      |      |           |

---

## Bug Report Template

**Bug ID:** BUG-USR-XXX-XX  
**Date Found:**  
**Tester:**  
**Story:** USR-XXX  
**Test ID:**  
**Priority:** Critical/High/Medium/Low

**Description:**  
[Clear description of the issue]

**Steps to Reproduce:**

1.
2.
3.

**Expected Result:**  
[What should happen]

**Actual Result:**  
[What actually happened]

**Screenshots/Videos:**  
[Attach if applicable]

**Device Info:**

- Device Model:
- OS Version:
- App Version:
- Network: WiFi/Cellular

**Additional Notes:**  
[Any other relevant information]
