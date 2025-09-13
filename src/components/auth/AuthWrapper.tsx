'use client';

import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { UserData } from '@/modules/onboarding/types';

interface AuthWrapperProps {
  children: (userData: UserData) => React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const { user: userData, isLoading, isAuthenticated, error, refetch } = useAuthContext();

  console.log('AuthWrapper - userData:', userData, 'isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'error:', error);

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

  return <>{children(userData)}</>;
} 