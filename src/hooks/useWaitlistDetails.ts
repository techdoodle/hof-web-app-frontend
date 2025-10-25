import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface WaitlistDetails {
    id: number;
    matchId: string;
    userId: number;
    slotsRequired: number;
    status: string;
    createdAt: string;
    matchDetails: {
        venueName: string;
        venueAddress: string;
        startTime: string;
        endTime: string;
        footballChief: {
            name: string;
            phone: string;
        };
    };
}

export function useWaitlistDetails(waitlistId: string) {
    const { user } = useAuthContext();

    return useQuery({
        queryKey: ['waitlist', waitlistId],
        queryFn: async (): Promise<WaitlistDetails> => {
            const response = await api.get(`/waitlist/${waitlistId}`);
            return response.data;
        },
        enabled: !!waitlistId && !!user?.id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        cacheTime: 5 * 60 * 1000, // 5 minutes
    });
}
