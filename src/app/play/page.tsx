'use client';

import { useState, useEffect } from 'react';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { CommonNavbar } from '@/components/common/CommonNavbar';
import { UserData } from '@/modules/onboarding/types';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, ClockIcon, MapPinIcon } from 'lucide-react';
import { LocationPicker } from '@/components/play/LocationPicker';
import { NearbyMatches } from '@/components/play/NearbyMatches';
import { locationService, DEFAULT_FALLBACK_LOCATION } from '@/lib/utils/locationService';
import { useLocation } from '@/contexts/LocationContext';

export default function PlayPage() {
  const router = useRouter();
  const { location: contextLocation, error: locationError, isLoading: isLocationLoading } = useLocation();
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    // Use locationService to get validated cached location
    const cachedLocation = locationService.getCachedLocation();
    if (cachedLocation) {
      setSelectedLocation(cachedLocation);
      setShowLocationPicker(false);
    } else if (!isLocationLoading) {
      // If no cached location and location loading is done
      // Check if permission was denied or location unavailable
      if (locationError === 'PERMISSION_DENIED' || !contextLocation) {
        // Set default fallback to Gurgaon so matches can be shown
        setSelectedLocation(DEFAULT_FALLBACK_LOCATION);
        locationService.cacheLocation(DEFAULT_FALLBACK_LOCATION, 'manual');
        // Show location picker so user can change city if needed
        setShowLocationPicker(true);
      } else if (contextLocation) {
        // Location is available from context
        setSelectedLocation(contextLocation);
        setShowLocationPicker(false);
      }
    }
  }, [contextLocation, locationError, isLocationLoading]);

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
            {showLocationPicker && (
              <LocationPicker
                onLocationSelected={handleLocationSelected}
                className="mb-8"
              />
            )}
            {selectedLocation && (
              <NearbyMatches location={selectedLocation} />
            )}
            {!selectedLocation && !isLocationLoading && (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading location...</p>
              </div>
            )}
          </div>

          {/* Common Navbar */}
          <CommonNavbar activeTab="play" />
        </div>
      )}
    </AuthWrapper>
  );
} 