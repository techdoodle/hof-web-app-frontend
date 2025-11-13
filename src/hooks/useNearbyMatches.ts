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

export function useNearbyMatches(customLocation?: { latitude: number; longitude: number } | null) {
    const { location: contextLocation, isLoading: isLocationLoading } = useLocation();
    // Use custom location if provided, otherwise use context location
    const location = customLocation !== undefined ? customLocation : contextLocation;

    return useQuery({
        queryKey: ['nearby-matches', location?.latitude, location?.longitude],
        queryFn: async ({ signal }) => {
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
            }, {
                signal, // Pass abort signal to cancel the request when query is cancelled
            });
            return response.data;
        },
        enabled: !!location && (customLocation !== undefined || !isLocationLoading),
        staleTime: 0, // Always consider data stale when location changes (query key changes)
        gcTime: 5 * 60 * 1000, // Keep old location data for 5 minutes (for quick back/forth)
        refetchOnMount: false, // Don't refetch on mount - we control when to fetch
        refetchOnWindowFocus: false, // Don't refetch on window focus
        retry: false, // Don't retry failed requests to avoid multiple calls
    });
}
