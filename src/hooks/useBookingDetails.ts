import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface BookingDetails {
    id: number;
    booking_reference: string;
    match_id: number;
    total_slots: number;
    total_amount: number;
    status: string;
    created_at: string;
    slots: Array<{
        slot_number: number;
        player_name: string;
        status: string;
    }>;
    matchDetails: {
        venueName: string;
        venueAddress: string;
        startTime: string;
        endTime: string;
        match_date: string;
    } | null;
}

export function useBookingDetails(bookingId: string) {
    const { user } = useAuthContext();

    return useQuery({
        queryKey: ['booking', bookingId],
        queryFn: async (): Promise<BookingDetails> => {
            const response = await api.get(`/bookings/${bookingId}`);
            return response.data;
        },
        enabled: !!bookingId && !!user?.id,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
}
