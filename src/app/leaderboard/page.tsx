"use client";
{
  /*
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { CommonNavbar } from '@/components/common/CommonNavbar';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { GoalsAssistsLeaderboard } from '@/components/leaderboard/GoalsAssistsLeaderboard';
import { AppearancesLeaderboard } from '@/components/leaderboard/AppearancesLeaderboard';
import { UserData } from '@/modules/onboarding/types';
import { ChevronLeftIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LeaderboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overall';

  return (
    <AuthWrapper>
      {(userData: UserData) => (
        <div className="min-h-screen flex flex-col pb-24 max-w-md mx-auto">
          {/* Header *}
          <div className="border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="w-8">
                <ChevronLeftIcon className="w-6 h-6" onClick={() => router.back()} />
              </div>
              <h1 className="text-lg text-white">Leaderboard</h1>
              <div className="w-8"></div>
            </div>
          </div>

          {/* Content based on active tab - the filters are inside each component *}
          {activeTab === 'gna' ? (
            <GoalsAssistsLeaderboard />
          ) : activeTab === 'appearances' ? (
            <AppearancesLeaderboard />
          ) : (
            <Leaderboard />
          )}

          {/* Common Navbar *}
          <CommonNavbar activeTab="leaderboard" />
        </div>
      )}
    </AuthWrapper>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen text-white">Loading...</div>}>
      <LeaderboardContent />
    </Suspense>
  );
} 

*/
}

import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { CommonNavbar } from "@/components/common/CommonNavbar";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { UserData } from "@/modules/onboarding/types";
import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

function LeaderboardContent() {
  const router = useRouter();

  return (
    <AuthWrapper>
      {(userData: UserData) => (
        <div className="min-h-screen flex flex-col pb-24 max-w-md mx-auto">
          <div className="border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="w-8">
                <ChevronLeftIcon
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => router.back()}
                />
              </div>
              <h1 className="text-lg text-white">Leaderboard</h1>
              <div className="w-8"></div>
            </div>
          </div>

          <Leaderboard />

          <CommonNavbar activeTab="leaderboard" />
        </div>
      )}
    </AuthWrapper>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen text-white">
          Loading...
        </div>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
}
