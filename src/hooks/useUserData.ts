import { useQueryClient } from '@tanstack/react-query';
import { UserData } from '@/modules/onboarding/types';
import { useEffect, useState } from 'react';

export function useUserData() {
  const queryClient = useQueryClient();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get cached user data from React Query
    const cachedUserData = queryClient.getQueryData<UserData>(['user']);
    
    if (cachedUserData) {
      setUserData(cachedUserData);
      setIsLoading(false);
      console.log('User data from React Query cache:', cachedUserData);
    } else {
      // Fallback to localStorage if no cached data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
          console.log('User data from localStorage:', parsedUser);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
        }
      }
      setIsLoading(false);
    }
  }, [queryClient]);

  // Function to refresh user data
  const refreshUserData = () => {
    const cachedUserData = queryClient.getQueryData<UserData>(['user']);
    if (cachedUserData) {
      setUserData(cachedUserData);
    }
  };

  // Function to update user data in both cache and state
  const updateUserData = (newUserData: UserData) => {
    queryClient.setQueryData(['user'], newUserData);
    setUserData(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  return {
    userData,
    isLoading,
    refreshUserData,
    updateUserData,
  };
} 