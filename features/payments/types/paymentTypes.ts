import { PAYMENT_FLOW_STATUS, PaymentStatus, PaymentType } from '../constants';

/**
 * Payment status types
 */
export type PaymentStatusType =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];

// Type for database payment status values (subset of PaymentStatusType)
export type PaymentHistoryStatusType =
  | typeof PaymentStatus.PAID
  | typeof PaymentStatus.FAILED
  | typeof PaymentStatus.CANCELLED;

/**
 * Payment type types
 */
export type PaymentTypeOption = (typeof PaymentType)[keyof typeof PaymentType];

/**
 * Payment flow types
 */
export type PaymentFlowStatus =
  (typeof PAYMENT_FLOW_STATUS)[keyof typeof PAYMENT_FLOW_STATUS];
