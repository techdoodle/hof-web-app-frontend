import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';
import { AlertCircle, Calendar, MapPin, Clock, Users, ArrowRight, RefreshCw } from 'lucide-react';

interface PaymentFailedConfirmationProps {
    bookingId: string;
    matchData: any;
    bookingData: any;
    onClose: () => void;
}

export function PaymentFailedConfirmation({ bookingId, matchData, bookingData, onClose }: PaymentFailedConfirmationProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleDone = () => {
        setIsLoading(true);
        // Navigate back to play page or match details
        router.push('/play');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getDuration = () => {
        const start = new Date(matchData.startTime);
        const end = new Date(matchData.endTime);
        const durationMs = end.getTime() - start.getTime();
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        return durationMinutes;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-orange-900 flex flex-col">
            {/* Status Bar */}
            <div className="flex justify-between items-center px-4 py-2 text-white text-sm">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-2 bg-white rounded-sm"></div>
                    <div className="w-4 h-2 bg-white rounded-sm"></div>
                    <div className="w-4 h-2 bg-white rounded-sm"></div>
                </div>
            </div>

            {/* Payment Failed Icon */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="w-24 h-24 bg-orange-400 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                    <AlertCircle className="w-12 h-12 text-white" />
                </div>

                {/* Payment Failed Message */}
                <h1 className="text-3xl font-bold text-white mb-2 text-center">Payment Processing</h1>

                {/* Amount */}
                <div className="text-4xl font-bold text-white mb-2">
                    ₹{bookingData?.amount || 0}
                </div>

                {/* Info Message */}
                <p className="text-orange-200 text-center mb-4 px-4">
                    Your payment is being reviewed
                </p>

                {/* Check Again Message */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 max-w-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <RefreshCw className="w-5 h-5 text-orange-300" />
                        <p className="text-white font-semibold">Check Again in 30 Minutes</p>
                    </div>
                    <p className="text-orange-200 text-sm text-center">
                        We're reviewing your booking. Please check back in 30 minutes to see the updated status.
                    </p>
                </div>

                {/* Transaction Details */}
                <div className="text-orange-200 text-center mb-8">
                    <p className="text-sm">
                        {formatDate(new Date().toISOString())} {formatTime(new Date().toISOString())}
                    </p>
                    <p className="text-xs mt-1">Booking ID: {bookingData?.bookingReference || bookingId}</p>
                </div>

                {/* Booking Details Card */}
                <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                    <h3 className="text-white font-semibold mb-4 text-center">Booking Details</h3>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-orange-300" />
                            <span className="text-white text-sm">{matchData.venue.name}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-orange-300" />
                            <span className="text-white text-sm">
                                {formatDate(matchData.startTime)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-orange-300" />
                            <span className="text-white text-sm">
                                {formatTime(matchData.startTime)} - {formatTime(matchData.endTime)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-orange-300" />
                            <span className="text-white text-sm">
                                {bookingData?.totalSlots || 1} slot(s) • {getDuration()} minutes
                            </span>
                        </div>
                    </div>
                </div>

                {/* Done Button */}
                <Button
                    onClick={handleDone}
                    disabled={isLoading}
                    className="w-full max-w-sm bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2"
                >
                    {isLoading ? 'Processing...' : 'Done'}
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}

