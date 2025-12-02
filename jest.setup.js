// Jest setup file - chạy trước mỗi test file
// Mock các modules cần thiết cho tests

// Định nghĩa __DEV__ cho Jest (React Native global variable)
// Cần cho lib/supabase-dev.ts
// @ts-ignore - __DEV__ is declared in types/jest.d.ts
global.__DEV__ = true;

// Mock AsyncStorage (cần cho supabase-dev)
jest.mock('@react-native-async-storage/async-storage', () => ({}));

// Mock Supabase client (sẽ được override trong từng test file)
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock React Native modules nếu cần
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(obj => obj.ios),
  },
}));
