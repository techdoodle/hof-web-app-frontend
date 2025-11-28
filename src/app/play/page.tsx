'use client';

import { useState, useEffect, useRef } from 'react';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { CommonNavbar } from '@/components/common/CommonNavbar';
import { UserData } from '@/modules/onboarding/types';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, ClockIcon, MapPinIcon } from 'lucide-react';
import { LocationPicker } from '@/components/play/LocationPicker';
import { NearbyMatches } from '@/components/play/NearbyMatches';
import { locationService, DEFAULT_FALLBACK_LOCATION } from '@/lib/utils/locationService';
import { useLocation } from '@/contexts/LocationContext';
import { useToast } from '@/contexts/ToastContext';
import { useQueryClient } from '@tanstack/react-query';

export default function PlayPage() {
  const router = useRouter();
  const { location: contextLocation, error: locationError, isLoading: isLocationLoading } = useLocation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const hasShownDefaultToast = useRef(false);
  const previousLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    // Only run once on mount - don't react to context location changes
    // This prevents multiple queries when location changes
    const cachedLocation = locationService.getCachedLocation();
    if (cachedLocation) {
      setSelectedLocation(cachedLocation);
      setShowLocationPicker(false);
      previousLocationRef.current = cachedLocation;
      return;
    }

    // If no cached location, check context location (only on initial mount)
    if (contextLocation) {
      setSelectedLocation(contextLocation);
      setShowLocationPicker(false);
      previousLocationRef.current = contextLocation;
      return;
    }

    // If location loading is done and no location available
    if (!isLocationLoading) {
      // Check if permission was denied or location unavailable
      if (locationError === 'PERMISSION_DENIED' || !contextLocation) {
        // Set default fallback to Gurgaon so matches can be shown immediately
        const fallbackLocation = DEFAULT_FALLBACK_LOCATION;
        setSelectedLocation(fallbackLocation);
        // Cache it so it persists
        locationService.cacheLocation(fallbackLocation, 'manual');
        // Show location picker so user can change city if needed
        setShowLocationPicker(true);
        // Show toast only once
        if (!hasShownDefaultToast.current) {
          showToast('Location has been set by default to Gurugram. To change, go to HoF play section', 'info');
          hasShownDefaultToast.current = true;
        }
        previousLocationRef.current = fallbackLocation;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  const handleLocationSelected = (location: { latitude: number; longitude: number }) => {
    // Store the old location BEFORE updating anything
    const oldLocation = previousLocationRef.current;

    // Only proceed if location actually changed
    if (oldLocation &&
      oldLocation.latitude === location.latitude &&
      oldLocation.longitude === location.longitude) {
      // Same location, no need to do anything
      setShowLocationPicker(false);
      return;
    }

    // Cancel only the OLD location's query (if it exists)
    if (oldLocation) {
      // Cancel with exact match to only cancel the old location's query
      queryClient.cancelQueries({
        queryKey: ['nearby-matches', oldLocation.latitude, oldLocation.longitude],
        exact: true
      });
      queryClient.removeQueries({
        queryKey: ['nearby-matches', oldLocation.latitude, oldLocation.longitude],
        exact: true
      });
    }

    // Use requestAnimationFrame to ensure cancellation completes before new query starts
    requestAnimationFrame(() => {
      // Update the previous location ref
      previousLocationRef.current = location;

      // Set new location - this will trigger a fresh query for the new location
      setSelectedLocation(location);
      setShowLocationPicker(false);
    });
  };

  return (
    <AuthWrapper>
      {(userData: UserData) => (
        <div className="min-h-screen flex flex-col pb-24 max-w-md mx-auto">
          {/* Header */}
          <div className="border-b border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <div
                className="w-8 cursor-pointer flex items-center justify-center"
                onClick={() => router.back()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.back();
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <ChevronLeftIcon className="w-6 h-6 pointer-events-none" />
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