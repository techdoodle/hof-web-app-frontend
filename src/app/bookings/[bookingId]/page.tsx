'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookingDetailsPage } from '@/components/booking/BookingDetailsPage';

export default function BookingDetailsRoute() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTypeParam = (searchParams?.get('type') || '').toLowerCase();
    const initialType: 'confirmed' | 'waitlisted' | 'failed' | 'cancelled' =
        initialTypeParam === 'waitlisted' ? 'waitlisted'
            : initialTypeParam === 'failed' ? 'failed'
                : initialTypeParam === 'cancelled' ? 'cancelled'
                    : 'confirmed';
    const [bookingType, setBookingType] = useState<'confirmed' | 'waitlisted' | 'failed' | 'cancelled'>(initialType);

    const bookingId = params.bookingId as string;

    const handleClose = () => {
        router.push('/bookings');
    };

    useEffect(() => {
        const typeParam = (searchParams?.get('type') || '').toLowerCase();
        if (!typeParam) return; // already set from initialType
        if (typeParam === 'waitlisted') setBookingType('waitlisted');
        else if (typeParam === 'failed') setBookingType('failed');
        else if (typeParam === 'cancelled') setBookingType('cancelled');
        else setBookingType('confirmed');
    }, [bookingId, searchParams]);

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
