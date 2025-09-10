'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UserData } from '@/modules/onboarding/types';
import { OnboardingRepository } from '@/modules/onboarding/repository/onboarding.repository';
import { getAccessToken } from '@/lib/utils/auth';

interface UseEditProfileReturn {
    userData: UserData | null;
    isLoading: boolean;
    error: string | null;
    refreshUserData: () => Promise<void>;
    updateUserField: (field: string, value: any) => Promise<void>;
    updateProfilePicture: (file: File) => Promise<{ url: string }>;
}

export function useEditProfile(initialUserData?: UserData): UseEditProfileReturn {
    const [userData, setUserData] = useState<UserData | null>(initialUserData || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const repository = OnboardingRepository.getInstance();

    // Initialize with cached data if available
    useEffect(() => {
        if (!userData) {
            const cachedUserData = queryClient.getQueryData(['user']) as UserData;
            if (cachedUserData && cachedUserData.id) {
                console.log('useEditProfile - initializing with cached data:', cachedUserData);
                setUserData(cachedUserData);
            }
        }
    }, [queryClient, userData]);

    // Check cache first, then refresh from API if needed
    const refreshUserData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Check cache first
            const cachedUserData = queryClient.getQueryData(['user']) as UserData;
            console.log('refreshUserData - cached data:', cachedUserData);
            if (cachedUserData && cachedUserData.id) {
                setUserData(cachedUserData);
                console.log('refreshUserData - using cached data, setting local state');
                setIsLoading(false);
                return;
            }

            // If not in cache or incomplete, fetch from API
            console.log('refreshUserData - fetching fresh data from API');
            const freshUserData = await repository.getCurrentUser();
            console.log('refreshUserData - fresh data from API:', freshUserData);
            setUserData(freshUserData);

            // Update cache
            queryClient.setQueryData(['user'], freshUserData);
            console.log('refreshUserData - updated cache and local state');
        } catch (err) {
            console.error('Failed to refresh user data:', err);
            setError('Failed to load user data');
        } finally {
            setIsLoading(false);
        }
    }, [queryClient, repository]);

    const updateUserField = useCallback(async (field: string, value: any) => {
        try {
            setIsLoading(true);
            setError(null);
            const token = getAccessToken();

            if (!token) {
                throw new Error('No access token available');
            }

            // Get current user data from cache to avoid stale closure
            const currentUserData = queryClient.getQueryData(['user']) as UserData || userData;
            if (!currentUserData || !currentUserData.id) {
                await refreshUserData();
                const refetchedUserData = queryClient.getQueryData(['user']) as UserData;
                if (!refetchedUserData || !refetchedUserData.id) {
                    throw new Error('No current user data available');
                }
            }

            let updateData: any = {};

            switch (field) {
                case 'userInfo':
                    updateData = {
                        firstName: value.firstName,
                        lastName: value.lastName,
                        city: value.city
                    };
                    break;
                case 'gender':
                    updateData = { gender: value };
                    break;
                case 'position':
                    updateData = { playerCategory: value };
                    break;
                case 'preferredTeam':
                    updateData = { preferredTeam: value };
                    break;
                default:
                    updateData = { [field]: value };
            }

            console.log('useEditProfile - updating with data:', updateData, 'for user:', currentUserData.id);
            const updateResult = await repository.updateUserInfo(updateData, currentUserData.id, token);
            console.log('useEditProfile - update result:', updateResult);

            // Force fetch fresh data from backend immediately
            console.log('useEditProfile - fetching fresh data after update');
            const freshUserData = await repository.getCurrentUser();
            console.log('useEditProfile - fresh data received:', freshUserData);

            // Update both local state and cache with fresh data
            setUserData(freshUserData);
            queryClient.setQueryData(['user'], freshUserData);
            console.log('useEditProfile - updated both local state and cache');
        } catch (err) {
            console.error('Failed to update user field:', err);
            setError('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    }, [repository, queryClient, refreshUserData]);

    const updateProfilePicture = useCallback(async (file: File): Promise<{ url: string }> => {
        try {
            setIsLoading(true);
            setError(null);
            const token = getAccessToken();

            if (!token) {
                throw new Error('No access token available');
            }

            // Get current user data from cache to avoid stale closure
            const currentUserData = queryClient.getQueryData(['user']) as UserData;
            if (!currentUserData || !currentUserData.id) {
                throw new Error('No current user data available');
            }

            const result = await repository.uploadProfilePicture(file, token);

            // Update cache immediately with new profile picture
            const updatedUserData = { ...currentUserData, profilePicture: result.url };
            queryClient.setQueryData(['user'], updatedUserData);
            setUserData(updatedUserData);

            return result;
        } catch (err) {
            console.error('Failed to update profile picture:', err);
            setError('Failed to update profile picture');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [repository, queryClient]);

    return {
        userData,
        isLoading,
        error,
        refreshUserData,
        updateUserField,
        updateProfilePicture
    };
}
