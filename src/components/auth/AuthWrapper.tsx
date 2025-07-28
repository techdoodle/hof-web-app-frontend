'use client';

import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { UserData } from '@/modules/onboarding/types';

interface AuthWrapperProps {
  children: (userData: UserData) => React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const { user: userData, isLoading, isAuthenticated } = useAuthContext();

  if (isLoading) {
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
          <a href="/onboarding" className="underline text-md text-gray-400">Please login to continue</a>
        </div>
      </div>
    );
  }

  return <>{children(userData)}</>;
} 