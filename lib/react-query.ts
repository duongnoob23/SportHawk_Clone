import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Infinite stale time
      gcTime: 1000 * 60 * 60, // 1 hour
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
// LỖI FIX 3 TIẾNG , KHÔNG CÓ CACHE CHO TOÀN APP VÌ KHÔNG SỬ DỤNG QUERYCLIENT TRONG QUERYCLIENT-PROFILE
