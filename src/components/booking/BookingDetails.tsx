import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';
import { CriticalBookingInfo, useCriticalBookingInfo } from '@/hooks/useCriticalBookingInfo';
import { PhoneIcon, MinusIcon, PlusIcon, X } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { BookingService } from '@/lib/bookingService';
import { WaitlistService } from '@/lib/waitlistService';
import { loadRazorpayScript, openRazorpayCheckout, RazorpayOptions } from '@/lib/razorpay';
import { BookingConfirmation } from './BookingConfirmation';
import { WaitlistConfirmation } from './WaitlistConfirmation';

interface AdditionalSlotInfo {
    firstName: string;
    lastName: string;
    phone: string;
}

interface BookingDetailsProps {
    matchId: number;
    matchData: any;
    onClose: () => void;
}

export function BookingDetails({ matchId, matchData, onClose }: BookingDetailsProps) {
    const { showToast } = useToast();
    const { user } = useAuthContext();
    const [bookingType, setBookingType] = useState<'regular' | 'waitlist' | null>(null);
    const [numSlots, setNumSlots] = useState(1);
    const [userEmail, setUserEmail] = useState(user?.email || '');
    const [additionalSlots, setAdditionalSlots] = useState<AdditionalSlotInfo[]>([]);
    const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
    const [finalPrice, setFinalPrice] = useState(0);
    const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
    const [isValidatingSlots, setIsValidatingSlots] = useState(false);
    const [isProcessingBooking, setIsProcessingBooking] = useState(false);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [bookingData, setBookingData] = useState<any>(null);
    const [showWaitlistConfirmation, setShowWaitlistConfirmation] = useState(false);
    const [waitlistData, setWaitlistData] = useState<any>(null);
    const [waitlistMatchData, setWaitlistMatchData] = useState<any>(null);

    const { data: bookingInfo, isLoading: isLoadingBookingInfo, error: bookingInfoError, isError: hasBookingInfoError, refetch: refetchBookingInfo } = useCriticalBookingInfo(matchId);

    // Type assertion to fix TypeScript error
    const typedBookingInfo = bookingInfo as CriticalBookingInfo | undefined;

    // Generate booking idempotency key with 15-min expiry
    useEffect(() => {
        const key = `booking_${matchId}_${Date.now()}`;
        localStorage.setItem('bookingKey', key);
        localStorage.setItem('bookingKeyExpiry', (Date.now() + 15 * 60 * 1000).toString());

        return () => {
            localStorage.removeItem('bookingKey');
            localStorage.removeItem('bookingKeyExpiry');
        };
    }, [matchId]);

    const handleSlotChange = (increment: boolean) => {
        if (!typedBookingInfo || !bookingType) return;

        const newValue = increment ? numSlots + 1 : numSlots - 1;
        if (newValue < 1) {
            showToast('Minimum 1 slot required', 'error');
            return;
        }

        const availableSlots = bookingType === 'regular'
            ? typedBookingInfo?.availableRegularSlots || 0
            : typedBookingInfo?.availableWaitlistSlots || 0;

        if (newValue > availableSlots) {
            showToast(`Only ${availableSlots} ${bookingType} slots available`, 'error');
            return;
        }

        setNumSlots(newValue);
        // Update additional slots array
        if (increment) {
            setAdditionalSlots([...additionalSlots, { firstName: '', lastName: '', phone: '' }]);
        } else {
            setAdditionalSlots(additionalSlots.slice(0, -1));
        }
    };

    const handleAdditionalSlotUpdate = (index: number, field: keyof AdditionalSlotInfo, value: string) => {
        const newSlots = [...additionalSlots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        setAdditionalSlots(newSlots);
    };

    const validateAdditionalSlots = (): boolean => {
        // Get user's phone number
        const userPhone = user?.phoneNumber || '';

        // Collect all phone numbers (user + additional slots)
        const allPhones = [
            userPhone,
            ...additionalSlots.map(slot => slot.phone)
        ].filter(phone => phone && phone.trim() !== '');

        // Check for duplicates
        const uniquePhones = new Set(allPhones);
        if (allPhones.length !== uniquePhones.size) {
            showToast('Duplicate phone numbers are not allowed. Each player must have a unique phone number.', 'error');
            return false;
        }

        for (let i = 0; i < additionalSlots.length; i++) {
            const slot = additionalSlots[i];
            if (!slot.phone?.trim()) {
                showToast(`Phone number is required for slot ${i + 2}`, 'error');
                return false;
            }
            // Validate phone number format (basic validation)
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(slot.phone.replace(/\D/g, ''))) {
                showToast(`Invalid phone number format for slot ${i + 2}`, 'error');
                return false;
            }
        }
        return true;
    };
    // Initialize price when booking type is selected
    useEffect(() => {
        if (bookingType === 'waitlist') {
            setFinalPrice(0);
        } else if (bookingType === 'regular' && typedBookingInfo) {
            setFinalPrice(typedBookingInfo.offerPrice * numSlots);
        }
    }, [bookingType, numSlots, typedBookingInfo]);

    const handleProceedToPayment = async () => {
        if (!userEmail || userEmail.trim() === '') {
            showToast('Please enter your email', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
            showToast('Please enter a valid email', 'error');
            return;
        }

        // Validate additional slots if any
        if (numSlots > 1 && !validateAdditionalSlots()) {
            return;
        }

        // Validate booking key
        const key = localStorage.getItem('bookingKey');
        const expiry = localStorage.getItem('bookingKeyExpiry');
        if (!key || !expiry || Date.now() > Number(expiry)) {
            showToast('Booking session expired. Please try again.', 'error');
            onClose();
            return;
        }

        // Calculate final price via API for regular bookings
        if (bookingType === 'regular') {
            setIsCalculatingPrice(true);
            try {
                const response = await api.post(`/matches/${matchId}/calculate-price`, {
                    numSlots
                });

                if (response.data?.finalPrice) {
                    setFinalPrice(response.data.finalPrice);
                } else {
                    showToast('Failed to calculate final price', 'error');
                    return;
                }
            } catch (error) {
                showToast('Failed to calculate final price', 'error');
                return;
            } finally {
                setIsCalculatingPrice(false);
            }
        }
        console.log("validating... at image 409");
        console.log("validating...   numSlots", numSlots);

        // Revalidate available slots after price calculation
        setIsValidatingSlots(true);
        try {
            console.log("validating...   trying to refetch");
            const response = await refetchBookingInfo();
            console.log("validating...   response", response);
            console.log("validating...   response.data", response.data);
            if (response.data) {
                const bookingData = response.data as CriticalBookingInfo;
                const availableSlots = bookingType === 'regular'
                    ? bookingData.availableRegularSlots
                    : bookingData.availableWaitlistSlots;
                console.log("validating...   bookingData", bookingData);
                console.log("validating...   availableSlots", availableSlots, numSlots);
                // Check if requested slots are still available
                if (availableSlots < numSlots) {
                    if (availableSlots === 0) {
                        // No slots available, show alternative options
                        if (bookingType === 'regular' && bookingData.availableWaitlistSlots > 0) {
                            showToast(`No confirmed slots available. ${bookingData.availableWaitlistSlots} waitlist slots available instead.`, 'info');
                            // Auto-switch to waitlist
                            setBookingType('waitlist');
                            setFinalPrice(0);
                            setIsValidatingSlots(false);
                            return;
                        } else {
                            showToast('No slots available for this match', 'error');
                            setIsValidatingSlots(false);
                            return;
                        }
                    } else {
                        // Some slots available, ask user to reduce
                        const maxSlots = availableSlots;
                        showToast(`Only ${maxSlots} ${bookingType} slots available now. Please reduce the number of slots.`, 'error');
                        setNumSlots(maxSlots);
                        setAdditionalSlots(additionalSlots.slice(0, maxSlots - 1));
                        setIsValidatingSlots(false);
                        return;
                    }
                }

                // Additional validation for waitlist
                if (bookingType === 'waitlist' && bookingData.waitlistedSlots > 0) {
                    showToast(`There are ${bookingData.waitlistedSlots} people already on the waitlist`, 'info');
                }
            }

            // Proceed with booking and payment
            await processBookingAndPayment();
        } catch (error) {
            console.log("validating...   error", error);
            showToast('Failed to validate booking. Please try again.', 'error');
        } finally {
            setIsValidatingSlots(false);
        }
    };

    const processBookingAndPayment = async () => {
        setIsProcessingBooking(true);

        try {
            // Debug: Check authentication
            console.log('User authenticated:', !!user);
            console.log('User ID:', user?.id);
            console.log('User email:', userEmail);

            // Step 1: Create booking
            // Prepare players array (main user + additional slots)
            const players = [
                {
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    phone: '' // Main user phone will be extracted from JWT token on backend
                },
                ...additionalSlots.map(slot => ({
                    firstName: slot.firstName,
                    lastName: slot.lastName,
                    phone: slot.phone // Additional players provide their own phone
                }))
            ];

            const bookingData = {
                matchId: Number(matchId),
                userId: user?.id?.toString(),
                email: userEmail,
                totalSlots: numSlots,
                slotNumbers: Array.from({ length: numSlots }, (_, i) => i + 1), // Generate slot numbers
                players: players,
                metadata: {
                    bookingType,
                    amount: finalPrice, // Add amount to metadata
                    additionalSlots: additionalSlots.map(slot => ({
                        firstName: slot.firstName,
                        lastName: slot.lastName,
                        phone: slot.phone
                    }))
                }
            };

            // Final availability check before API call to handle race conditions
            console.log('🔍 Final availability check before booking submission...');
            const finalAvailabilityCheck = await BookingService.checkSlotAvailability(matchId.toString(), numSlots);

            if (finalAvailabilityCheck.availableSlots > 0 && bookingType === 'waitlist') {
                // Slots became available! Switch to regular booking
                console.log('🎉 Slots became available! Switching from waitlist to regular booking');
                showToast('Great news! Slots are now available. Proceeding with confirmed booking.', 'success');
                setBookingType('regular');
                setFinalPrice(finalAvailabilityCheck.availableSlots * (matchData?.slotPrice || 0));
            } else if (finalAvailabilityCheck.availableSlots === 0 && bookingType === 'regular') {
                // No slots available, switch to waitlist
                console.log('📝 No slots available, switching to waitlist');
                showToast('No slots available. Adding you to the waitlist instead.', 'info');
                setBookingType('waitlist');
                setFinalPrice(0);
            }

            if (bookingType === 'waitlist') {
                // For waitlist, use waitlist service instead of booking service
                const waitlistData = {
                    matchId: matchId.toString(),
                    email: userEmail,
                    slotsRequired: numSlots,
                    metadata: {
                        players: [
                            {
                                firstName: user?.firstName || '',
                                lastName: user?.lastName || '',
                                phone: '' // Main user phone will be extracted from JWT token on backend
                            },
                            ...additionalSlots.map(slot => ({
                                firstName: slot.firstName,
                                lastName: slot.lastName,
                                phone: slot.phone
                            }))
                        ]
                    }
                };

                const waitlistResponse = await WaitlistService.joinWaitlist(waitlistData);
                showToast('Successfully added to waitlist!', 'success');

                // Show waitlist confirmation page
                setWaitlistData({
                    id: waitlistResponse.waitlistEntry.id,
                    slotsRequired: waitlistResponse.waitlistEntry.slotsRequired,
                    email: waitlistResponse.waitlistEntry.email
                });
                setWaitlistMatchData(waitlistResponse.matchDetails);
                setShowWaitlistConfirmation(true);
                return;
            }

            // For regular bookings, use booking service
            const booking = await BookingService.createBooking(bookingData);
            setBookingId(booking.id);

            // Step 2: Initiate payment for regular bookings
            const paymentData = {
                bookingId: booking.id,
                amount: finalPrice,
                currency: 'INR',
                email: userEmail,
                metadata: {
                    matchId: Number(matchId),
                    bookingType
                }
            };

            const paymentResponse = await BookingService.initiatePayment(paymentData);

            // Step 3: Load Razorpay and open checkout
            const razorpayLoaded = await loadRazorpayScript();
            if (!razorpayLoaded) {
                throw new Error('Failed to load Razorpay SDK');
            }

            const razorpayOptions: RazorpayOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
                amount: paymentResponse.razorpayOrder.amount,
                currency: paymentResponse.razorpayOrder.currency,
                name: 'HOF - Hall of Football',
                description: `Booking for ${matchData.venue.name}`,
                order_id: paymentResponse.razorpayOrder.id,
                prefill: {
                    name: `${user?.firstName} ${user?.lastName}`,
                    email: userEmail,
                    contact: ''
                },
                notes: {
                    bookingId: booking.id,
                    matchId: matchId,
                    bookingType
                },
                theme: {
                    color: '#1f2937'
                },
                handler: async (response) => {
                    try {
                        // Handle successful payment
                        await BookingService.handlePaymentCallback(booking.id, {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        showToast('Payment successful! Booking confirmed.', 'success');
                        // Store booking data and show confirmation page
                        setBookingData({
                            id: booking.id,
                            amount: finalPrice,
                            totalSlots: numSlots
                        });
                        setShowConfirmation(true);
                    } catch (error) {
                        console.error('Payment callback error:', error);
                        showToast('Payment verification failed. Please contact support.', 'error');
                    }
                },
                modal: {
                    ondismiss: async () => {
                        try {
                            // Cancel the payment and release locked slots
                            await BookingService.cancelPayment(booking.id);
                            showToast('Payment cancelled', 'info');
                        } catch (error) {
                            console.error('Failed to cancel booking:', error);
                            showToast('Payment cancelled but booking status update failed', 'warning');
                        }
                    }
                }
            };

            openRazorpayCheckout(razorpayOptions);

        } catch (error) {
            console.error('Booking process error:', error);
            showToast('Failed to process booking. Please try again.', 'error');
        } finally {
            setIsProcessingBooking(false);
        }
    };

    if (isLoadingBookingInfo) {
        return <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
        </div>;
    }

    if (hasBookingInfoError) {
        return (
            <div className="space-y-4 p-4">
                <div className="text-lg font-semibold">Booking Details</div>
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                            <span className="text-red-400 text-sm">!</span>
                        </div>
                        <div>
                            <div className="font-medium text-red-400">Unable to load booking information</div>
                            <div className="text-sm text-red-300 mt-1">
                                Please try again in a few moments or contact support if the issue persists.
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="w-full"
                        >
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Show waitlist confirmation page after successful waitlist join
    if (showWaitlistConfirmation && waitlistData && waitlistMatchData) {
        return (
            <WaitlistConfirmation
                waitlistId={waitlistData.id}
                matchData={waitlistMatchData}
                waitlistData={waitlistData}
                onClose={onClose}
            />
        );
    }

    // Show confirmation page after successful payment
    if (showConfirmation && bookingData) {
        return (
            <BookingConfirmation
                bookingId={bookingData.id}
                matchData={matchData}
                bookingData={bookingData}
                onClose={onClose}
            />
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
                {/* Header with close button */}
                <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold">Booking Details</div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Match Details */}
                <div className="bg-gray-800/30 rounded-lg p-4">
                    <div className="text-sm font-medium mb-2">Match Information</div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Venue:</span>
                            <span className="font-medium">{matchData.venue.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Date:</span>
                            <span className="font-medium">
                                {new Date(matchData.startTime).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Time:</span>
                            <span className="font-medium">
                                {new Date(matchData.startTime).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                })} - {new Date(matchData.endTime).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Duration:</span>
                            <span className="font-medium">
                                {Math.round((new Date(matchData.endTime).getTime() - new Date(matchData.startTime).getTime()) / (1000 * 60))} mins
                            </span>
                        </div>
                    </div>
                </div>

                {/* Match Capacity Summary */}
                {typedBookingInfo && typedBookingInfo.playerCapacity > 0 && typedBookingInfo.availableRegularSlots > 0 && (
                    <div className="bg-gray-800/30 rounded-lg p-4">
                        <div className="text-sm font-medium mb-2">Match Capacity</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-400">Total Capacity:</span>
                                <span className="ml-2 font-medium">
                                    {(typedBookingInfo?.playerCapacity || 0)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400">Available Confirmed Slots:</span>
                                <span className="ml-2 font-medium">
                                    {typedBookingInfo.availableRegularSlots}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {typedBookingInfo && typedBookingInfo.playerCapacity > 0 && typedBookingInfo.availableRegularSlots <= 0 && typedBookingInfo.availableWaitlistSlots > 0 && (
                    <div className="bg-gray-800/30 rounded-lg p-4">
                        <div className="text-sm font-medium mb-2">Match Capacity</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-400">Total Capacity:</span>
                                <span className="ml-2 font-medium">
                                    {(typedBookingInfo?.playerCapacity || 0)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400">Available Waitlist Slots:</span>
                                <span className="ml-2 font-medium">
                                    {typedBookingInfo.availableWaitlistSlots}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Available Slot Types */}
                {typedBookingInfo && (
                    <div className="space-y-4">
                        {/* Show Regular Slots if available */}
                        {(typedBookingInfo?.availableRegularSlots || 0) > 0 && (
                            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-green-400">Confirmed Slots Available</div>
                                        <div className="text-sm text-green-300">
                                            {typedBookingInfo.availableRegularSlots} slots available
                                        </div>
                                    </div>
                                    <Button
                                        variant={bookingType === 'regular' ? 'default' : 'outline'}
                                        onClick={() => {
                                            setBookingType('regular');
                                            setNumSlots(1);
                                            setAdditionalSlots([]);
                                        }}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {bookingType === 'regular' ? 'Selected' : 'Select'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Show Waitlist Slots if no regular slots but waitlist available */}
                        {(typedBookingInfo?.availableRegularSlots || 0) === 0 && (typedBookingInfo?.availableWaitlistSlots || 0) > 0 && (
                            <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-orange-400">Waitlist Slots Available</div>
                                        <div className="text-sm text-orange-300">
                                            {typedBookingInfo.availableWaitlistSlots} waitlist slots available
                                            <br />
                                            <span className="text-xs">No charge for waitlist</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant={bookingType === 'waitlist' ? 'default' : 'outline'}
                                        onClick={() => {
                                            setBookingType('waitlist');
                                            setNumSlots(1);
                                            setAdditionalSlots([]);
                                        }}
                                        className="bg-orange-600 hover:bg-orange-700"
                                    >
                                        {bookingType === 'waitlist' ? 'Selected' : 'Select'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Show if no slots available */}
                        {(typedBookingInfo?.availableRegularSlots || 0) === 0 && (typedBookingInfo?.availableWaitlistSlots || 0) === 0 && (
                            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                                <div className="text-center">
                                    <div className="font-medium text-red-400">No Slots Available</div>
                                    <div className="text-sm text-red-300 mt-1">
                                        This match is completely full
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* User and Slots Selection */}
                {bookingType && (
                    <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                                <p className="text-sm text-gray-400">You</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSlotChange(false)}
                                    disabled={numSlots <= 1}
                                >
                                    <MinusIcon className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center">{numSlots}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSlotChange(true)}
                                    disabled={!typedBookingInfo || numSlots >= (bookingType === 'regular' ? (typedBookingInfo?.availableRegularSlots || 0) : (typedBookingInfo?.availableWaitlistSlots || 0))}
                                >
                                    <PlusIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {numSlots > 1 && (
                            <button
                                className="text-sm text-blue-400 mt-2"
                                onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                            >
                                {showAdditionalDetails ? 'Hide' : 'Add'} details for additional slots
                            </button>
                        )}
                    </div>
                )}

                {bookingType && (
                    <div className="bg-gray-800/50 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Booking Type: {bookingType}</p>
                    </div>
                )}

                {/* Additional Slots Details */}
                {showAdditionalDetails && numSlots > 1 && (
                    <div className="space-y-4">
                        {additionalSlots.map((slot, index) => (
                            <div key={index} className="bg-gray-800/30 rounded-lg p-4">
                                <p className="text-sm font-medium mb-3">Slot {index + 2} - Player Details</p>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            value={slot.firstName || ''}
                                            onChange={(e) => handleAdditionalSlotUpdate(index, 'firstName', e.target.value)}
                                            className="bg-transparent border-b border-gray-400 focus:outline-none focus:border-white"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Last Name (Optional)"
                                            value={slot.lastName || ''}
                                            onChange={(e) => handleAdditionalSlotUpdate(index, 'lastName', e.target.value)}
                                            className="bg-transparent border-b border-gray-400 focus:outline-none focus:border-white"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <PhoneIcon className="h-4 w-4" />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number *"
                                            value={slot.phone || ''}
                                            onChange={(e) => handleAdditionalSlotUpdate(index, 'phone', e.target.value)}
                                            className="bg-transparent border-b border-gray-400 focus:outline-none focus:border-white flex-1"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* User Email */}
                <div className="space-y-2">
                    <label className="text-sm text-gray-400">Your email for booking confirmation</label>
                    <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full bg-gray-800/50 rounded-lg p-3"
                        required
                    />
                </div>

                <div className="border-t border-gray-700 my-4"></div>

            </div>

            {/* Payment Button */}
            <div className="p-4 bg-black/80 backdrop-blur-sm border-t border-gray-700">
                <Button
                    className="w-full"
                    onClick={handleProceedToPayment}
                    disabled={!typedBookingInfo || isLoadingBookingInfo || isCalculatingPrice || isValidatingSlots || isProcessingBooking}
                >
                    {bookingType === 'waitlist' ? (
                        isProcessingBooking ? 'Processing...' : isValidatingSlots ? 'Validating Slots...' : 'Join Waitlist (Free)'
                    ) : (
                        <>
                            {isProcessingBooking ? (
                                'Processing Booking...'
                            ) : isCalculatingPrice ? (
                                'Calculating Final Price...'
                            ) : isValidatingSlots ? (
                                'Validating Slots...'
                            ) : (
                                `Pay ₹${finalPrice.toLocaleString()}`
                            )}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
