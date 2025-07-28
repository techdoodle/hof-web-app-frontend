import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAccessToken, getUser, refreshUserData, clearAuthData } from '@/lib/utils/auth';
import { OnboardingRepository } from '@/modules/onboarding/repository/onboarding.repository';
import { UserData } from '@/modules/onboarding/types';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const queryClient = useQueryClient();

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoize the token to prevent unnecessary re-renders
  const token = useMemo(() => {
    if (!isClient) return null;
    return getAccessToken();
  }, [isClient]);

  // Check if user is authenticated on mount
  useEffect(() => {
    if (!isClient) return;
    
    const storedUser = getUser();
    
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
    }
    setIsInitialLoading(false);
  }, [token, isClient]);

  // Query to fetch current user data - only enabled if token exists and we haven't loaded from cache
  const { data: currentUser, isLoading: isRefreshing, error, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<UserData> => {
      const repository = OnboardingRepository.getInstance();
      const result = await repository.getCurrentUser();
      return result;
    },
    enabled: !!token && !user && isClient, // Only run if token exists, no user data, and we're on client
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if we have data
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
      setIsAuthenticated(true);
      queryClient.setQueryData(['user'], currentUser);
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
      setIsAuthenticated(true);
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

  // Determine if we're still loading
  const isLoading = isInitialLoading || isRefreshing || !isClient;

  return {
    isAuthenticated,
    user: currentUser || user,
    isLoading,
    error,
    refreshUser,
    refetch,
    logout,
  };
} 