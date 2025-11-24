export const appValues = {
  // --- Age & Registration Constants ---
  minimumSignUpAge: 18, // Minimum age required to sign up
  maximumAgeLimit: 100, // Maximum age limit for date picker
  defaultAgeForDatePicker: 20, // Default age (years ago) for date picker initial value

  // --- Verification & Security ---
  resendTimerSeconds: 30, // Seconds to wait before allowing resend of verification code
  otpCodeLength: 6, // Length of OTP verification code

  // --- Search & Debounce Values ---
  searchDebounceMs: 500, // Default search debounce for the app

  defaultClubId: '5864d4bc-f0ab-4700-8e98-7dff44f89245', // Fremington FC
};

export type AppValuesKey = keyof typeof appValues;
