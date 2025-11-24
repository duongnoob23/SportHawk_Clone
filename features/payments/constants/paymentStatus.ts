/**
 * Payment status constants
 */

// Payment request status values (for payment_requests table)
export const PaymentRequestStatus = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

// Payment member status values (for payment_request_members table)
export const PaymentMemberStatus = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const;

// Legacy PaymentStatus for backward compatibility (deprecated)
export const PaymentStatus = {
  PAID: 'paid',
  UNPAID: 'unpaid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  PROCESSING: 'processing',
  PENDING: 'pending',
  OVERDUE: 'overdue',
} as const;
