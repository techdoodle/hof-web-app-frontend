'use client';

import { useState, useEffect } from 'react';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { CommonNavbar } from '@/components/common/CommonNavbar';
import { UserData } from '@/modules/onboarding/types';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, ClockIcon, MapPinIcon } from 'lucide-react';
import { LocationPicker } from '@/components/play/LocationPicker';
import { NearbyMatches } from '@/components/play/NearbyMatches';

export default function PlayPage() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(true);

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setSelectedLocation(JSON.parse(savedLocation));
      setShowLocationPicker(false);
    }
  }, []);

  const handleLocationSelected = (location: { latitude: number; longitude: number }) => {
    setSelectedLocation(location);
    setShowLocationPicker(false);
  };

  return (
    <AuthWrapper>
      {(userData: UserData) => (
        <div className="min-h-screen flex flex-col pb-24 max-w-md mx-auto">
          {/* Header */}
          <div className="border-b border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="w-8">
                <ChevronLeftIcon className="w-6 h-6" onClick={() => router.push("/play")} />
              </div>
              <h1 className="text-lg text-white">Book & Play Matches</h1>
              <div className="flex flex-row items-center justify-end gap-2">
                <ClockIcon className="w-6 h-6 cursor-pointer" onClick={() => router.push("/bookings?status=CONFIRMED")} />
                {!showLocationPicker && (
                  <div className="w-8 cursor-pointer" onClick={() => setShowLocationPicker(true)}>
                    <MapPinIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 px-4 py-6 space-y-6">
            {showLocationPicker ? (
              <LocationPicker
                onLocationSelected={handleLocationSelected}
                className="mb-8"
              />
            ) : (
              <NearbyMatches />
            )}
          </div>

          {/* Common Navbar */}
          <CommonNavbar activeTab="play" />
        </div>
      )}
    </AuthWrapper>
  );
} 