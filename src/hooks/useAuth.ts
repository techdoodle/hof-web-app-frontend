import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAccessToken, getUser, refreshUserData, clearAuthData } from '@/lib/utils/auth';
import { OnboardingRepository } from '@/modules/onboarding/repository/onboarding.repository';
import { UserData } from '@/modules/onboarding/types';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = getAccessToken();
    const storedUser = getUser();
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  // Query to fetch current user data
  const { data: currentUser, isLoading: isRefreshing, error, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<UserData> => {
      const repository = OnboardingRepository.getInstance();
      return await repository.getCurrentUser();
    },
    enabled: isAuthenticated, // Only run if authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 401 (unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Handle successful data fetch
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      queryClient.setQueryData(['user'], currentUser);
      console.log('currentUser', currentUser);
      // Update localStorage with fresh data
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
  }, [currentUser, queryClient]);

  // Handle errors
  useEffect(() => {
    if (error && (error as any)?.response?.status === 401) {
      // Token is invalid, clear auth data
      clearAuthData();
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [error]);

  const refreshUser = async () => {
    try {
      const userData = await refreshUserData();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      throw error;
    }
  };

  const logout = () => {
    clearAuthData();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user: currentUser || user,
    isLoading: isLoading || isRefreshing,
    error,
    refreshUser,
    refetch,
    logout,
  };
} 