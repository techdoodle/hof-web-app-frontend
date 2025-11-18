'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { WaitlistService } from '@/lib/waitlistService';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay';
import { Button } from '@/components/ui/button';
import { Clock, Users, Phone, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';
import { useCriticalBookingInfo, CriticalBookingInfo } from '@/hooks/useCriticalBookingInfo';

interface WaitlistConfirmData {
    waitlistId: string;
    slots: string[];
    matchDetails: any;
    matchId?: number;
    userPhone?: string;
}

function WaitlistConfirmContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuthContext();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [waitlistData, setWaitlistData] = useState<WaitlistConfirmData | null>(null);
    const [orderData, setOrderData] = useState<any>(null);
    const [teamSelections, setTeamSelections] = useState<Record<number, string>>({});
    const [bookingInfo, setBookingInfo] = useState<CriticalBookingInfo | null>(null);

    useEffect(() => {
        const fetchWaitlistData = async () => {
            const waitlistId = searchParams.get('id');
            const slots = searchParams.get('slots')?.split(',') || [];

            if (!waitlistId || !slots.length) {
                showToast('Invalid waitlist confirmation link', 'error');
                router.push('/play');
                return;
            }

            try {
                // Fetch waitlist entry to get match ID and user info
                const waitlistEntry = await WaitlistService.getWaitlistEntry(waitlistId);
                const matchId = waitlistEntry.matchId;

                // Fetch booking info to get team details
                const bookingInfoResponse = await api.get(`/matches/${matchId}/booking-info`);
                setBookingInfo(bookingInfoResponse.data);

                setWaitlistData({
                    waitlistId,
                    slots,
                    matchDetails: waitlistEntry,
                    matchId: matchId,
                    userPhone: user?.phoneNumber || ''
                });
            } catch (error) {
                showToast('Failed to load waitlist details', 'error');
                router.push('/play');
            } finally {
                setLoading(false);
            }
        };

        fetchWaitlistData();
    }, [searchParams, showToast, router, user]);

    const handleInitiatePayment = async () => {
        if (!waitlistData) return;

        // Validate team selections
        const numSlots = waitlistData.slots.length;
        for (let i = 0; i < numSlots; i++) {
            if (!teamSelections[i]) {
                showToast(`Please select a team for slot ${i + 1}`, 'error');
                return;
            }
        }

        // Build team selections array
        const teamSelectionsArray = waitlistData.slots.map((_, index) => ({
            phone: waitlistData.userPhone || user?.phoneNumber || '',
            teamName: teamSelections[index]
        }));

        setProcessing(true);
        try {
            const order = await WaitlistService.initiateWaitlistBooking(
                waitlistData.waitlistId,
                teamSelectionsArray
            );
            setOrderData(order);

            // Load Razorpay script and open checkout
            await loadRazorpayScript();

            const razorpayOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: order.amount,
                currency: order.currency,
                name: 'Humans of Football',
                description: `Waitlist booking for ${waitlistData.slots.length} slot(s)`,
                order_id: order.orderId,
                prefill: {
                    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
                    email: user?.email || '',
                    contact: user?.phoneNumber || ''
                },
                notes: {
                    waitlistId: waitlistData.waitlistId,
                    slots: waitlistData.slots.join(',')
                },
                theme: {
                    color: '#f39c12'
                },
                handler: async (response: any) => {
                    try {
                        await WaitlistService.confirmWaitlistBooking(
                            waitlistData.waitlistId,
                            order.orderId,
                            response.razorpay_payment_id,
                            response.razorpay_signature,
                            teamSelectionsArray
                        );

                        showToast('Waitlist booking confirmed successfully!', 'success');
                        router.push('/play');
                    } catch (error) {
                        showToast('Payment verification failed', 'error');
                    }
                },
                modal: {
                    ondismiss: () => {
                        setProcessing(false);
                    }
                }
            };

            openRazorpayCheckout(razorpayOptions);

        } catch (error) {
            showToast('Failed to initiate payment', 'error');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    if (!waitlistData) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Invalid waitlist link</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Slots Available!</h1>
                    <p className="text-gray-300">You have been notified about available slots</p>
                </div>

                {/* Available Slots Info */}
                <div className="bg-orange-800/30 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Available Slots
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-400">Slots Available:</span>
                            <div className="text-2xl font-bold text-orange-400">
                                {waitlistData.slots.length}
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-400">Slot Numbers:</span>
                            <div className="text-lg font-medium">
                                {waitlistData.slots.join(', ')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Competitive Notice */}
                <div className="bg-yellow-800/30 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-2">🏃‍♂️ First Come, First Served</h3>
                    <ul className="text-sm space-y-1 text-gray-300">
                        <li>• All waitlisted users have been notified simultaneously</li>
                        <li>• Whoever books first gets the slot(s) - no time limit</li>
                        <li>• Regular users can also book these slots directly from the app</li>
                    </ul>
                </div>

                {/* Team Selection */}
                {bookingInfo && (
                    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/60 rounded-xl p-6 mb-6 border border-gray-700/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">⚽</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Select Your Team</h3>
                                <p className="text-sm text-gray-400">Choose a team for each slot</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {waitlistData.slots.map((slotNum, index) => (
                                <div key={index} className="group">
                                    <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-semibold text-gray-300">
                                                    #{slotNum}
                                                </div>
                                                <span className="text-sm font-medium text-gray-300">Slot {index + 1}</span>
                                            </div>
                                            {teamSelections[index] && (
                                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                                    ✓ Selected
                                                </span>
                                            )}
                                        </div>

                                        {/* Team Selection Buttons */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setTeamSelections({
                                                    ...teamSelections,
                                                    [index]: bookingInfo.teamAName
                                                })}
                                                disabled={bookingInfo.availableTeamASlots === 0}
                                                className={`
                                                    relative p-4 rounded-lg border-2 transition-all duration-200
                                                    ${teamSelections[index] === bookingInfo.teamAName
                                                        ? 'border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/20'
                                                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                                                    }
                                                    ${bookingInfo.availableTeamASlots === 0
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'cursor-pointer hover:scale-105 active:scale-95'
                                                    }
                                                `}
                                            >
                                                <div className="text-left">
                                                    <div className="font-bold text-white mb-1 truncate">
                                                        {bookingInfo.teamAName}
                                                    </div>
                                                    <div className={`text-xs ${bookingInfo.availableTeamASlots === 0
                                                        ? 'text-red-400'
                                                        : 'text-gray-400'
                                                        }`}>
                                                        {bookingInfo.availableTeamASlots === 0
                                                            ? 'Full'
                                                            : `${bookingInfo.availableTeamASlots} available`
                                                        }
                                                    </div>
                                                </div>
                                                {teamSelections[index] === bookingInfo.teamAName && (
                                                    <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs">✓</span>
                                                    </div>
                                                )}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setTeamSelections({
                                                    ...teamSelections,
                                                    [index]: bookingInfo.teamBName
                                                })}
                                                disabled={bookingInfo.availableTeamBSlots === 0}
                                                className={`
                                                    relative p-4 rounded-lg border-2 transition-all duration-200
                                                    ${teamSelections[index] === bookingInfo.teamBName
                                                        ? 'border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/20'
                                                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                                                    }
                                                    ${bookingInfo.availableTeamBSlots === 0
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'cursor-pointer hover:scale-105 active:scale-95'
                                                    }
                                                `}
                                            >
                                                <div className="text-left">
                                                    <div className="font-bold text-white mb-1 truncate">
                                                        {bookingInfo.teamBName}
                                                    </div>
                                                    <div className={`text-xs ${bookingInfo.availableTeamBSlots === 0
                                                        ? 'text-red-400'
                                                        : 'text-gray-400'
                                                        }`}>
                                                        {bookingInfo.availableTeamBSlots === 0
                                                            ? 'Full'
                                                            : `${bookingInfo.availableTeamBSlots} available`
                                                        }
                                                    </div>
                                                </div>
                                                {teamSelections[index] === bookingInfo.teamBName && (
                                                    <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs">✓</span>
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 bg-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-400 text-xs">ℹ</span>
                                </div>
                                <div className="text-xs text-blue-300">
                                    <p className="font-medium mb-1">Team Capacity</p>
                                    <p className="text-blue-400/80">Each team can have up to {bookingInfo.perTeamCapacity} players. Select wisely!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <div className="text-center">
                    <Button
                        onClick={handleInitiatePayment}
                        disabled={processing || !bookingInfo}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-4 rounded-lg"
                    >
                        {processing ? 'Processing...' : `Book ${waitlistData.slots.length} Slot(s) Now`}
                    </Button>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center text-sm text-gray-400">
                    <p>This is a competitive booking - book quickly to secure your slots!</p>
                </div>
            </div>
        </div>
    );
}

export default function WaitlistConfirmPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        }>
            <WaitlistConfirmContent />
        </Suspense>
    );
}
