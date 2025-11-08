'use client';

import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { CommonNavbar } from '@/components/common/CommonNavbar';
import { UserData } from '@/modules/onboarding/types';
import { HomeBanner } from '@/components/home/HomeBanner';
import { HorizontalMatchCards } from '@/components/home/HorizontalMatchCards';
import { useRouter } from 'next/navigation';
import { useGoldenChip } from '@/hooks/useGoldenChip';
import { useEffect } from 'react';

export default function HomePage() {
    const router = useRouter();
    const { showNotification } = useGoldenChip();

    useEffect(() => {
        showNotification('Play a match and win XP', 5000);
    }, []);

    return (
        <AuthWrapper>
            {(userData: UserData) => (
                <div className="min-h-screen flex flex-col pb-24 max-w-md mx-auto">
                    {/* Banner Section */}
                    <HomeBanner />

                    {/* Pickup Matches Today Section */}
                    <div className="px-4 py-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-white text-xl font-semibold">Pickup Matches Today</h2>
                            <button
                                onClick={() => router.push('/play')}
                                className="text-white text-sm hover:text-primary transition-colors"
                            >
                                All &gt;
                            </button>
                        </div>

                        {/* Horizontal Scrollable Match Cards */}
                        <HorizontalMatchCards />
                    </div>

                    {/* Common Navbar */}
                    <CommonNavbar activeTab="home" />
                </div>
            )}
        </AuthWrapper>
    );
}

