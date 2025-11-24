/**
 * Payment utility functions
 */

import { PaymentErrorMessages } from './paymentMessages';

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

export const isDueDatePast = (dueDate: string | null | undefined): boolean => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export const getDaysUntilDue = (dueDate: string | null | undefined): number => {
  if (!dueDate) return 0;
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper function to get user-friendly error messages
export const getPaymentErrorMessage = (error: unknown): string => {
  if (!error) return PaymentErrorMessages.NETWORK_ERROR;

  const message = (
    error instanceof Error ? error.message : JSON.stringify(error)
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

  return (error as Error).message || PaymentErrorMessages.EDGE_FUNCTION_ERROR;
};
