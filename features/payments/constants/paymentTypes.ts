/**
 * Payment type constants
 */

// Payment type values
export const PaymentType = {
  REQUIRED: 'required',
  OPTIONAL: 'optional',
  NONE: 'none',
} as const;

// Default payment type
export const DEFAULT_PAYMENT_TYPE = PaymentType.REQUIRED;

// Payment types for form options
export const PAYMENT_TYPES = [
  { label: 'Required', value: PaymentType.REQUIRED },
  { label: 'Optional', value: PaymentType.OPTIONAL },
] as const;

// Payment sort options
export const PaymentSortOptions = {
  RECENT: 'recent',
  OLDEST: 'oldest',
  AMOUNT_HIGH: 'amount_high',
  AMOUNT_LOW: 'amount_low',
} as const;

export const PaymentSortLabels: Record<string, string> = {
  [PaymentSortOptions.RECENT]: 'Most Recent',
  [PaymentSortOptions.OLDEST]: 'Oldest First',
  [PaymentSortOptions.AMOUNT_HIGH]: 'Amount: High to Low',
  [PaymentSortOptions.AMOUNT_LOW]: 'Amount: Low to High',
};
