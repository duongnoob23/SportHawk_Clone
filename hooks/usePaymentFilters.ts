import { useState, useCallback } from 'react';
import { logger } from '@lib/utils/logger';

export type PaymentFilterType =
  | 'all'
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'overdue';

export interface PaymentFilterOption {
  label: string;
  value: PaymentFilterType;
  description?: string;
}

export const PAYMENT_FILTER_OPTIONS: PaymentFilterOption[] = [
  { label: 'All', value: 'all', description: 'Show all payment requests' },
  { label: 'Today', value: 'today', description: 'Due today' },
  { label: 'This Week', value: 'this_week', description: 'Due within 7 days' },
  {
    label: 'This Month',
    value: 'this_month',
    description: 'Due within this month',
  },
  {
    label: 'Overdue',
    value: 'overdue',
    description: 'Past due date and unpaid',
  },
];

interface UsePaymentFiltersProps {
  currentFilter: PaymentFilterType;
  onFilterChange: (filter: PaymentFilterType) => void;
}

interface UsePaymentFiltersReturn {
  currentFilter: PaymentFilterType;
  currentFilterLabel: string;
  isDropdownOpen: boolean;
  toggleDropdown: () => void;
  handleFilterChange: (filter: PaymentFilterType) => void;
  filterOptions: PaymentFilterOption[];
}

/**
 * Custom hook for managing payment request filters
 * Provides a clean interface for filter selection with dropdown UI
 */
export function usePaymentFilters({
  currentFilter,
  onFilterChange,
}: UsePaymentFiltersProps): UsePaymentFiltersReturn {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentFilterLabel =
    PAYMENT_FILTER_OPTIONS.find(opt => opt.value === currentFilter)?.label ||
    'Filter';

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const handleFilterChange = useCallback(
    (filter: PaymentFilterType) => {
      logger.log('[PAY-007] Filter changed:', {
        from: currentFilter,
        to: filter,
      });
      onFilterChange(filter);
      setIsDropdownOpen(false); // Close dropdown after selection
    },
    [currentFilter, onFilterChange]
  );

  return {
    currentFilter,
    currentFilterLabel,
    isDropdownOpen,
    toggleDropdown,
    handleFilterChange,
    filterOptions: PAYMENT_FILTER_OPTIONS,
  };
}
