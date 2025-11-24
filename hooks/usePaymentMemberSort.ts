import { useCallback, useMemo, useState } from 'react';
import { logger } from '@lib/utils/logger';
import { PaymentStatusType } from '@top/features/payments';

export interface PaymentMemberDetail {
  userId: string;
  name: string;
  avatarUrl: string | null;
  paymentStatus: PaymentStatusType;
  amountPence: number;
  paidAt?: string | null;
}

export type SortType =
  | 'recent'
  | 'name_asc'
  | 'name_desc'
  | 'paid_first'
  | 'unpaid_first';

export interface SortOption {
  label: string;
  value: SortType;
}

export const SORT_OPTIONS: SortOption[] = [
  { label: 'Most Recent', value: 'recent' },
  { label: 'Name A-Z', value: 'name_asc' },
  { label: 'Name Z-A', value: 'name_desc' },
  { label: 'Paid First', value: 'paid_first' },
  { label: 'Unpaid First', value: 'unpaid_first' },
];

interface UsePaymentMemberSortProps {
  members: PaymentMemberDetail[];
}

interface UsePaymentMemberSortReturn {
  sortBy: SortType;
  sortLabel: string;
  sortedMembers: PaymentMemberDetail[];
  isDropdownOpen: boolean;
  toggleDropdown: () => void;
  handleSortChange: (sort: SortType) => void;
  sortOptions: SortOption[];
}

/**
 * Custom hook for sorting payment members
 * Provides a clean interface for sort selection with dropdown UI
 */
export function usePaymentMemberSort({
  members,
}: UsePaymentMemberSortProps): UsePaymentMemberSortReturn {
  const [sortBy, setSortBy] = useState<SortType>('recent');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sortLabel =
    SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || 'Sort';

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const sortedMembers = useMemo(() => {
    const sorted = [...members];

    switch (sortBy) {
      case 'name_asc':
        return sorted.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
      case 'name_desc':
        return sorted.sort((a, b) =>
          b.name.localeCompare(a.name, undefined, { sensitivity: 'base' })
        );
      case 'paid_first':
        return sorted.sort((a, b) => {
          if (a.paymentStatus === 'paid' && b.paymentStatus !== 'paid')
            return -1;
          if (a.paymentStatus !== 'paid' && b.paymentStatus === 'paid')
            return 1;
          return a.name.localeCompare(b.name, undefined, {
            sensitivity: 'base',
          });
        });
      case 'unpaid_first':
        return sorted.sort((a, b) => {
          if (a.paymentStatus === 'unpaid' && b.paymentStatus !== 'unpaid')
            return -1;
          if (a.paymentStatus !== 'unpaid' && b.paymentStatus === 'unpaid')
            return 1;
          return a.name.localeCompare(b.name, undefined, {
            sensitivity: 'base',
          });
        });
      case 'recent':
      default:
        return sorted.sort((a, b) => {
          if (a.paymentStatus === 'paid' && b.paymentStatus === 'paid') {
            const aDate = a.paidAt ? new Date(a.paidAt).getTime() : 0;
            const bDate = b.paidAt ? new Date(b.paidAt).getTime() : 0;
            return bDate - aDate;
          }
          if (a.paymentStatus === 'paid' && b.paymentStatus === 'unpaid') {
            return -1;
          }
          if (a.paymentStatus === 'unpaid' && b.paymentStatus === 'paid') {
            return 1;
          }
          return a.name.localeCompare(b.name, undefined, {
            sensitivity: 'base',
          });
        });
    }
  }, [members, sortBy]);

  const handleSortChange = useCallback((sort: SortType) => {
    logger.log('[PAY-007] Sort changed:', { to: sort });
    setSortBy(sort);
    setIsDropdownOpen(false); // Close dropdown after selection
  }, []);

  return {
    sortBy,
    sortLabel,
    sortedMembers,
    isDropdownOpen,
    toggleDropdown,
    handleSortChange,
    sortOptions: SORT_OPTIONS,
  };
}
