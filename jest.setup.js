// Jest setup file - chạy trước mỗi test file
// Mock các modules cần thiết cho tests

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
