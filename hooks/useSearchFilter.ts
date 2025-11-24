import { useMemo, useState } from 'react';

interface SearchableItem {
  [key: string]: unknown;
}

interface UseSearchFilterOptions {
  searchFields: string[];
  caseSensitive?: boolean;
}

interface UseSearchFilterResult<T> {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredItems: T[];
  clearSearch: () => void;
}

export function useSearchFilter<T extends SearchableItem>(
  items: T[],
  options: UseSearchFilterOptions
): UseSearchFilterResult<T> {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = options.caseSensitive
      ? searchQuery.trim()
      : searchQuery.trim().toLowerCase();

    return items.filter(item => {
      return options.searchFields.some(fieldName => {
        const fieldValue = getNestedValue(item, fieldName);
        if (fieldValue === null || fieldValue === undefined) {
          return false;
        }

        const stringValue = String(fieldValue);
        const searchableValue = options.caseSensitive
          ? stringValue
          : stringValue.toLowerCase();

        return searchableValue.includes(query);
      });
    });
  }, [items, searchQuery, options.searchFields, options.caseSensitive]);

  const clearSearch = () => setSearchQuery('');

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    clearSearch,
  };
}

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current: any, key: string) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}
