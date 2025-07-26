'use client';

import { useState } from 'react';
import { useUserData } from '@/hooks/useUserData';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { StatsTab } from '@/components/profile/StatsTab';
import { MatchHistoryTab } from '@/components/profile/MatchHistoryTab';
import { CommonNavbar } from '@/components/common/CommonNavbar';

export default function ProfilePage() {
  const { userData, isLoading } = useUserData();
  const [activeTab, setActiveTab] = useState<'stats' | 'matchHistory'>('stats');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No user data found</p>
          <p className="text-sm text-gray-400">Please complete onboarding</p>
        </div>
      </div>
    );
  }

  return (
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
            <StatsTab userData={userData} />
          ) : (
            <MatchHistoryTab userData={userData} />
          )}
        </div>
      </div>
      
      {/* Common Navbar */}
      <CommonNavbar activeTab="profile" />
    </div>
  );
} 