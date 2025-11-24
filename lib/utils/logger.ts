/**
 * Logger utility that adds HH:MM timestamps to console messages
 */

const getTimestamp = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `[${hours}:${minutes}]`;
};

export const logger = {
  log: (...args: any[]) => {
    console.log(getTimestamp(), ...args);
  },

  error: (...args: any[]) => {
    console.error(getTimestamp(), ...args);
  },

  warn: (...args: any[]) => {
    console.warn(getTimestamp(), ...args);
  },

  info: (...args: any[]) => {
    console.info(getTimestamp(), ...args);
  },

  debug: (...args: any[]) => {
    if (__DEV__) {
      console.log(getTimestamp(), '[DEBUG]', ...args);
    }
  },
};

/**
 * Override global console methods to add timestamps
 * Call this once in your app initialization (e.g., in App.tsx or index.tsx)
 */
export const enableTimestampedLogs = () => {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args: any[]) => {
    originalLog(getTimestamp(), ...args);
  };

  console.error = (...args: any[]) => {
    originalError(getTimestamp(), ...args);
  };

  console.warn = (...args: any[]) => {
    originalWarn(getTimestamp(), ...args);
  };
};
