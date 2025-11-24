// Event Types Configuration
// Single source of truth for event type values and display labels

export interface EventTypeConfig {
  value: string; // Lowercase value stored in database
  label: string; // Display label shown in UI
}

export const EVENT_TYPES: EventTypeConfig[] = [
  { value: 'home_match', label: 'Home Match' },
  { value: 'away_match', label: 'Away Match' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' },
];

// Default event type for forms - Home Match
export const DEFAULT_EVENT_TYPE = EVENT_TYPES[0].value;

// Helper function to get label from value
export const getEventTypeLabel = (value: string): string => {
  const eventType = EVENT_TYPES.find(type => type.value === value);
  return eventType?.label || value.charAt(0).toUpperCase() + value.slice(1);
};

// Helper function to get value from label
export const getEventTypeValue = (label: string): string => {
  const eventType = EVENT_TYPES.find(type => type.label === label);
  return eventType?.value || label.toLowerCase();
};

// Export for use in forms (just the values)
export const EVENT_TYPE_VALUES = EVENT_TYPES.map(type => type.value);

// Export for use in forms (just the labels)
export const EVENT_TYPE_LABELS = EVENT_TYPES.map(type => type.label);
