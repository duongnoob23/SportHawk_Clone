import type {
  PaymentFilter,
  PaymentRequest,
} from '@top/features/teams/types';
import { TimeFilterType } from '@top/hooks/useTimeFilter';

export const normalizeToUTCDate = (
  dateStr: string | null | undefined
): Date | null => {
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr);
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    );
  } catch {
    return null;
  }
};

export const getTodayUTC = (): Date => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
};

export const isDueToday = (dueDate: string | null | undefined): boolean => {
  const dueDateUTC = normalizeToUTCDate(dueDate);
  if (!dueDateUTC) return false;

  const today = getTodayUTC();
  return dueDateUTC.getTime() === today.getTime();
};

export const isOverdue = (dueDate: string | null | undefined): boolean => {
  const dueDateUTC = normalizeToUTCDate(dueDate);
  if (!dueDateUTC) return false;

  const today = getTodayUTC();
  return dueDateUTC.getTime() < today.getTime();
};

export const isUpcoming = (dueDate: string | null | undefined): boolean => {
  const dueDateUTC = normalizeToUTCDate(dueDate);
  if (!dueDateUTC) return false;

  const today = getTodayUTC();
  return dueDateUTC.getTime() >= today.getTime();
};

export const isDueWithinDays = (
  dueDate: string | null | undefined,
  days: number
): boolean => {
  const dueDateUTC = normalizeToUTCDate(dueDate);
  if (!dueDateUTC) return false;

  const today = getTodayUTC();
  const endDate = new Date(today);
  endDate.setUTCDate(endDate.getUTCDate() + days);

  return (
    dueDateUTC.getTime() >= today.getTime() &&
    dueDateUTC.getTime() <= endDate.getTime()
  );
};

export const isDueThisMonth = (dueDate: string | null | undefined): boolean => {
  const dueDateUTC = normalizeToUTCDate(dueDate);
  if (!dueDateUTC) return false;

  const now = new Date();
  const today = getTodayUTC();
  const endOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)
  );

  return (
    dueDateUTC.getTime() >= today.getTime() &&
    dueDateUTC.getTime() <= endOfMonth.getTime()
  );
};

export const applyPaymentFilter = (
  payments: PaymentRequest[],
  paymentFilter: PaymentFilter
): PaymentRequest[] => {
  let filtered = payments.filter(p => p.paymentStatus !== 'paid');

  switch (paymentFilter) {
    case 'required':
      return filtered.filter(p => p.paymentType === 'required');

    case 'upcoming':
      return filtered.filter(p => isUpcoming(p.dueDate));

    case 'all':
    default:
      return filtered;
  }
};

export const filterPaymentRequests = (
  payments: PaymentRequest[],
  paymentFilter: PaymentFilter,
): PaymentRequest[] => {
  let filtered = applyPaymentFilter(payments, paymentFilter);
  return filtered;
};

export const countRequiredUnpaid = (payments: PaymentRequest[]): number => {
  return payments.filter(
    p =>
      p.paymentType === 'required' &&
      p.paymentStatus !== 'paid' &&
      isUpcoming(p.dueDate)
  ).length;
};
