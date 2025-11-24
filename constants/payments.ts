import { colorPalette } from './colors';
import { IconName } from './icons';

/**
 * Payment configuration constants
 * Centralizes all payment-related configurations
 *
 * Note: Payment types, statuses, and related constants have been moved to
 * @top/features/payments/types for better organization
 */

export const PaymentFiltersSettings = {
  // Filter values from drop-down
  FILTER_NEXT_7_DAYS: 'next_7_days',
  FILTER_NEXT_7_DAYS_TEXT: 'Next 7 days',
  FILTER_NEXT_7_DAYS_VALUE: 7,
  FILTER_NEXT_30_DAYS: 'next_30_days',
  FILTER_NEXT_30_DAYS_TEXT: 'Next 30 days',
  FILTER_NEXT_30_DAYS_VALUE: 30,
  FILTER_ALL: 'all',
  FILTER_ALL_TEXT: 'All',

  // Filter values from drop-down
  /*
        api/events:
            filter: 'this_week' | 'next_week' | 'next_30_days' | 'all' = 'this_week'
    */
};

export type PaymentFilters = keyof typeof PaymentFiltersSettings;

// Payment status types
export const PaymentStatus = {
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  PROCESSING: 'processing',
  PENDING: 'pending',
  OVERDUE: 'overdue',
} as const;

export type PaymentStatusType =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];

// Type for database payment status values (subset of PaymentStatusType)
export type PaymentHistoryStatusType =
  | typeof PaymentStatus.PAID
  | typeof PaymentStatus.FAILED
  | typeof PaymentStatus.CANCELLED;

// Payment status display configuration
export const PaymentStatusConfig: Record<
  PaymentStatusType,
  {
    backgroundColor: string;
    textColor: string;
    icon: IconName;
    label: string;
  }
> = {
  [PaymentStatus.PAID]: {
    backgroundColor: colorPalette.paymentStatusPaidBg,
    textColor: colorPalette.paymentStatusPaid,
    icon: IconName.CheckCircle,
    label: 'Paid',
  },
  [PaymentStatus.FAILED]: {
    backgroundColor: colorPalette.paymentStatusFailedBg,
    textColor: colorPalette.paymentStatusFailed,
    icon: IconName.XCircle,
    label: 'Failed',
  },
  [PaymentStatus.CANCELLED]: {
    backgroundColor: colorPalette.paymentStatusCancelledBg,
    textColor: colorPalette.paymentStatusCancelled,
    icon: IconName.Ban,
    label: 'Cancelled',
  },
  [PaymentStatus.PROCESSING]: {
    backgroundColor: colorPalette.paymentStatusProcessingBg,
    textColor: colorPalette.paymentStatusProcessing,
    icon: IconName.Clock,
    label: 'Processing',
  },
  [PaymentStatus.PENDING]: {
    backgroundColor: colorPalette.paymentDueDateBannerBg,
    textColor: colorPalette.warning,
    icon: IconName.Clock,
    label: 'Pending',
  },
  [PaymentStatus.OVERDUE]: {
    backgroundColor: colorPalette.errorLight,
    textColor: colorPalette.error,
    icon: IconName.AlertCircle,
    label: 'Overdue',
  },
};

// Payment sort options
export const PaymentSortOptions = {
  RECENT: 'recent',
  OLDEST: 'oldest',
  AMOUNT_HIGH: 'amount_high',
  AMOUNT_LOW: 'amount_low',
} as const;

export type PaymentSortType =
  (typeof PaymentSortOptions)[keyof typeof PaymentSortOptions];

export const PaymentSortLabels: Record<PaymentSortType, string> = {
  [PaymentSortOptions.RECENT]: 'Most Recent',
  [PaymentSortOptions.OLDEST]: 'Oldest First',
  [PaymentSortOptions.AMOUNT_HIGH]: 'Amount: High to Low',
  [PaymentSortOptions.AMOUNT_LOW]: 'Amount: Low to High',
};

// Payment type options
export const PaymentType = {
  REQUIRED: 'required',
  OPTIONAL: 'optional',
} as const;

export type PaymentTypeOption = (typeof PaymentType)[keyof typeof PaymentType];

// Currency formatting
export const formatCurrency = (pence: number): string => {
  return `£${(pence / 100).toFixed(2)}`;
};

// Date formatting for payments
export const formatPaymentDate = (date: string | Date): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  };
  return d.toLocaleDateString('en-GB', options);
};

export const formatPaymentTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const formatPaymentDateTime = (date: string | Date): string => {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeStr = formatPaymentTime(date);
  return `${dateStr} • ${timeStr}`;
};

// Stripe test cards for development
export const StripeTestCards = {
  SUCCESS: '4242424242424242',
  DECLINE: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED: '4000000000000069',
  PROCESSING_ERROR: '4000000000000119',
  INCORRECT_CVC: '4000000000000127',
} as const;

// Payment limits
export const PaymentLimits = {
  MIN_AMOUNT_PENCE: 100, // £1.00
  MAX_AMOUNT_PENCE: 100000000, // £1,000,000.00
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_TITLE_LENGTH: 100,
} as const;

// Payment UI constants
export const PaymentUIConstants = {
  CARD_BORDER_RADIUS: 16,
  BUTTON_BORDER_RADIUS: 12,
  BADGE_BORDER_RADIUS: 8,
  CARD_PADDING: 20,
  SECTION_GAP: 24,
  ITEM_GAP: 12,
  ROW_GAP: 8,
  BUTTON_HEIGHT: 40,
  AVATAR_SIZE: 24,
  AVATAR_BORDER_RADIUS: 9999,
  AVATAR_BORDER_RADIUS_HALF: 12, // For circular avatars when size is 24
  ICON_SIZE_SMALL: 14,
  ICON_SIZE_MEDIUM: 16,
  ICON_SIZE_LARGE: 48,
  CARD_PRESS_OPACITY: 0.95,
  MIN_TOUCH_TARGET: 44,
  PAGINATION_LIMIT: 20,
  PAYMENT_HISTORY_LIMIT: 50, // Maximum number of payments to display in history (MVP)
  CARD_BORDER_WIDTH: 1,
  EMPTY_STATE_PADDING_MULTIPLIER: 2,
  ACTION_SHEET_CANCEL_INDEX: 4,
  ERROR_CONTAINER_BORDER_RADIUS: 8,
  TOTAL_CARD_BORDER_RADIUS: 12,
} as const;

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

// Payment flow status for payment processing
export const PAYMENT_FLOW_STATUS = {
  IDLE: 'idle',
  CREATING_INTENT: 'creating_intent',
  SHEET_PRESENTED: 'sheet_presented',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type PaymentFlowStatus =
  (typeof PAYMENT_FLOW_STATUS)[keyof typeof PAYMENT_FLOW_STATUS];

// Payment UI messages
export const PAYMENT_UI_MESSAGES = {
  PAYMENT_SUCCESS: 'Payment successful!',
  PROCESSING_PAYMENT: 'Processing...',
  TRY_AGAIN: 'Try Again',
} as const;

// Payment error messages for edge functions
export const PAYMENT_ERROR_MESSAGES = {
  PAYMENT_INTENT_FAILED: 'Failed to create payment intent',
} as const;

// Helper function to get user-friendly error messages
export const getPaymentErrorMessage = (error: unknown): string => {
  if (!error) return PaymentErrorMessages.NETWORK_ERROR;

  const message = (
    error instanceof Error ? error.message : String(error)
  ).toLowerCase();

  if (message.includes('declined')) {
    return PaymentErrorMessages.PAYMENT_DECLINED;
  }
  if (message.includes('insufficient')) {
    return PaymentErrorMessages.INSUFFICIENT_FUNDS;
  }
  if (message.includes('network') || message.includes('connect')) {
    return PaymentErrorMessages.NETWORK_ERROR;
  }

  return error.message || PaymentErrorMessages.EDGE_FUNCTION_ERROR;
};
