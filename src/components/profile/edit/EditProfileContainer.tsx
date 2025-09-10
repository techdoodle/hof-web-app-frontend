'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserData } from '@/modules/onboarding/types';
import { EditProfileHeader } from './EditProfileHeader';
import { EditProfilePicture } from './EditProfilePicture';
import { useEditProfile } from '@/hooks/useEditProfile';
import { EditProfileForm } from './EditProfileForm';

interface EditProfileContainerProps {
    userData: UserData;
}

export function EditProfileContainer({ userData: initialUserData }: EditProfileContainerProps) {
    const router = useRouter();
    const {
        userData,
        isLoading,
        error,
        refreshUserData,
        updateUserField,
        updateProfilePicture
    } = useEditProfile(initialUserData);

    // Load fresh data if not present in cache
    useEffect(() => {
        if (!userData || !userData.id) {
            refreshUserData();
        }
    }, [userData, refreshUserData]);

    const handleBack = () => {
        router.push('/profile');
    };

    if (isLoading && !userData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center" style={{
                backgroundImage: 'url(/hof-background.svg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center" style={{
                backgroundImage: 'url(/hof-background.svg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}>
                <div className="text-center">
                    <p className="text-red-500 mb-4">Failed to load profile data</p>
                    <button
                        onClick={refreshUserData}
                        className="px-4 py-2 bg-primary text-white rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!userData) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col" style={{
            backgroundImage: 'url(/hof-background.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }}>
            {/* Mobile container with max-width for larger screens */}
            <div className="relative h-full w-full mx-auto flex flex-col max-w-md">
                {/* Header */}
                <EditProfileHeader onBack={handleBack} />

                {/* Profile Picture Section */}
                <EditProfilePicture
                    key={`profile-pic-${userData.id}-${userData.city?.cityName || 'no-city'}`}
                    userData={userData}
                    onUpdateProfilePicture={updateProfilePicture}
                    isLoading={isLoading}
                />

                {/* Form Section */}
                <EditProfileForm
                    key={`${userData.id}-${userData.city?.cityName || 'no-city'}-${userData.firstName}-${userData.lastName}`}
                    userData={userData}
                    onUpdateField={updateUserField}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
}
