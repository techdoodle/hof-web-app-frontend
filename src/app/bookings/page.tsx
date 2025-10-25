'use client';

import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { CommonNavbar } from '@/components/common/CommonNavbar';
import { BookingHistory } from '@/components/booking/BookingHistory';
import { UserData } from '@/modules/onboarding/types';
import { ChevronLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

function BookingsContent() {
    const router = useRouter();

    return (
        <AuthWrapper>
            {(userData: UserData) => (
                <div className="min-h-screen flex flex-col pb-24 max-w-md mx-auto">
                    {/* Header */}
                    <div className="border-gray-800 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="w-8">
                                <ChevronLeftIcon className="w-6 h-6" onClick={() => router.back()} />
                            </div>
                            <h1 className="text-lg text-white">Bookings</h1>
                            <div className="w-8"></div>
                        </div>
                    </div>
                    <div>
                        <BookingHistory />
                    </div>
                    {/* Common Navbar */}
                    <CommonNavbar activeTab="profile" />
                </div>
            )}
        </AuthWrapper>
    );
}

export default function BookingsPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen text-white">Loading...</div>}>
            <BookingsContent />
        </Suspense>
    );
} 