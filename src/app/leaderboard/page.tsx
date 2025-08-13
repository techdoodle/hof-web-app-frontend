'use client';

import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { ComingSoon } from '@/components/common/ComingSoon';
import { CommonNavbar } from '@/components/common/CommonNavbar';
import { LeaderboardIcon } from '@/components/icons';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { UserData } from '@/modules/onboarding/types';
import { ChevronLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
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
              <h1 className="text-lg text-white">Leaderboard</h1>
              <div className="w-8"></div>
            </div>
          </div>

          <Leaderboard />

          {/* Common Navbar */}
          <CommonNavbar activeTab="leaderboard" />
        </div>
      )}
    </AuthWrapper>
  );
} 