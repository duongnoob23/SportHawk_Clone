/**
 * Payment flow constants
 */

// Payment flow status for payment processing
export const PAYMENT_FLOW_STATUS = {
  IDLE: 'idle',
  CREATING_INTENT: 'creating_intent',
  SHEET_PRESENTED: 'sheet_presented',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Payment UI messages
export const PAYMENT_UI_MESSAGES = {
  PAYMENT_SUCCESS: 'Payment successful!',
  PROCESSING_PAYMENT: 'Processing...',
  TRY_AGAIN: 'Try Again',
} as const;
