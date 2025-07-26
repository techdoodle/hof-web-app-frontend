'use client';

import { LeaderboardHeader } from '@/components/LeaderboardHeader';
import { LeaderboardTabs } from '@/components/LeaderboardTabs';
import { LeaderboardFilters } from '@/components/LeaderboardFilters';
import { LeaderboardPodium } from '@/components/LeaderboardPodium';
import { LeaderboardList } from '@/components/LeaderboardList';
import { SeeYourselfBox } from '@/components/SeeYourselfBox';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// Dummy data for demonstration
const dummyLeaders = [
  { name: 'Pranab', xp: 455, image: '', position: 1 as 1 },
  { name: 'Mohit', xp: 352, image: '', position: 2 as 2 },
  { name: 'Jasdeep', xp: 321, image: '', position: 3 as 3 },
];
const dummyUsers = [
  { rank: 4, name: 'Juanita Cormier', xp: 310, image: '' },
  { rank: 5, name: 'Marsha Fisher', xp: 302, image: '' },
  { rank: 6, name: 'Juanita Cormier', xp: 301, image: '' },
  { rank: 7, name: 'Tamara Schmidt', xp: 298, image: '' },
  { rank: 8, name: 'Ricardo Veum', xp: 276, image: '' },
  { rank: 9, name: 'Marsha Fisher', xp: 244, image: '' },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('Overall');
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [selectedTime, setSelectedTime] = useState('Weekly');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const isLoggedIn = false; // Replace with real auth logic

  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center p-0" style={{ backgroundImage: 'url(/hof-background.svg)' }}>
      <div className="w-full max-w-md mx-auto rounded-b-3xl overflow-hidden relative">
        <LeaderboardHeader
          title="Bengaluru Leaderboard"
          onBack={() => router.back()}
          onShare={() => {}}
        />
        <LeaderboardTabs
          tabs={["Overall", "Striker", "Goalkeeper", "Defender"]}
          selected={selectedTab}
          onSelect={setSelectedTab}
        />
        <LeaderboardFilters
          cityOptions={["Bengaluru", "Mumbai", "Delhi"]}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
          timeOptions={["Weekly", "Monthly"]}
          selectedTime={selectedTime}
          onTimeChange={setSelectedTime}
          gender={gender}
          onGenderChange={setGender}
        />
        <LeaderboardPodium leaders={dummyLeaders} />
        <LeaderboardList users={dummyUsers} />
        <SeeYourselfBox
          isLoggedIn={isLoggedIn}
          onClick={() => router.push('/onboarding')}
        />
      </div>
    </div>
  );
}

 