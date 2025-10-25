'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { WaitlistService } from '@/lib/waitlistService';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay';
import { Button } from '@/components/ui/button';
import { Clock, Users, Phone, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface WaitlistConfirmData {
    waitlistId: string;
    slots: string[];
    matchDetails: any;
}

export default function WaitlistConfirmPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuthContext();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [waitlistData, setWaitlistData] = useState<WaitlistConfirmData | null>(null);
    const [orderData, setOrderData] = useState<any>(null);

    useEffect(() => {
        const waitlistId = searchParams.get('id');
        const slots = searchParams.get('slots')?.split(',') || [];

        if (!waitlistId || !slots.length) {
            showToast('Invalid waitlist confirmation link', 'error');
            router.push('/play');
            return;
        }

        setWaitlistData({ waitlistId, slots, matchDetails: null });
        setLoading(false);
    }, [searchParams, showToast, router]);

    const handleInitiatePayment = async () => {
        if (!waitlistData) return;

        setProcessing(true);
        try {
            const order = await WaitlistService.initiateWaitlistBooking(waitlistData.waitlistId);
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
                            response.razorpay_signature
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

                {/* Action Button */}
                <div className="text-center">
                    <Button
                        onClick={handleInitiatePayment}
                        disabled={processing}
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
