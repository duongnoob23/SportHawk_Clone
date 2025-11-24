module.exports = {
  // Không dùng jest-expo preset để tránh lỗi với react-native jest setup
  // Dùng Node environment cho unit tests (không test React components)
  testEnvironment: 'node',
  preset: 'ts-jest',
  roots: ['<rootDir>'],
  moduleNameMapper: {
    '^@top/(.*)$': '<rootDir>/$1',
    '^@cmp/(.*)$': '<rootDir>/components/$1',
    '^@con/(.*)$': '<rootDir>/constants/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@hks/(.*)$': '<rootDir>/hooks/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
    'tests/**/*.test.[jt]s?(x)',
  ],
  collectCoverageFrom: [
    'features/event/api/event.ts', // Chỉ collect coverage cho event API
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@supabase|@tanstack)/)',
  ],
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
