'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookingDetailsPage } from '@/components/booking/BookingDetailsPage';

export default function BookingDetailsRoute() {
    const params = useParams();
    const router = useRouter();
    const [bookingType, setBookingType] = useState<'confirmed' | 'waitlisted' | 'failed' | 'cancelled'>('confirmed');

    const bookingId = params.bookingId as string;

    const handleClose = () => {
        router.push('/bookings');
    };

    // You might want to fetch booking type from the booking data
    // For now, we'll determine it from URL params or booking data
    useEffect(() => {
        // You can add logic here to determine booking type
        // based on the booking data or URL parameters
    }, [bookingId]);

    return (
        <div className="h-screen bg-gray-900">
            <BookingDetailsPage
                bookingId={bookingId}
                bookingType={bookingType}
                onClose={handleClose}
            />
        </div>
    );
}
