# Authentication Screens As Components

## Welcome (Figma Id: 2:5088)

- ShWelcomeVideo
- ShLogoAndTitle
- ShText (Muted, "Bringing …")
- ShButton ("Get Started")
- ShButton ("Already Have Account")

## Sign In (Figma Id: 704:9577)

- ShIconTitleDescription (logo/icon name, "Sign In", "Sign…")
- ShButton (Google icon, "Continue with …")
- ShText (muted, "or continue …")
- ShFormFieldEmail
- ShFormFieldPassword
- ShTextWithLink ("", "Forgot …", callback)
- ShButton ("Sign In")
- ShTextWithLink ("Don't have", "Sign Up …", callback)

## Sign Up (Figma Id: 704:9547)

- ShIconTitleDescription (logo/icon name, "Sign Up", "Sign…")
- ShButton (Google icon, "Continue with …")
- ShText (muted, "or continue …")
- ShFormFieldName ("First Name")
- ShFormFieldName ("Surname")
- ShFormFieldDate ("Date of", required, "Enter …", max=now-16y)
- ShFormFieldChoice ("Male", "Female")
- ShFormFieldEmail
- ShFormFieldPassword
- ShFormFieldPassword ("Confirm …")
- ShTextWithLink ("By", "Pay…", callback, "and", "Priv", callback)
- ShButton ("Sign Up")
- ShTextWithLink ("Already", "Sign In …", callback)

## Verify (Figma Id: 704:9516)

- ShIconTitleDescription (logo/icon name, "Sign In", "Sign…")
- ShText (registrant's email)
- ShTextWithLink ("", "Change email …", callback)
- ShFormFieldCode (size=6)
- ShButton ("Verify …")
- ShTextWithLink ("Didn't receive …", "Resend", callback)
- (inline: handle 30s countdown)

## Complete (Figma Id: 704:9500)

- ShIconTitleDescription (logo/icon name, "Complete", "Just…")
- ShFormFieldName ("First Name")
- ShFormFieldName ("Surname")
- ShFormFieldDate ("Date of", required, "Enter …", max=now-16y)
- ShFormFieldChoice ("Male", "Female")
- ShTextWithLink ("By", "Pay…", callback, "and", "Priv", callback)
- ShButton ("Sign Up")

## Build Profile (Figma Id: 704:9473)

- ShIconTitleDescription (icon name, "Build…", "Add…")
- ShFormFieldPhoto ("Profile Photo", icons, message)
- ShFormFieldPhoto ("Background Photo", icons, message)
- ShText (muted, "Choose …", feint box)
- ShBulletedList ("Photo Guidelines", tick, "Clear…, "Well-lit …")
- ShButton ("Save Photos")
- ShButton ("Maybe Later")

## Interests (Figma Id: 704:9431)

- ShIconTitleDescription (icon name, "Build…", "Add…")
- (inline: handle count of chosen)
- ShChoice ("Sports" …)
- ShChoice ("Features" …)
- ShChoice ("Social" …)
- ShButton ("Save Interests")
- ShButton ("Maybe Later")

## Location (Figma Id: 704:9398)

- ShIconTitleDescription (icon name, "Enable Loc…", "Find…")
- ShIconTitleDescription (pin, "Discover…", "Find…", boxed)
- ShIconTitleDescription (compass, "Pers…", "Get…", boxed)
- ShIconTitleDescription (route, "Easy Nav…", "Get…", boxed)
- ShButton ("Enable Location")
- ShButton ("Maybe Later")
- ShText (muted, "You can …")

## Notifications (Figma Id: 704:9365)

- ShIconTitleDescription (bell, "Enable Not…", "Stay…")
- ShIconTitleDescription (cal, boxed)
- ShIconTitleDescription (card, boxed)
- ShIconTitleDescription (hailer,, boxed)
- ShButton ("Enable Notifications")
- ShButton ("Maybe Later")
- ShText (muted, "You can …")

## Forgot Password (Figma Id: 704:9431)

- ShIconTitleDescription (key, "Forgot…", "Enter…")
- ShFormFieldEmail
- ShButton ("Send Reset …")
- ShButton ("Back to …")
- ShText
- ShIconTextLink (envelope, "Contact …")
- ShIconTextLink (query, "FAQ")
- Reset Password
- ShIconTitleDescription (padlock, "Reset …", "Please…")
- ShFormFieldPassword
- ShFormFieldPassword ("Confirm …")
- ShButton ("Reset Password")
- ShButton ("Back to Sign In")

## Reset Password (Figma Id: 704:9324)

- ShIconTitleDescription (padlock, "Reset …", "Please…")
- ShFormFieldPassword
- ShFormFieldPassword ("Confirm …")
- ShButton ("Reset Password")
- ShButton ("Back to Sign In")
