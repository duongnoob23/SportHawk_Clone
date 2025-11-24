/**
 * Unit Test: Logger Utility
 *
 * Test các chức năng logging cơ bản
 */

import { logger } from '../logger';

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
  info: jest.spyOn(console, 'info').mockImplementation(),
};

describe('Logger Utility', () => {
  beforeEach(() => {
    // Reset mocks trước mỗi test
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore console sau khi test xong
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.info.mockRestore();
  });

  describe('logger.log', () => {
    it('should call console.log with timestamp', () => {
      logger.log('Test message');

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      // Kiểm tra có timestamp format [HH:MM]
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}\]/),
        'Test message'
      );
    });

    it('should handle multiple arguments', () => {
      logger.log('Message 1', 'Message 2', { key: 'value' });

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}\]/),
        'Message 1',
        'Message 2',
        { key: 'value' }
      );
    });
  });

  describe('logger.error', () => {
    it('should call console.error with timestamp', () => {
      logger.error('Error message');

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}\]/),
        'Error message'
      );
    });
  });

  describe('logger.warn', () => {
    it('should call console.warn with timestamp', () => {
      logger.warn('Warning message');

      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}\]/),
        'Warning message'
      );
    });
  });

  describe('logger.info', () => {
    it('should call console.info with timestamp', () => {
      logger.info('Info message');

      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{2}:\d{2}\]/),
        'Info message'
      );
    });
  });
});
