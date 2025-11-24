export const EventFilters = {
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

export type EventConfig = keyof typeof EventFilters;
