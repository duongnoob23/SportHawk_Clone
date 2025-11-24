import { useCallback, useState } from 'react';

export type TimeFilterType =
  | 'all'
  | 'next_7_days'
  | 'next_30_days'
  | 'next_90_days'
  |  'recent'
  |  'oldest'
  |  'amount_high'
  |  'amount_low'
  | 'past';
// export type TimeFilterType = 'next_7_days' | 'next_30_days' | 'all';

export interface TimeFilterOption {
  label: string;
  value: TimeFilterType;
}

export const TIME_FILTER_OPTIONS: TimeFilterOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Next 7 Days', value: 'next_7_days' },
  { label: 'Next 30 Days', value: 'next_30_days' },
  { label: 'Next 90 Days', value: 'next_90_days' },
  { label: 'Most Recent', value: 'recent' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Amount: High to Low', value: 'amount_high' },
  { label: 'Amount: Low to High', value: 'amount_low' },
  { label: 'Past', value: 'past' },
];

interface UseTimeFilterProps {
  initialFilter?: TimeFilterType;
  visibleOptions?: TimeFilterType[];
}

interface UseTimeFilterReturn {
  currentFilter: TimeFilterType;
  isDropdownOpen: boolean;
  toggleDropdown: () => void;
  handleFilterChange: (filter: TimeFilterType) => void;
  filterOptions: TimeFilterOption[];
}

export function getDateRangeFromFilter(filter?: TimeFilterType): {
  startDate?: Date;
  endDate?: Date;
} | null {
  if (!filter) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (filter) {
    case 'all':
      return null;

    case 'next_7_days': {
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);
      return { startDate: today, endDate };
    }

    case 'next_30_days': {
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 30);
      return { startDate: today, endDate };
    }

    case 'next_90_days': {
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 90);
      return { startDate: today, endDate };
    }

    case 'past': {
      return { endDate: today };
    }

    default:
      return null;
  }
}



/**
 * Custom hook for managing time filters
 * Provides a clean interface for time filter selection with dropdown UI
 */
export function useTimeFilter({
  initialFilter = 'all',
  visibleOptions,
}: UseTimeFilterProps): UseTimeFilterReturn {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentFilter, setCurrentFilter] =
    useState<TimeFilterType>(initialFilter);
  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const handleFilterChange = useCallback((filter: TimeFilterType) => {
    setCurrentFilter(filter);
    setIsDropdownOpen(false);
  }, []);

  const filterOptions = visibleOptions
    ? TIME_FILTER_OPTIONS.filter(opt => visibleOptions.includes(opt.value))
    : TIME_FILTER_OPTIONS;

  return {
    currentFilter,
    isDropdownOpen,
    toggleDropdown,
    handleFilterChange,
    filterOptions,
  };
}
