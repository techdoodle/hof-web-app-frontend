'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useBookingHistory } from '@/hooks/useBookingHistory';
import { HorizontalScroll } from '../common/HorizontalScroll';

interface Booking {
    id: number;
    booking_reference: string;
    match_id: number;
    matchDetails: {
        venueName: string;
        venueAddress: string;
        startTime: string;
        endTime: string;
        match_date: string;
    } | null;
    total_slots: number;
    total_amount: number;
    status: string;
    created_at: string;
    slots: Array<{
        slot_number: number;
        player_name: string;
        status: string;
    }>;
}

export function BookingHistory() {
    const router = useRouter();
    const [filter, setFilter] = useState<'confirmed' | 'waitlisted' | 'cancelled' | 'failed'>('confirmed');
    const { bookings, loading, error, fetchFailedBookings, fetchAllBookings } = useBookingHistory(
        filter === 'failed' ? 'PAYMENT_FAILED' : filter === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'
    );

    const handleBookingClick = (booking: any) => {
        // Navigate to booking details page
        router.push(`/bookings/${booking.id}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-white">Loading bookings...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-400">{error}</div>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-400">No bookings found</div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 p-4">
                {/* Filter Buttons */}
                <HorizontalScroll>
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setFilter('confirmed')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'confirmed'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Active Bookings
                        </button>
                        <button
                            onClick={() => setFilter('waitlisted')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'waitlisted'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Waitlisted Bookings
                        </button>
                        <button
                            onClick={() => setFilter('failed')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'failed'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Failed Payments
                        </button>
                    </div>
                </HorizontalScroll>

                {bookings.map((booking: Booking) => (
                    <div
                        key={booking.id}
                        className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
                        onClick={() => handleBookingClick(booking)}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <div className="text-white font-semibold text-lg">
                                    {booking.booking_reference || `WAIT-${booking.id}`}
                                </div>
                                <div className="text-gray-400 text-sm">
                                    {booking.created_at ? format(new Date(booking.created_at), 'dd MMM yyyy, HH:mm') : 'N/A'}
                                </div>
                                <div className="text-gray-300 text-sm mt-1">
                                    {booking.total_slots} slot{booking.total_slots !== 1 ? 's' : ''} • ₹{booking.total_amount || 0}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-xs px-3 py-1 rounded-full font-medium ${booking.status === 'CONFIRMED' ? 'bg-green-900 text-green-300' :
                                    booking.status === 'WAITLISTED' ? 'bg-orange-900 text-orange-300' :
                                        booking.status === 'INITIATED' ? 'bg-yellow-900 text-yellow-300' :
                                            booking.status === 'PAYMENT_FAILED' ? 'bg-red-900 text-red-300' :
                                                booking.status === 'PARTIALLY_CANCELLED' ? 'bg-orange-900 text-orange-300' :
                                                    booking.status === 'CANCELLED' ? 'bg-gray-900 text-gray-300' :
                                                        'bg-gray-900 text-gray-300'
                                    }`}>
                                    {booking.status}
                                </div>
                            </div>
                        </div>

                        {/* Match Details */}
                        {booking.matchDetails && (
                            <div className="mb-3 p-3 bg-gray-700 rounded-lg">
                                <div className="text-white font-medium text-sm mb-1">
                                    {booking.matchDetails.venueName}
                                </div>
                                <div className="text-gray-300 text-xs mb-1">
                                    {booking.matchDetails.venueAddress}
                                </div>
                                <div className="text-gray-400 text-xs">
                                    {booking.matchDetails.startTime && booking.matchDetails.endTime && (
                                        <>
                                            {format(new Date(booking.matchDetails.startTime), 'dd MMM yyyy')} • {' '}
                                            {format(new Date(booking.matchDetails.startTime), 'HH:mm')} - {' '}
                                            {format(new Date(booking.matchDetails.endTime), 'HH:mm')}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {booking.slots && booking.slots.length > 0 && (
                            <div className="mt-2">
                                <div className="text-gray-400 text-xs">Players:</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                                        {booking.slots[0].player_name + (booking.slots.length > 1 ? ` + ${booking.slots.length - 1} more` : '')}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}
