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
            if (typeof location.latitude === 'string') {
                location.latitude = Number(location.latitude)
            }
            if (typeof location.longitude === 'string') {
                location.longitude = Number(location.longitude)
            }
            const response = await api.post('/matches/nearby', location);
            return response.data;
        },
        enabled: !!location && !isLocationLoading,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}
