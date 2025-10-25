import { useState, useEffect } from 'react';
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
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = async (filterStatus?: string) => {
        if (!user?.id) return;

        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({ userId: user.id.toString() });
            if (filterStatus) {
                params.append('status', filterStatus);
            }

            const response = await api.get(`/bookings?${params.toString()}`);
            setBookings(response.data);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const refreshBookings = () => {
        fetchBookings(status);
    };

    const fetchFailedBookings = () => {
        fetchBookings('PAYMENT_FAILED');
    };

    const fetchAllBookings = () => {
        fetchBookings();
    };

    useEffect(() => {
        fetchBookings(status);
    }, [user?.id, status]);

    return {
        bookings,
        loading,
        error,
        refreshBookings,
        fetchFailedBookings,
        fetchAllBookings
    };
}
