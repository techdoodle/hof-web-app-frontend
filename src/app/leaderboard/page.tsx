'use client';

import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { CommonNavbar } from '@/components/common/CommonNavbar';
import { LeaderboardIcon } from '@/components/icons';
import { UserData } from '@/modules/onboarding/types';

export default function LeaderboardPage() {
  return (
    <AuthWrapper>
      {(userData: UserData) => (
        <div className="min-h-screen bg-background flex flex-col pb-24">
          {/* Header */}
          <div className="border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="w-8"></div>
              <h1 className="text-lg font-semibold text-white">Leaderboard</h1>
              <div className="w-8"></div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LeaderboardIcon className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Leaderboard</h3>
                <p className="text-gray-400">Leaderboard will be available soon</p>
                <p className="text-gray-500 text-sm mt-2">Welcome, {userData.firstName}!</p>
              </div>
            </div>
          </div>
          
          {/* Common Navbar */}
          <CommonNavbar activeTab="leaderboard" />
        </div>
      )}
    </AuthWrapper>
  );
} 