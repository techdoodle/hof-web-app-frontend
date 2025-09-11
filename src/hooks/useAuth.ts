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
    console.log('useAuth - token:', !!token, 'storedUser:', !!storedUser);

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
      console.log('useAuth - Set authenticated with stored user');
    } else if (token && !storedUser) {
      // Has token but no stored user - might be a fresh login
      setIsAuthenticated(true);
      console.log('useAuth - Has token but no stored user, will rely on query');
    }
    setIsInitialLoading(false);
  }, [token, isClient]);

  // Query to fetch current user data - always enabled if token exists
  const { data: currentUser, isLoading: isRefreshing, error, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<UserData> => {
      console.log('useAuth - Fetching user data from API');
      const repository = OnboardingRepository.getInstance();
      const result = await repository.getCurrentUser();
      console.log('useAuth - API returned user data:', !!result);
      return result;
    },
    enabled: !!token && isClient, // Always run if token exists and we're on client
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch on mount to ensure fresh data
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

  const logout = async () => {
    try {
      // Always clear local data regardless of API response
      clearAuthData();
      setIsAuthenticated(false);
      setUser(null);
      queryClient.clear(); // Clear all React Query cache
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
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