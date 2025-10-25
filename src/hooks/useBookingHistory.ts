import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface Booking {
    id: number;
    booking_reference: string;
    match_id: number;
    total_slots: number;
    total_amount: number;
    status: string;
    created_at: string;
    venue_name: string;
    venue_address: string;
    start_time: string;
    end_time: string;
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

export function useBookingHistory(status?: string) {
    const { user } = useAuthContext();
    const queryClient = useQueryClient();

    const {
        data: bookings = [],
        isLoading: loading,
        error,
        refetch
    } = useQuery({
        queryKey: ['bookings', user?.id, status],
        queryFn: async () => {
            if (!user?.id) return [];

            const params = new URLSearchParams({ userId: user.id.toString() });
            if (status) {
                params.append('status', status);
            }

            const response = await api.get(`/bookings?${params.toString()}`);
            return response.data;
        },
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    const refreshBookings = () => {
        refetch();
    };

    const fetchFailedBookings = () => {
        queryClient.invalidateQueries({ queryKey: ['bookings', user?.id, 'PAYMENT_FAILED'] });
    };

    const fetchAllBookings = () => {
        queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
    };

    return {
        bookings,
        loading,
        error: error ? 'Failed to load bookings' : null,
        refreshBookings,
        fetchFailedBookings,
        fetchAllBookings
    };
}
