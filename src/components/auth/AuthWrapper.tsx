'use client';

import React, { useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { UserData } from '@/modules/onboarding/types';
import { useRouter, usePathname } from 'next/navigation';

interface AuthWrapperProps {
  children: (userData: UserData) => React.ReactNode;
  fallback?: React.ReactNode;
  requireOnboarding?: boolean; // If true, enforces onboarding completion
}

export function AuthWrapper({ children, fallback, requireOnboarding = true }: AuthWrapperProps) {
  const { user: userData, isLoading, isAuthenticated, error, refetch } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  console.log('AuthWrapper - userData:', userData, 'isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'error:', error);

  // Check onboarding status and redirect if incomplete
  useEffect(() => {
    if (!isLoading && isAuthenticated && userData && requireOnboarding) {
      // Don't redirect if already on onboarding page (prevent infinite loop)
      if (!userData.onboardingComplete && pathname !== '/onboarding') {
        console.log('AuthWrapper - Onboarding incomplete, redirecting to /onboarding');
        router.push('/onboarding');
      }
    }
  }, [isLoading, isAuthenticated, userData, requireOnboarding, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated but no userData, try to refetch
  if (isAuthenticated && !userData && !error) {
    console.log('AuthWrapper - User authenticated but no userData, attempting refetch...');
    refetch();
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !userData) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No user data found</p>
          <p className="text-gray-400 text-sm mb-4">
            Authenticated: {isAuthenticated ? 'Yes' : 'No'},
            User Data: {userData ? 'Present' : 'Missing'},
            Error: {error ? 'Yes' : 'No'}
          </p>
          <button
            onClick={() => refetch()}
            className="mb-4 px-4 py-2 bg-primary text-white rounded"
          >
            Retry Loading User Data
          </button>
          <br />
          <a href="/onboarding" className="underline text-md text-gray-400">Please login to continue</a>
        </div>
      </div>
    );
  }

  // If onboarding is required but not complete, show loading while redirecting
  if (requireOnboarding && !userData.onboardingComplete && pathname !== '/onboarding') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to complete your profile...</p>
        </div>
      </div>
    );
  }

  return <>{children(userData)}</>;
} 