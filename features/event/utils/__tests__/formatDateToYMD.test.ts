/**
 * Unit Test: formatDateToYMD Utility
 *
 * Test format date to YYYY-MM-DD format
 */

import { formatDateToYMD } from '../index';

describe('formatDateToYMD', () => {
  it('should format Date object to YYYY-MM-DD', () => {
    const date = new Date('2025-12-25T10:30:00');
    const result = formatDateToYMD(date);

    expect(result).toBe('2025-12-25');
  });

  it('should format date string to YYYY-MM-DD', () => {
    const dateString = '2025-12-25T10:30:00';
    const result = formatDateToYMD(dateString);

    expect(result).toBe('2025-12-25');
  });

  it('should pad single digit month and day with zeros', () => {
    const date = new Date('2025-01-05T10:30:00');
    const result = formatDateToYMD(date);

    expect(result).toBe('2025-01-05');
  });

  it('should handle different dates correctly', () => {
    expect(formatDateToYMD(new Date('2025-06-15'))).toBe('2025-06-15');
    expect(formatDateToYMD(new Date('2024-12-31'))).toBe('2024-12-31');
    expect(formatDateToYMD(new Date('2026-01-01'))).toBe('2026-01-01');
  });
});
