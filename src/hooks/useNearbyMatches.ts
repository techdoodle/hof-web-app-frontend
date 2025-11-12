import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLocation } from '@/contexts/LocationContext';

interface Venue {
    id: number;
    name: string;
    address: string;
    display_banner?: string;
    displayBanner?: string;
    distance: number;
}

interface Match {
    id: number;
    startTime: string;
    endTime: string;
    matchType: string;
    slotPrice: number;
    offerPrice: number;
    playerCapacity: number;
    bookedSlots: number;
}

interface VenueWithMatches {
    venue: Venue;
    matches: Match[];
}

export function useNearbyMatches() {
    const { location, isLoading: isLocationLoading } = useLocation();

    return useQuery({
        queryKey: ['nearby-matches', location?.latitude, location?.longitude],
        queryFn: async () => {
            if (!location) return [];

            // Ensure location is properly typed (should already be validated by locationService)
            const latitude = typeof location.latitude === 'number'
                ? location.latitude
                : Number(location.latitude);
            const longitude = typeof location.longitude === 'number'
                ? location.longitude
                : Number(location.longitude);

            // Validate numbers are valid
            if (isNaN(latitude) || isNaN(longitude)) {
                throw new Error('Invalid location coordinates');
            }

            // Validate ranges
            if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
                throw new Error('Location coordinates out of valid range');
            }

            const response = await api.post('/matches/nearby', {
                latitude,
                longitude,
            });
            return response.data;
        },
        enabled: !!location && !isLocationLoading,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}
