import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';
import { CriticalBookingInfo, useCriticalBookingInfo } from '@/hooks/useCriticalBookingInfo';
import { PhoneIcon, MinusIcon, PlusIcon, X, CircleX } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import api, { hasActiveBookingForMatch, validatePromoCode, ExistingUserSummary } from '@/lib/api';
import { BookingService } from '@/lib/bookingService';
import { WaitlistService } from '@/lib/waitlistService';
import { loadRazorpayScript, openRazorpayCheckout, RazorpayOptions } from '@/lib/razorpay';
import { BookingConfirmation } from './BookingConfirmation';
import { WaitlistConfirmation } from './WaitlistConfirmation';
import { PaymentFailedConfirmation } from './PaymentFailedConfirmation';
import { TeammatesModal } from './TeammatesModal';
import { ExistingUsersPickerModal } from './ExistingUsersPickerModal';

type SlotMode = 'existing' | 'new';

interface AdditionalSlotInfo {
    mode: SlotMode;
    existingUserId?: number;
    firstName: string;
    lastName: string;
    phone: string;
    teamName?: string; // Team selection for this player
}

interface BookingDetailsProps {
    matchId: number;
    matchData: any;
    onClose: () => void;
}

export function BookingDetails({ matchId, matchData, onClose }: BookingDetailsProps) {
    const { showToast } = useToast();
    const { user, isAuthenticated, isLoading: authLoading } = useAuthContext();
    const router = useRouter();
    const hasRedirectedRef = useRef(false);
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
    const [showPaymentFailed, setShowPaymentFailed] = useState(false);
    const [bookingData, setBookingData] = useState<any>(null);
    const [isAdditionalBooking, setIsAdditionalBooking] = useState(false);
    const [showWaitlistConfirmation, setShowWaitlistConfirmation] = useState(false);
    const [waitlistData, setWaitlistData] = useState<any>(null);
    const [waitlistMatchData, setWaitlistMatchData] = useState<any>(null);
    const [mainUserTeam, setMainUserTeam] = useState<string>(''); // Team selection for main user
    const [showTeammatesModal, setShowTeammatesModal] = useState(false);
    const [showExistingUsersModal, setShowExistingUsersModal] = useState(false);
    const [promoCode, setPromoCode] = useState<string>('');
    const [promoCodeDiscount, setPromoCodeDiscount] = useState<number>(0);
    const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
    const [isValidatingPromoCode, setIsValidatingPromoCode] = useState(false);
    const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
    const [originalPrice, setOriginalPrice] = useState<number>(0);

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

    // Detect if user already has an active booking for this match
    useEffect(() => {
        (async () => {
            if (user?.id && matchId) {
                const has = await hasActiveBookingForMatch(Number(matchId), Number(user.id));
                setIsAdditionalBooking(has);
            } else {
                setIsAdditionalBooking(false);
            }
        })();
    }, [user?.id, matchId]);

    // Require login before booking - redirect to login page if not authenticated
    useEffect(() => {
        // Wait for auth to finish loading
        if (authLoading) return;
        
        // Only redirect once and if not authenticated
        if (!isAuthenticated || !user) {
            if (!hasRedirectedRef.current) {
                hasRedirectedRef.current = true;
                showToast('Please login to book a match', 'info');
                // Use replace instead of push to replace current history entry
                router.replace(`/onboarding?redirect=/book-match/${matchId}&step=LOGIN`);
            }
        }
    }, [isAuthenticated, user, router, matchId, authLoading, showToast]);

    const normalizePhone = (raw: string | null | undefined): string => {
        if (!raw) return '';
        let digits = String(raw).replace(/\D/g, '');
        if (digits.length === 10) return digits;
        if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
        if (digits.length > 10) return digits.slice(-10);
        return digits;
    };

    // Ensure additionalSlots length matches required player count
    useEffect(() => {
        // Only run if user is authenticated
        if (!isAuthenticated || !user) return;
        
        const targetLength = isAdditionalBooking ? numSlots : Math.max(0, numSlots - 1);
        if (additionalSlots.length !== targetLength) {
            const next = [...additionalSlots];
            // Add missing entries
            while (next.length < targetLength) {
                next.push({ mode: 'new', firstName: '', lastName: '', phone: '' });
            }
            // Trim extra
            while (next.length > targetLength) {
                next.pop();
            }
            setAdditionalSlots(next);
            // Do not auto-open the form; it should open only when user clicks "Book"
        }
    }, [isAdditionalBooking, numSlots, isAuthenticated, user, additionalSlots.length]);
    
    // Early return - don't render booking UI if not authenticated (after all hooks)
    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
            </div>
        );
    }
    
    if (!isAuthenticated || !user) {
        // Show loading while redirecting
        return (
            <div className="flex min-h-screen items-center justify-center text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto mb-4"></div>
                    <p className="text-gray-400">Redirecting to login...</p>
                </div>
            </div>
        );
    }

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
        if (isAdditionalBooking) {
            // Friends-only mode: we need details for every slot (including first)
            if (increment) {
                setAdditionalSlots([...additionalSlots, { mode: 'new', firstName: '', lastName: '', phone: '' }]);
            } else {
                setAdditionalSlots(additionalSlots.slice(0, -1));
            }
            setShowAdditionalDetails(true);
        } else {
            // Normal mode: additionalSlots represent slots after the main user
            if (increment) {
                setAdditionalSlots([...additionalSlots, { mode: 'new', firstName: '', lastName: '', phone: '' }]);
            } else {
                setAdditionalSlots(additionalSlots.slice(0, -1));
            }
        }
    };

    const handleAdditionalSlotUpdate = (index: number, field: keyof AdditionalSlotInfo, value: string) => {
        const newSlots = [...additionalSlots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        setAdditionalSlots(newSlots);
    };

    const handleApplyExistingUsers = (users: ExistingUserSummary[]) => {
        if (!users.length) return;

        // Only applies for confirmed bookings
        if (bookingType !== 'regular' || !typedBookingInfo) {
            return;
        }

        const availableRegularSlots = typedBookingInfo.availableRegularSlots || 0;
        if (availableRegularSlots <= 0) {
            showToast('No confirmed slots available for this match.', 'error');
            return;
        }

        // How many friend slots can we actually allocate based on availability
        // - In additional-booking mode: all slots are friends
        // - In normal mode: 1 slot is for the main user, rest are friends
        const maxFriendSlotsByAvailability = isAdditionalBooking
            ? availableRegularSlots
            : Math.max(0, availableRegularSlots - 1);

        if (maxFriendSlotsByAvailability <= 0) {
            showToast('No additional slots available for friends.', 'error');
            return;
        }

        // Get currently selected existing user IDs to avoid duplicates
        const existingSelectedIds = new Set(
            additionalSlots
                .filter(s => s.mode === 'existing' && s.existingUserId)
                .map(s => s.existingUserId as number)
        );

        // Filter out users that are already selected
        const newUsers = users.filter(u => !existingSelectedIds.has(u.id));

        if (newUsers.length === 0) {
            showToast('All selected players are already added.', 'info');
            return;
        }

        // Count how many slots are currently filled (existing + new with data)
        const currentlyFilledSlots = additionalSlots.filter(
            s => (s.mode === 'existing' && s.existingUserId) ||
                 (s.mode === 'new' && s.firstName?.trim() && s.phone?.trim())
        ).length;

        // Calculate how many more slots we can add
        const remainingSlots = maxFriendSlotsByAvailability - currentlyFilledSlots;
        const usersToAdd = Math.min(newUsers.length, remainingSlots);

        if (usersToAdd === 0) {
            showToast('No more slots available. Please remove some players first.', 'info');
            return;
        }

        if (newUsers.length > usersToAdd) {
            showToast(
                `Only ${usersToAdd} more player${usersToAdd > 1 ? 's' : ''} can be added based on available slots.`,
                'info'
            );
        }

        // Append new users to existing slots
        const next: AdditionalSlotInfo[] = [...additionalSlots];
        let addedCount = 0;

        // First, try to fill empty/new slots
        for (let i = 0; i < next.length && addedCount < usersToAdd; i++) {
            const slot = next[i];
            // If slot is empty (new mode with no data) or has no existing user, fill it
            if (slot.mode === 'new' && (!slot.firstName?.trim() && !slot.phone?.trim())) {
                const user = newUsers[addedCount];
                next[i] = {
                    mode: 'existing',
                    existingUserId: user.id,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    phone: user.phoneNumber || '',
                    teamName: slot.teamName, // preserve any pre-selected team
                };
                addedCount++;
            }
        }

        // If we still have users to add, append new slots
        while (addedCount < usersToAdd) {
            const user = newUsers[addedCount];
            next.push({
                mode: 'existing',
                existingUserId: user.id,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phoneNumber || '',
                teamName: undefined,
            });
            addedCount++;
        }

        // Update total slots count
        const newTotalSlots = isAdditionalBooking ? next.length : (1 + next.length);
        setNumSlots(newTotalSlots);
        setAdditionalSlots(next);
        setShowAdditionalDetails(true);
    };

    const validateAdditionalSlots = (): boolean => {
        const mainUserPhone = user?.phoneNumber || '';

        const seenPhones = new Set<string>();
        const seenExistingUserIds = new Set<number>();

        if (!isAdditionalBooking && mainUserPhone) {
            const norm = normalizePhone(mainUserPhone);
            if (norm) {
                seenPhones.add(norm);
            }
        }

        for (let i = 0; i < additionalSlots.length; i++) {
            const slot = additionalSlots[i];
            const slotNum = isAdditionalBooking ? (i + 1) : (i + 2);

            if (slot.mode === 'existing') {
                if (!slot.existingUserId) {
                    showToast(`Selected player missing for slot ${slotNum}`, 'error');
                    return false;
                }

                if (seenExistingUserIds.has(slot.existingUserId)) {
                    showToast(`You cannot assign the same player to multiple slots (slot ${slotNum})`, 'error');
                    return false;
                }
                seenExistingUserIds.add(slot.existingUserId);

                const norm = normalizePhone(slot.phone);
                if (norm) {
                    if (seenPhones.has(norm)) {
                        showToast('Duplicate phone numbers are not allowed. Each player must have a unique phone number.', 'error');
                        return false;
                    }
                    seenPhones.add(norm);
                }

                if (bookingType === 'regular' && !slot.teamName) {
                    showToast(`Team selection is required for slot ${slotNum}`, 'error');
                    return false;
                }

                continue;
            }

            // New player validation
            if (!slot.firstName?.trim()) {
                showToast(`First name is required for slot ${slotNum}`, 'error');
                return false;
            }

            if (!slot.phone?.trim()) {
                showToast(`Phone number is required for slot ${slotNum}`, 'error');
                return false;
            }

            const normalized = normalizePhone(slot.phone);
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(normalized)) {
                showToast(`Invalid phone number format for slot ${slotNum}`, 'error');
                return false;
            }

            if (seenPhones.has(normalized)) {
                showToast('Duplicate phone numbers are not allowed. Each player must have a unique phone number.', 'error');
                return false;
            }
            seenPhones.add(normalized);

            if (bookingType === 'regular' && !slot.teamName) {
                showToast(`Team selection is required for slot ${slotNum}`, 'error');
                return false;
            }
        }

        if (bookingType === 'regular' && !isAdditionalBooking && !mainUserTeam) {
            showToast('Please select your team', 'error');
            return false;
        }

        return true;
    };

    // Helper function to check if all team selections are complete
    const areTeamSelectionsComplete = (): boolean => {
        if (bookingType !== 'regular') return true; // No team selection required for waitlist

        // Check main user's team selection (if not additional booking)
        if (!isAdditionalBooking && !mainUserTeam) {
            return false;
        }

        // Check all additional slots have team selections
        for (const slot of additionalSlots) {
            if (!slot.teamName) {
                return false;
            }
        }

        return true;
    };
    // Initialize price when booking type is selected
    useEffect(() => {
        if (bookingType === 'waitlist') {
            setFinalPrice(0);
            setOriginalPrice(0);
        } else if (bookingType === 'regular' && typedBookingInfo) {
            const basePrice = typedBookingInfo.offerPrice * numSlots;
            setOriginalPrice(basePrice);
            // If promo code is already applied, recalculate with discount
            if (appliedPromoCode && promoCodeDiscount > 0) {
                setFinalPrice(basePrice - promoCodeDiscount);
            } else {
                setFinalPrice(basePrice);
            }
        }
    }, [bookingType, numSlots, typedBookingInfo]);

    // Recalculate price when promo code discount changes
    useEffect(() => {
        if (bookingType === 'regular' && originalPrice > 0) {
            if (appliedPromoCode && promoCodeDiscount > 0) {
                setFinalPrice(originalPrice - promoCodeDiscount);
            } else {
                setFinalPrice(originalPrice);
            }
        }
    }, [promoCodeDiscount, appliedPromoCode, originalPrice, bookingType]);

    // Auto-expand player details for confirmed bookings with multiple slots
    useEffect(() => {
        if (bookingType === 'regular' && (isAdditionalBooking ? numSlots >= 1 : numSlots > 1)) {
            setShowAdditionalDetails(true);
        }
    }, [bookingType, numSlots, isAdditionalBooking]);

    const [slotVerificationError, setSlotVerificationError] = useState<string | null>(null);

    const handleApplyPromoCode = async () => {
        if (!promoCode.trim()) {
            setPromoCodeError('Please enter a promo code');
            return;
        }

        if (bookingType !== 'regular' || finalPrice <= 0) {
            setPromoCodeError('Please select booking type and slots first');
            return;
        }

        setIsValidatingPromoCode(true);
        setPromoCodeError(null);

        try {
            const result = await validatePromoCode(promoCode.trim(), originalPrice || finalPrice, Number(matchId));

            if (result.success && result.data?.valid) {
                setAppliedPromoCode(promoCode.trim().toUpperCase());
                setPromoCodeDiscount(result.data.discountAmount || 0);
                setFinalPrice(result.data.finalAmount || finalPrice);
                showToast('Promo code applied successfully!', 'success');
            } else {
                // Clear any applied promo if backend says it's invalid (e.g. already used)
                setAppliedPromoCode(null);
                setPromoCodeDiscount(0);
                setPromoCodeError(result.message || 'Invalid promo code');
            }
        } catch (error: any) {
            const backendMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error.message;
            // Clear applied promo state on error as well
            setAppliedPromoCode(null);
            setPromoCodeDiscount(0);
            setPromoCodeError(backendMessage || 'Failed to validate promo code');
        } finally {
            setIsValidatingPromoCode(false);
        }
    };

    const handleRemovePromoCode = () => {
        setAppliedPromoCode(null);
        setPromoCodeDiscount(0);
        setPromoCode('');
        setPromoCodeError(null);
        setFinalPrice(originalPrice || finalPrice);
        showToast('Promo code removed', 'info');
    };

    const handleProceedToPayment = async () => {
        if (!userEmail || userEmail.trim() === '') {
            showToast('Please enter your email', 'error');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
            showToast('Please enter a valid email', 'error');
            return;
        }

        // Validate player details depending on mode
        const needsFriendDetails = isAdditionalBooking ? numSlots >= 1 : numSlots > 1;
        if (needsFriendDetails && !validateAdditionalSlots()) {
            return;
        }
        setSlotVerificationError(null);

        // Validate booking key
        const key = localStorage.getItem('bookingKey');
        const expiry = localStorage.getItem('bookingKeyExpiry');
        if (!key || !expiry || Date.now() > Number(expiry)) {
            showToast('Booking session expired. Please try again.', 'error');
            onClose();
            return;
        }
        console.log("numSlots in handleProceedToPayment", numSlots, bookingType);
        if (numSlots <= 0) {
            showToast('Please select at least 1 slot', 'error');
            return;
        }

        // Calculate final price via API for regular bookings (if no promo code applied)
        if (bookingType === 'regular' && !appliedPromoCode) {
            setIsCalculatingPrice(true);
            try {
                const response = await api.post(`/matches/${matchId}/calculate-price`, {
                    numSlots
                });

                if (response.data?.finalPrice) {
                    const calculatedPrice = response.data.finalPrice;
                    setOriginalPrice(calculatedPrice);
                    setFinalPrice(calculatedPrice);
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

            // Pre-verify: no active slots for selected users on this match
            try {
                setIsValidatingSlots(true);
                // Build slots array with phone numbers for all slots
                const slotsToVerify: Array<{ phone: string; slotNumber?: number }> = [];

                // Get main user's phone number
                const mainUserPhone = user?.phoneNumber || '';

                if (isAdditionalBooking) {
                    // Additional booking mode: only verify friends (main user not included in booking)
                    // Add all friend phone numbers
                    additionalSlots.forEach((slot, index) => {
                        if (slot.phone?.trim()) {
                            slotsToVerify.push({
                                phone: slot.phone.trim(),
                                slotNumber: index + 1
                            });
                        }
                    });
                } else {
                    // Regular mode: verify main user + friends
                    // Main user is first slot
                    if (mainUserPhone) {
                        slotsToVerify.push({
                            phone: mainUserPhone,
                            slotNumber: 1
                        });
                    }

                    // Add friend phone numbers (slots 2, 3, etc.)
                    additionalSlots.forEach((slot, index) => {
                        if (slot.phone?.trim()) {
                            slotsToVerify.push({
                                phone: slot.phone.trim(),
                                slotNumber: index + 2
                            });
                        }
                    });
                }

                if (slotsToVerify.length > 0) {
                    const verifyResult = await BookingService.verifySlots({
                        matchId: matchId.toString(),
                        slots: slotsToVerify
                    });
                    console.log("verifyResult", verifyResult);

                    if (!verifyResult.isValid) {
                        const conflictMessages = verifyResult.conflicts.map(c =>
                            `Phone ${c.phone}: ${c.reason} (sources: ${c.source.join(', ')})`
                        ).join(', ');
                        showToast(
                            verifyResult.message || `Cannot proceed: ${conflictMessages}`,
                            'error'
                        );
                        console.log("slotVerificationError", `Slots for Phone Number(s): ${verifyResult.conflicts.map(s => s.phone).join(', ')} : already booked. Please book for friends with different phone numbers.`);
                        setSlotVerificationError(`Slots for Phone Number(s): ${verifyResult.conflicts.map(s => s.phone).join(', ')} : already booked. Please book for friends with different phone numbers.`);
                        setIsValidatingSlots(false);
                        return;
                    }
                }
            } catch (error: any) {
                // If verification endpoint errors, block and ask to retry
                console.error('Slot verification failed:', error);
                showToast(
                    error?.response?.data?.message || 'Could not verify active slots. Please try again.',
                    'error'
                );
                setIsValidatingSlots(false);
                return;
            }

            // Proceed with booking and payment
            await processBookingAndPayment();
        } catch (error: any) {
            console.log("validating...   error", error);
            const backendMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error.message;
            showToast(backendMessage || 'Failed to validate booking. Please try again.', 'error');
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
            // Prepare players array
            // If this is an additional booking, do NOT auto-add current user; require friends only
            type PlayerPayload = {
                existingUserId?: number;
                firstName?: string;
                lastName?: string;
                phone?: string;
                teamName?: string;
            };

            const basePlayers: PlayerPayload[] = isAdditionalBooking
                ? []
                : [{
                    existingUserId: user?.id,
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    phone: '', // Main user phone will be extracted from JWT token on backend
                    teamName: mainUserTeam || undefined // Include team selection for main user
                }];

            const friendPlayers: PlayerPayload[] = additionalSlots.map(slot => {
                if (slot.mode === 'existing' && slot.existingUserId) {
                    return {
                        existingUserId: slot.existingUserId,
                        firstName: slot.firstName || undefined,
                        lastName: slot.lastName || undefined,
                        phone: slot.phone || undefined,
                        teamName: slot.teamName || undefined
                    };
                }

                return {
                    firstName: slot.firstName,
                    lastName: slot.lastName,
                    phone: slot.phone,
                    teamName: slot.teamName || undefined
                };
            });

            const players: PlayerPayload[] = [...basePlayers, ...friendPlayers];

            const bookingData = {
                matchId: Number(matchId),
                userId: user?.id?.toString(),
                email: userEmail,
                totalSlots: numSlots,
                slotNumbers: Array.from({ length: numSlots }, (_, i) => i + 1), // Client-side placeholder; server locks actual
                players: players,
                isWaitlist: bookingType === 'waitlist', // Flag to indicate waitlist booking
                promoCode: appliedPromoCode || undefined, // Include promo code if applied
                    metadata: {
                        bookingType,
                        amount: finalPrice, // Add amount to metadata
                        additionalSlots: additionalSlots.map(slot => ({
                            mode: slot.mode,
                            existingUserId: slot.existingUserId,
                            firstName: slot.firstName,
                            lastName: slot.lastName,
                            phone: slot.phone,
                            teamName: slot.teamName || undefined
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
                name: 'HOF - Humans of Football',
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
                        // Show payment failed confirmation page
                        setBookingData({
                            id: booking.id,
                            amount: finalPrice,
                            totalSlots: numSlots,
                            bookingReference: booking.bookingReference
                        });
                        setShowPaymentFailed(true);
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

        } catch (error: any) {
            console.error('Booking process error:', error);
            const backendMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error.message;
            showToast(backendMessage || 'Failed to process booking. Please try again.', 'error');
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

    // Show payment failed confirmation page
    if (showPaymentFailed && bookingData) {
        return (
            <PaymentFailedConfirmation
                bookingId={bookingData.id}
                matchData={matchData}
                bookingData={bookingData}
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
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Match Information</div>
                        {matchData.participants && Object.values(matchData.participants).some((team: any) => team.length > 0) && (
                            <button
                                onClick={() => setShowTeammatesModal(true)}
                                className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                View Teammates
                            </button>
                        )}
                    </div>
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
                                            // Initialize friend details immediately for additional-booking mode
                                            if (isAdditionalBooking) {
                                                setAdditionalSlots([{ mode: 'new', firstName: '', lastName: '', phone: '' }]);
                                                setShowAdditionalDetails(true);
                                            } else {
                                                setAdditionalSlots([]);
                                                setShowAdditionalDetails(false);
                                            }
                                        }}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {bookingType === 'regular' ? 'Selected' : (isAdditionalBooking ? 'Book' : 'Select')}
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
                    <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                {isAdditionalBooking ? (
                                    <>
                                        <p className="font-medium">Add friends</p>
                                        <p className="text-sm text-gray-400">Enter player details for each slot</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-sm text-gray-400">You</p>
                                    </>
                                )}
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

                        {/* Team Selection for Main User (Confirmed Bookings Only) */}
                        {bookingType === 'regular' && !isAdditionalBooking && typedBookingInfo && (
                            <div className={`pt-3 border-t ${!mainUserTeam ? 'border-orange-500/50' : 'border-gray-700'} ${!mainUserTeam ? 'animate-pulse' : ''}`}>
                                <label className="text-sm font-medium text-gray-300 block mb-2">
                                    Select Your Team *
                                    {!mainUserTeam && (
                                        <span className="ml-2 text-xs text-orange-400">(Required)</span>
                                    )}
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setMainUserTeam(typedBookingInfo.teamAName)}
                                        disabled={typedBookingInfo.availableTeamASlots === 0}
                                        className={`
                                            relative p-3 rounded-lg border-2 transition-all duration-200
                                            ${mainUserTeam === typedBookingInfo.teamAName
                                                ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20'
                                                : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                                            }
                                            ${typedBookingInfo.availableTeamASlots === 0
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'cursor-pointer hover:scale-105 active:scale-95'
                                            }
                                        `}
                                    >
                                        <div className="text-left">
                                            <div className="font-bold text-white text-sm mb-1 truncate">
                                                {typedBookingInfo.teamAName}
                                            </div>
                                            <div className={`text-xs ${typedBookingInfo.availableTeamASlots === 0
                                                ? 'text-red-400'
                                                : 'text-gray-400'
                                                }`}>
                                                {typedBookingInfo.availableTeamASlots === 0
                                                    ? 'Full'
                                                    : `${typedBookingInfo.availableTeamASlots} slots`
                                                }
                                            </div>
                                        </div>
                                        {mainUserTeam === typedBookingInfo.teamAName && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setMainUserTeam(typedBookingInfo.teamBName)}
                                        disabled={typedBookingInfo.availableTeamBSlots === 0}
                                        className={`
                                            relative p-3 rounded-lg border-2 transition-all duration-200
                                            ${mainUserTeam === typedBookingInfo.teamBName
                                                ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20'
                                                : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                                            }
                                            ${typedBookingInfo.availableTeamBSlots === 0
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'cursor-pointer hover:scale-105 active:scale-95'
                                            }
                                        `}
                                    >
                                        <div className="text-left">
                                            <div className="font-bold text-white text-sm mb-1 truncate">
                                                {typedBookingInfo.teamBName}
                                            </div>
                                            <div className={`text-xs ${typedBookingInfo.availableTeamBSlots === 0
                                                ? 'text-red-400'
                                                : 'text-gray-400'
                                                }`}>
                                                {typedBookingInfo.availableTeamBSlots === 0
                                                    ? 'Full'
                                                    : `${typedBookingInfo.availableTeamBSlots} slots`
                                                }
                                            </div>
                                        </div>
                                        {mainUserTeam === typedBookingInfo.teamBName && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {(isAdditionalBooking ? numSlots >= 1 : numSlots > 1) && (
                            <div className="mt-2 flex items-center justify-between gap-3">
                                <button
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                    onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                                >
                                    {showAdditionalDetails ? '▼ Hide' : '▶ Add'} player details {bookingType === 'regular' && <span className="text-orange-400">*</span>}
                                </button>
                                {bookingType === 'regular' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowExistingUsersModal(true)}
                                    >
                                        Select existing players
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {bookingType && (
                    <div className="bg-gray-800/50 rounded-lg p-4">
                        <p className="text-sm text-gray-400">Booking Type: {bookingType}</p>
                    </div>
                )}

                {slotVerificationError && (
                    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center justify-between">
                        <p className="text-sm text-red-400">{slotVerificationError}</p>
                        <CircleX onClick={() => setSlotVerificationError(null)} className="text-sm text-red-400 cursor-pointer" />
                    </div>
                )}

                {/* Additional Slots Details */}
                {showAdditionalDetails && ((isAdditionalBooking ? numSlots >= 1 : numSlots > 1)) && (
                    <div className="space-y-4">
                        {additionalSlots.map((slot, index) => (
                            <div key={index} className="bg-gray-800/30 rounded-lg p-4">
                                <p className="text-sm font-medium mb-3">
                                    Slot {isAdditionalBooking ? (index + 1) : (index + 2)} - Player Details
                                </p>
                                <div className="space-y-3">
                                    {slot.mode === 'existing' ? (
                                        <>
                                            <div className="text-sm text-gray-200">
                                                {slot.firstName} {slot.lastName}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <PhoneIcon className="h-4 w-4" />
                                                <span>{slot.phone}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
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
                                        </>
                                    )}

                                    {/* Team Selection for Additional Players (Confirmed Bookings Only) */}
                                    {bookingType === 'regular' && typedBookingInfo && (
                                        <div className={`pt-3 border-t ${!slot.teamName ? 'border-orange-500/50 bg-orange-900/10' : 'border-gray-600'} mt-3 ${!slot.teamName ? 'animate-pulse' : ''}`}>
                                            <label className="text-sm font-medium text-gray-300 block mb-2">
                                                Select Team *
                                                {!slot.teamName && (
                                                    <span className="ml-2 text-xs text-orange-400">(Required)</span>
                                                )}
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAdditionalSlotUpdate(index, 'teamName', typedBookingInfo.teamAName)}
                                                    disabled={typedBookingInfo.availableTeamASlots === 0}
                                                    className={`
                                                        relative p-2.5 rounded-lg border-2 transition-all duration-200
                                                        ${slot.teamName === typedBookingInfo.teamAName
                                                            ? 'border-green-500 bg-green-500/20 shadow-md shadow-green-500/20'
                                                            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                                                        }
                                                        ${typedBookingInfo.availableTeamASlots === 0
                                                            ? 'opacity-50 cursor-not-allowed'
                                                            : 'cursor-pointer hover:scale-105 active:scale-95'
                                                        }
                                                    `}
                                                >
                                                    <div className="text-left">
                                                        <div className="font-bold text-white text-xs mb-0.5 truncate">
                                                            {typedBookingInfo.teamAName}
                                                        </div>
                                                        <div className={`text-[10px] ${typedBookingInfo.availableTeamASlots === 0
                                                            ? 'text-red-400'
                                                            : 'text-gray-400'
                                                            }`}>
                                                            {typedBookingInfo.availableTeamASlots === 0
                                                                ? 'Full'
                                                                : `${typedBookingInfo.availableTeamASlots} slots`
                                                            }
                                                        </div>
                                                    </div>
                                                    {slot.teamName === typedBookingInfo.teamAName && (
                                                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-[9px]">✓</span>
                                                        </div>
                                                    )}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleAdditionalSlotUpdate(index, 'teamName', typedBookingInfo.teamBName)}
                                                    disabled={typedBookingInfo.availableTeamBSlots === 0}
                                                    className={`
                                                        relative p-2.5 rounded-lg border-2 transition-all duration-200
                                                        ${slot.teamName === typedBookingInfo.teamBName
                                                            ? 'border-green-500 bg-green-500/20 shadow-md shadow-green-500/20'
                                                            : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                                                        }
                                                        ${typedBookingInfo.availableTeamBSlots === 0
                                                            ? 'opacity-50 cursor-not-allowed'
                                                            : 'cursor-pointer hover:scale-105 active:scale-95'
                                                        }
                                                    `}
                                                >
                                                    <div className="text-left">
                                                        <div className="font-bold text-white text-xs mb-0.5 truncate">
                                                            {typedBookingInfo.teamBName}
                                                        </div>
                                                        <div className={`text-[10px] ${typedBookingInfo.availableTeamBSlots === 0
                                                            ? 'text-red-400'
                                                            : 'text-gray-400'
                                                            }`}>
                                                            {typedBookingInfo.availableTeamBSlots === 0
                                                                ? 'Full'
                                                                : `${typedBookingInfo.availableTeamBSlots} slots`
                                                            }
                                                        </div>
                                                    </div>
                                                    {slot.teamName === typedBookingInfo.teamBName && (
                                                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                            <span className="text-white text-[9px]">✓</span>
                                                        </div>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
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

                {/* Promo Code Section - Only for regular bookings */}
                {bookingType === 'regular' && (
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Promo Code (Optional)</label>
                        {!appliedPromoCode ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => {
                                        setPromoCode(e.target.value.toUpperCase());
                                        setPromoCodeError(null);
                                    }}
                                    placeholder="Enter promo code"
                                    className="flex-1 bg-gray-800/50 rounded-lg p-3"
                                    disabled={isValidatingPromoCode}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleApplyPromoCode}
                                    disabled={!promoCode.trim() || isValidatingPromoCode || isCalculatingPrice}
                                >
                                    {isValidatingPromoCode ? 'Validating...' : 'Apply'}
                                </Button>
                            </div>
                        ) : (
                            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium text-green-400">Promo Code Applied: {appliedPromoCode}</div>
                                    <div className="text-xs text-green-300">Discount: ₹{promoCodeDiscount.toLocaleString()}</div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemovePromoCode}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    Remove
                                </Button>
                            </div>
                        )}
                        {promoCodeError && (
                            <div className="text-sm text-red-400">{promoCodeError}</div>
                        )}
                    </div>
                )}

                {/* Price Summary - Only for regular bookings */}
                {bookingType === 'regular' && finalPrice > 0 && (
                    <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                        <div className="text-sm font-medium mb-2">Price Summary</div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Original Amount:</span>
                            <span className="font-medium">₹{originalPrice.toLocaleString()}</span>
                        </div>
                        {appliedPromoCode && promoCodeDiscount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Discount:</span>
                                <span className="font-medium text-green-400">-₹{promoCodeDiscount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="border-t border-gray-700 pt-2 flex justify-between">
                            <span className="font-medium">Final Amount:</span>
                            <span className="font-bold text-lg">₹{finalPrice.toLocaleString()}</span>
                        </div>
                    </div>
                )}

                <div className="border-t border-gray-700 my-4"></div>

            </div>

            {/* Payment Button */}
            <div className="p-4 bg-black/80 backdrop-blur-sm border-t border-gray-700">
                <Button
                    className="w-full"
                    onClick={handleProceedToPayment}
                    disabled={
                        !typedBookingInfo ||
                        numSlots <= 0 ||
                        bookingType === null ||
                        isLoadingBookingInfo ||
                        isCalculatingPrice ||
                        isValidatingSlots ||
                        isProcessingBooking ||
                        (bookingType === 'regular' && !areTeamSelectionsComplete())
                    }
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
                            ) : !areTeamSelectionsComplete() ? (
                                'Select Teams to Continue'
                            ) : (
                                `Pay ₹${finalPrice.toLocaleString()}`
                            )}
                        </>
                    )}
                </Button>
            </div>

            {/* Teammates Modal */}
            {matchData.participants && (
                <TeammatesModal
                    isOpen={showTeammatesModal}
                    onClose={() => setShowTeammatesModal(false)}
                    participants={matchData.participants}
                />
            )}
            {/* Existing Users Picker Modal */}
            <ExistingUsersPickerModal
                isOpen={showExistingUsersModal}
                onClose={() => setShowExistingUsersModal(false)}
                matchCityId={matchData?.venue?.city?.id}
                initialSelectedUserIds={additionalSlots
                    .filter(s => s.mode === 'existing' && s.existingUserId)
                    .map(s => s.existingUserId as number)
                }
                onApply={handleApplyExistingUsers}
            />
        </div>
    );
}
