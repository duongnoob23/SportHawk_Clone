# SportHawk \- Users Journey \- Sep 2025

Aim: Users journey remaining needed in explicit and exhaustive detail ([gFolder](https://drive.google.com/drive/folders/1zZWyo7gMaTrXW0SHxWRwIwRFJCip7cJo)) of [priority screens](https://docs.google.com/document/d/1FdjmQMkgeSyDq3smc2mETno_JKTIlZ6FQOpt1S1dR28/edit?tab=t.0#heading=h.37c21ygea0se)

NB Links are local and only available to the designers

Movies in: [Prototype Walkthroughs \- Google Drive](https://drive.google.com/drive/folders/11k2Ng4RPMWIDjVNL36qlMKIaMxIzgXFv), flows:

## Summary User

- Password forgot, to get SupaBase to start the password recovery sequence
- Password reset, to actually input a new password
- Profile, basic display (already DONE)
- Profile settings,
  - Profile picture and background (already DONE)
  - Sign out (already DONE)
  - payment history
- Reminders, on home screen (only displayed if there is something outstanding for the user)
  - Profile picture reminder if there isn't one

## Password Forgot

On the "Sign In" screen the user can tap a link to go to the Forgot Password screen.

The Forgot Password screen is as per Figma ID 559-216

User tapping "Send Reset Link" to trigger call the userForgotPassword()  
If successful the body of the screen should be changed to be a title "Reset Password Triggered" and text "You will shortly receive a Reset Password email, switch to your email Application on this device, click the link inside the email and you will be able to input and verify a new password.". The App should not allow the user to move off the page.

## Password Reset

When the user clicks the link in the Supabase Password Reset email, the device will use the App's schema to re-activate the App.

The re-activation should be detected by the App and the user routed to page as per Figma ID 559-200.  
The App should use the existing ShFormFieldPassword component for input of the New Password and Confirm Password. The Reset Password button should remain disabled until the same password of 8 or more characters is input (use the same check technique as per /app/(auth)/SingUp.tsx).

On tapping the Reset Password button the App is to call userResetPassword().  
If successful there is a pop-up to inform the user that the password has successfully been reset.  
On exiting the pop-up, if the user is already signed in then the user is signed out, the user is routed to the Sign In screen at /app/(auth)/SignIn.tsx.

## Profile Settings \- Payment History

The Profile Settings / Payment History screen as per Figma 559-7147, with Top Navigation technique as per Create-Event.

When a payment card is clicked, the detail of the payment is shown as per Figma ID 559-7357,, with Top Navigation technique as per Create-Event.

## Reminders On Home Page

NB There is no Figma design for this variant to the Home page.

If there are reminders then on the Home page, before the first post display a Title "Reminders", with an up arrow / down arrow at the right hand side that shows or hides the Reminder Cards.

For the MVP the only reminder is for the user profile picture.

If the user profile picture is not set then show a card with a button (primary style) "Set profile picture", when tapped route the user to the existing page /app/user/edit-profile.tsx .
