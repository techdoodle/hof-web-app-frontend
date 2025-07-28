'use client';

import { useState } from 'react';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { StatsTab } from '@/components/profile/StatsTab';
import { MatchHistoryTab } from '@/components/profile/MatchHistoryTab';
import { CommonNavbar } from '@/components/common/CommonNavbar';
import stats from '@/responses/profile.json';
import { UserData } from '@/modules/onboarding/types';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'matchHistory'>('stats');

  return (
    <AuthWrapper>
      {(userData: UserData) => (
        <div className="min-h-screen bg-background flex flex-col pb-24" style={{
            backgroundImage: 'url(/hof-background.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}>
          {/* Header */}
          <ProfileHeader userData={userData} />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            {/* Tab Content */}
            <div className="flex-1">
              {activeTab === 'stats' ? (
                <StatsTab userData={userData} stats={stats} />
              ) : (
                <MatchHistoryTab userData={userData} />
              )}
            </div>
          </div>
          
          {/* Common Navbar */}
          <CommonNavbar activeTab="profile" />
        </div>
      )}
    </AuthWrapper>
  );
} 