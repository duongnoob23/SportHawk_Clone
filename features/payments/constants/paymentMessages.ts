/**
 * Payment message constants
 */

// Payment error messages
export const PaymentErrorMessages = {
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  PAYMENT_DECLINED:
    'Payment was declined. Please try a different payment method.',
  INSUFFICIENT_FUNDS: 'Payment failed due to insufficient funds.',
  EDGE_FUNCTION_ERROR: 'Unable to process payment. Please try again.',
  ALREADY_PAID: 'This payment has already been completed.',
  PAYMENT_NOT_FOUND: 'Payment not found.',
  INVALID_AMOUNT: 'Invalid payment amount.',
  STRIPE_INIT_ERROR: 'Unable to initialize payment system. Please try again.',
  loadFailed: 'Failed to load payment requests',
  updateFailed: 'Failed to update payment request',
  cancelFailed: 'Failed to cancel payment request',
  reminderFailed: 'Failed to send reminders',
  memberLoadFailed: 'Failed to load member details',
  permissionDenied: 'You do not have permission to manage payments',
  dueDatePassed: 'Cannot edit amount or members - due date has passed',
  networkError: 'Network error. Please check your connection',
} as const;

// Payment success messages
export const PaymentSuccessMessages = {
  PAYMENT_COMPLETE: 'Payment completed successfully!',
  REMINDER_SENT: 'Payment reminder sent.',
  REQUEST_CREATED: 'Payment request created successfully.',
  REQUEST_UPDATED: 'Payment request updated.',
  REQUEST_CANCELLED: 'Payment request cancelled.',
} as const;

// Payment error messages for edge functions
export const PAYMENT_ERROR_MESSAGES = {
  PAYMENT_INTENT_FAILED: 'Failed to create payment intent',
} as const;
