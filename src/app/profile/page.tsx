'use client';

import { useState } from 'react';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { StatsTab } from '@/components/profile/StatsTab';
import { MatchHistoryTab } from '@/components/profile/MatchHistoryTab';
import { CommonNavbar } from '@/components/common/CommonNavbar';
import { UserData } from '@/modules/onboarding/types';
import { useProfile } from '@/hooks/useProfile';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'matchHistory'>('stats');
  const { userStats, userMatches, isLoading, error } = useProfile();

  return (
    <AuthWrapper>
      {(userData: UserData) => (
        <div className="min-h-screen bg-background flex flex-col pb-24" style={{
            backgroundImage: 'url(/hof-background.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}>
            {/* Mobile container with max-width for larger screens */}
            <div className="relative h-full w-full mx-auto flex flex-col max-w-md">
              {/* Header */}
              <ProfileHeader userData={userData} />
              
              {/* Main Content */}
              <div className="flex-1 flex flex-col">
                {/* Tabs */}
                <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
                
                {/* Tab Content */}
                <div className="flex-1">
                  {activeTab === 'stats' ? (
                    <StatsTab userData={userData} stats={userStats} isLoading={isLoading} error={error} />
                  ) : (
                    <MatchHistoryTab userData={userData} matches={userMatches} isLoading={isLoading} error={error} />
                  )}
                </div>
              </div>
              
              {/* Common Navbar */}
              <CommonNavbar activeTab="profile" />
            </div>
          </div>
      )}
    </AuthWrapper>
  );
} 