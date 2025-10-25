'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { useBookingHistory } from '@/hooks/useBookingHistory';

export function BookingHistory() {
    const [filter, setFilter] = useState<'all' | 'failed'>('all');
    const { bookings, loading, error, fetchFailedBookings, fetchAllBookings } = useBookingHistory(
        filter === 'failed' ? 'PAYMENT_FAILED' : undefined
    );

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
        <div className="space-y-4 p-4">
            {/* Filter Buttons */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    Confirmed Bookings
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

            {bookings.map((booking) => (
                <div key={booking.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="text-white font-semibold">
                                Booking #{booking.booking_reference}
                            </div>
                            <div className="text-gray-400 text-sm">
                                Booking Date:   {booking.created_at ? format(new Date(booking.created_at), 'dd MMM yyyy') : 'N/A'}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-green-400 font-semibold">
                                ₹{booking.total_amount}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded ${booking.status === 'CONFIRMED' ? 'bg-green-900 text-green-300' :
                                booking.status === 'INITIATED' ? 'bg-yellow-900 text-yellow-300' :
                                    'bg-red-900 text-red-300'
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
                                {/* {booking.slots.map((slot, index) => (
                                    <span key={index} className="text-xs bg-gray-700 px-2 py-1 rounded">
                                        {slot.playerName}
                                    </span>
                                ))} */}
                                <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                                    {booking.slots[0].player_name + (booking.slots.length > 1 ? ` + ${booking.slots.length - 1} more` : '')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
