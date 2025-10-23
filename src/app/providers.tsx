'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { CacheClearer } from '@/components/utils/CacheClearer';
import { LocationProvider } from '@/contexts/LocationContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry if it's a 401 (unauthorized)
        if (error?.response?.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <LocationProvider>
            <CacheClearer />
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </LocationProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
} 