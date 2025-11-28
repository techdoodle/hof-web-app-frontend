'use client';

import React, { useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

interface OnboardingGuardProps {
    children: React.ReactNode;
    redirectTo?: string; // Where to redirect if onboarding incomplete (default: '/onboarding')
}

/**
 * OnboardingGuard - Ensures user has completed onboarding before accessing content
 * 
 * Use this wrapper for routes that absolutely require complete user profiles.
 * For example: booking matches, viewing certain features, etc.
 * 
 * @example
 * <OnboardingGuard>
 *   <YourProtectedContent />
 * </OnboardingGuard>
 */
export function OnboardingGuard({ children, redirectTo = '/onboarding' }: OnboardingGuardProps) {
    const { user: userData, isLoading, isAuthenticated } = useAuthContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && isAuthenticated && userData) {
            // Check if onboarding is incomplete
            if (!userData.onboardingComplete && pathname !== redirectTo) {
                console.log('OnboardingGuard - Onboarding incomplete, redirecting to:', redirectTo);
                router.push(redirectTo);
            }
        }
    }, [isLoading, isAuthenticated, userData, pathname, redirectTo, router]);

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Not authenticated - should be handled by AuthWrapper
    if (!isAuthenticated || !userData) {
        return null;
    }

    // Onboarding incomplete - show redirect message
    if (!userData.onboardingComplete && pathname !== redirectTo) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-white text-lg mb-2">Almost there!</p>
                    <p className="text-gray-400">Please complete your profile to continue</p>
                </div>
            </div>
        );
    }

    // Onboarding complete - render children
    return <>{children}</>;
}

