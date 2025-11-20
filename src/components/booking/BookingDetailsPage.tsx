'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useBookingDetails } from '@/hooks/useBookingDetails';
import { useWaitlistDetails } from '@/hooks/useWaitlistDetails';
import { BookingService, RefundBreakdown } from '@/lib/bookingService';
import { WaitlistService } from '@/lib/waitlistService';
import { Button } from '@/components/ui/button';
import { PartialSlotSelector } from './PartialSlotSelector';
import { CancelConfirmationModal } from './CancelConfirmationModal';
import {
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Users,
    Phone,
    Mail,
    CreditCard,
    X,
    CheckCircle,
    AlertCircle,
    Clock as ClockIcon,
    User,
    Loader2
} from 'lucide-react';

interface BookingDetailsPageProps {
    bookingId: string;
    bookingType: 'confirmed' | 'waitlisted' | 'failed' | 'cancelled';
    onClose: () => void;
}

export function BookingDetailsPage({ bookingId, bookingType, onClose }: BookingDetailsPageProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, isLoading: authLoading } = useAuthContext();
    const { showToast } = useToast();

    const [actionLoading, setActionLoading] = useState(false);
    const [showPartialSelector, setShowPartialSelector] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [canPay, setCanPay] = useState(false);
    const [refundInfo, setRefundInfo] = useState<RefundBreakdown | null>(null);
    const [loadingRefund, setLoadingRefund] = useState(false);

    // Use React Query hooks based on booking type
    const {
        data: booking,
        loading,
        error: bookingError
    } = useBookingDetails(bookingType !== 'waitlisted' ? bookingId : '');

    const {
        data: waitlistData,
        loading: waitlistLoading,
        error: waitlistError
    } = useWaitlistDetails(bookingType === 'waitlisted' ? bookingId : '');

    // Determine which data to use
    const currentBooking = (bookingType === 'waitlisted' ? waitlistData : booking) as any;
    const currentLoading = bookingType === 'waitlisted' ? waitlistLoading : loading;
    const currentError = bookingType === 'waitlisted' ? waitlistError : bookingError;
    const isQueryEnabled = !!bookingId && !!user?.id;
    console.log('currentBooking', currentBooking);
    console.log('currentLoading', currentLoading);
    console.log('currentError', currentError);

    // Handle errors
    if (currentError) {
        showToast('Failed to load booking details', 'error');
    }

    const handleCancelBooking = async () => {
        try {
            setActionLoading(true);

            if (bookingType === 'waitlisted') {
                await WaitlistService.cancelWaitlist(currentBooking?.matchId?.toString() || '', currentBooking?.email || '');
                showToast('Waitlist entry cancelled successfully', 'success');
            } else {
                await BookingService.cancelBooking(bookingId);
                showToast('Booking cancelled successfully', 'success');
            }

            // Invalidate and refetch bookings queries
            queryClient.invalidateQueries({ queryKey: ['bookings', user?.id, 'CONFIRMED'] });
            queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });

            setShowCancelModal(false);
            onClose();
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            showToast('Failed to cancel booking', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Check payment availability when data loads
    useEffect(() => {
        const checkPaymentAvailability = async () => {
            if (bookingType === 'waitlisted' && currentBooking?.matchId) {
                try {
                    const checkForAvailableSlots = await BookingService.checkSlotAvailability(
                        currentBooking.matchId.toString(),
                        currentBooking.totalSlots || 0
                    );
                    setCanPay(checkForAvailableSlots.availableSlots > 0);
                } catch (error) {
                    setCanPay(false);
                }
            } else {
                setCanPay(false);
            }
        };

        checkPaymentAvailability();
    }, [bookingType, currentBooking?.matchId, currentBooking?.totalSlots]);

    const handlePartialCancel = async () => {
        if (currentBooking?.slots && currentBooking.slots.length > 1) {
            setShowPartialSelector(true);
        } else {
            // If only one slot, fetch refund info and show confirmation for full cancellation
            if (bookingType !== 'waitlisted') {
                try {
                    setLoadingRefund(true);
                    const breakdown = await BookingService.getRefundBreakdown(bookingId);
                    setRefundInfo(breakdown);
                } catch (error) {
                    console.error('Failed to fetch refund breakdown:', error);
                    setRefundInfo(null);
                } finally {
                    setLoadingRefund(false);
                }
            }
            setShowCancelModal(true);
        }
    };

    const handlePartialCancelConfirm = async (selectedSlots: number[]) => {
        try {
            setActionLoading(true);

            await BookingService.cancelBookingSlots({
                bookingId: bookingId,
                slotNumbers: selectedSlots,
                reason: 'Partial cancellation requested by user'
            });

            // Invalidate and refetch bookings queries
            queryClient.invalidateQueries({ queryKey: ['bookings', user?.id, 'CONFIRMED'] });
            queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });

            showToast(`Successfully cancelled ${selectedSlots.length} slot(s)`, 'success');
            setShowPartialSelector(false);
            onClose();
        } catch (error) {
            console.error('Failed to cancel slots:', error);
            showToast('Failed to cancel selected slots', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleInitiatePayment = async () => {
        try {
            setActionLoading(true);

            if (bookingType === 'waitlisted') {
                // For waitlisted bookings, initiate payment through waitlist service
                const order = await WaitlistService.initiateWaitlistBooking(bookingId);
                // Handle Razorpay payment flow
                showToast('Payment initiated for waitlist booking', 'success');
            } else {
                // For regular bookings, initiate payment
                const order = await BookingService.initiatePayment({
                    bookingId: bookingId,
                    amount: (currentBooking?.total_amount || 0) * 100, // Convert to paise
                    email: currentBooking?.email || '',
                    currency: 'INR',
                    metadata: {
                        bookingId: bookingId,
                        amount: currentBooking?.total_amount || 0,
                        currency: 'INR',
                        email: currentBooking?.email || ''
                    }
                });
                // Handle Razorpay payment flow
                showToast('Payment initiated', 'success');
            }
        } catch (error) {
            console.error('Failed to initiate payment:', error);
            showToast('Failed to initiate payment', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            // Booking statuses
            case 'CONFIRMED':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'PAYMENT_FAILED':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'CANCELLED':
                return <X className="w-5 h-5 text-gray-500" />;
            case 'PARTIALLY_CANCELLED':
                return <AlertCircle className="w-5 h-5 text-orange-500" />;
            case 'INITIATED':
            case 'PAYMENT_PENDING':
                return <ClockIcon className="w-5 h-5 text-yellow-500" />;
            // Waitlist statuses
            case 'WAITING':
                return <ClockIcon className="w-5 h-5 text-orange-500" />;
            case 'NOTIFIED':
                return <AlertCircle className="w-5 h-5 text-orange-500" />;
            case 'PROMOTED':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'EXPIRED':
                return <X className="w-5 h-5 text-gray-500" />;
            default:
                return <ClockIcon className="w-5 h-5 text-blue-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            // Booking statuses
            case 'CONFIRMED':
                return 'bg-green-900 text-green-300';
            case 'PAYMENT_FAILED':
                return 'bg-red-900 text-red-300';
            case 'CANCELLED':
                return 'bg-gray-900 text-gray-300';
            case 'PARTIALLY_CANCELLED':
                return 'bg-orange-900 text-orange-300';
            case 'INITIATED':
            case 'PAYMENT_PENDING':
                return 'bg-yellow-900 text-yellow-300';
            // Waitlist statuses
            case 'WAITING':
                return 'bg-orange-900 text-orange-300';
            case 'NOTIFIED':
                return 'bg-orange-900 text-orange-300';
            case 'PROMOTED':
                return 'bg-green-900 text-green-300';
            case 'EXPIRED':
                return 'bg-gray-900 text-gray-300';
            default:
                return 'bg-blue-900 text-blue-300';
        }
    };

    const canCancel = () => {
        return bookingType === 'waitlisted' ||
            (bookingType === 'confirmed' && currentBooking?.status === 'CONFIRMED') ||
            (bookingType === 'cancelled' && (currentBooking?.status === 'CANCELLED' || currentBooking?.status === 'PARTIALLY_CANCELLED'));
    };

    if (authLoading || !isQueryEnabled || currentLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                    <div>Loading booking details...</div>
                </div>
            </div>
        );
    }

    if (currentError) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Booking Not Found</h1>
                    <p className="text-gray-400 mb-4">The booking you're looking for doesn't exist.</p>
                    <Button onClick={onClose} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    if (!currentBooking) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">No Data Available</h1>
                    <p className="text-gray-400 mb-4">Unable to load booking information.</p>
                    <Button onClick={onClose} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-900 text-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="mr-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">
                            {bookingType === 'waitlisted' ? 'Waitlist Entry' : 'Booking'} Details
                        </h1>
                        <p className="text-sm text-gray-400">
                            {bookingType === 'waitlisted' ? null : currentBooking?.bookingReference}
                        </p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(currentBooking?.status || '')}`}>
                    {getStatusIcon(currentBooking?.status || '')}
                    <span className="ml-2">{currentBooking?.status || 'UNKNOWN'}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Match Details */}
                <div className="bg-gray-800 rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Match Information
                    </h2>

                    {currentBooking?.matchDetails && (
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                                <div>
                                    <div className="font-medium">{currentBooking.matchDetails.venueName}</div>
                                    <div className="text-sm text-gray-400">{currentBooking.matchDetails.venueAddress}</div>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <Clock className="w-5 h-5 text-gray-400 mr-3" />
                                <div>
                                    <div className="text-sm">
                                        {currentBooking.matchDetails.startTime && (
                                            <>
                                                {format(new Date(currentBooking.matchDetails.startTime), 'dd MMM yyyy')} • {' '}
                                                {format(new Date(currentBooking.matchDetails.startTime), 'HH:mm')} - {' '}
                                                {format(new Date(currentBooking.matchDetails.endTime), 'HH:mm')}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Booking Details */}
                <div className="bg-gray-800 rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Booking Information
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-gray-400">Total Slots</div>
                            <div className="font-medium">{currentBooking?.totalSlots || 0}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Amount</div>
                            <div className="font-medium">
                                {(currentBooking?.amount || 0) > 0 ? `₹${currentBooking?.amount}` : 'Free'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Email</div>
                            <div className="font-medium flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {currentBooking?.email || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Created</div>
                            <div className="font-medium">
                                {currentBooking?.createdAt ? format(new Date(currentBooking.createdAt), 'dd MMM yyyy HH:mm') : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Players */}
                {currentBooking?.slots && currentBooking.slots.length > 0 && (
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Players ({currentBooking.slots.length})
                        </h2>

                        <div className="space-y-2">
                            {currentBooking.slots.map((slot: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                    <div>
                                        <div className="font-medium">{slot.playerName}</div>
                                        <div className="text-sm text-gray-400">Slot {slot.slotNumber}</div>
                                    </div>
                                    <div className="text-sm text-gray-400">{slot.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Waitlist Specific Info */}
                {bookingType === 'waitlisted' && currentBooking?.metadata && (currentBooking?.metadata?.confirmedSlots || currentBooking?.metadata?.remainingSlotsNeeded || currentBooking?.metadata?.lastConfirmedAt) && (
                    <div className="bg-orange-900/20 rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <ClockIcon className="w-5 h-5 mr-2" />
                            Waitlist Status
                        </h2>

                        <div className="space-y-2">
                            {currentBooking.metadata.confirmedSlots && (
                                <div className="text-sm">
                                    <span className="text-gray-400">Confirmed Slots:</span>
                                    <span className="ml-2 font-medium">{currentBooking.metadata.confirmedSlots}</span>
                                </div>
                            )}
                            {currentBooking.metadata.remainingSlotsNeeded && (
                                <div className="text-sm">
                                    <span className="text-gray-400">Remaining Slots Needed:</span>
                                    <span className="ml-2 font-medium">{currentBooking.metadata.remainingSlotsNeeded}</span>
                                </div>
                            )}
                            {currentBooking.metadata.lastConfirmedAt && (
                                <div className="text-sm">
                                    <span className="text-gray-400">Last Confirmed:</span>
                                    <span className="ml-2 font-medium">
                                        {format(new Date(currentBooking.metadata.lastConfirmedAt), 'dd MMM yyyy HH:mm')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-700 space-y-3">
                {canCancel() && (
                    <Button
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={handlePartialCancel}
                        disabled={actionLoading}
                    >
                        <X className="w-4 h-4 mr-2" />
                        {bookingType === 'waitlisted'
                            ? 'Cancel Waitlist Entry'
                            : currentBooking?.slots?.length > 1
                                ? 'Cancel Slots'
                                : 'Cancel Booking'
                        }
                    </Button>
                )}

                {canPay && (
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={handleInitiatePayment}
                        disabled={actionLoading}
                    >
                        <CreditCard className="w-4 h-4 mr-2" />
                        {bookingType === 'waitlisted' ? 'Pay for Available Slots' : 'Retry Payment'}
                    </Button>
                )}

                {actionLoading && (
                    <div className="text-center text-sm text-gray-400">
                        Processing...
                    </div>
                )}
            </div>

            {/* Partial Slot Selector */}
            {showPartialSelector && currentBooking?.slots && (
                <PartialSlotSelector
                    bookingId={bookingId}
                    slots={currentBooking.slots}
                    onConfirm={handlePartialCancelConfirm}
                    onCancel={() => setShowPartialSelector(false)}
                    loading={actionLoading}
                />
            )}

            {/* Cancel Confirmation Modal */}
            <CancelConfirmationModal
                isOpen={showCancelModal}
                onConfirm={handleCancelBooking}
                onCancel={() => {
                    setShowCancelModal(false);
                    setRefundInfo(null);
                }}
                loading={actionLoading}
                title={bookingType === 'waitlisted' ? 'Cancel Waitlist Entry' : 'Cancel Booking'}
                message={bookingType === 'waitlisted'
                    ? 'Are you sure you want to cancel your waitlist entry? You will be removed from the waitlist.'
                    : 'Are you sure you want to cancel this booking? This action cannot be undone and may result in a refund.'
                }
                confirmText={bookingType === 'waitlisted' ? 'Yes, Remove from Waitlist' : 'Yes, Cancel Booking'}
                cancelText="Keep Booking"
                refundInfo={bookingType !== 'waitlisted' ? refundInfo : undefined}
            />
        </div>
    );
}
