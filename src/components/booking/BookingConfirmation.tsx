import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';
import { CheckCircle, Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react';

interface BookingConfirmationProps {
    bookingId: string;
    matchData: any;
    bookingData: any;
    onClose: () => void;
}

export function BookingConfirmation({ bookingId, matchData, bookingData, onClose }: BookingConfirmationProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleDone = () => {
        setIsLoading(true);
        // Navigate back to play page or match details
        router.push('/play');
        // onClose();
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
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex flex-col">
            {/* Status Bar */}
            <div className="flex justify-between items-center px-4 py-2 text-white text-sm">
                <span>7:48</span>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-2 bg-white rounded-sm"></div>
                    <div className="w-4 h-2 bg-white rounded-sm"></div>
                    <div className="w-4 h-2 bg-white rounded-sm"></div>
                </div>
            </div>

            {/* Success Icon */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="w-24 h-24 bg-green-400 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                    <CheckCircle className="w-12 h-12 text-white" />
                </div>

                {/* Success Message */}
                <h1 className="text-3xl font-bold text-white mb-2">Paid Successfully</h1>

                {/* Amount */}
                <div className="text-4xl font-bold text-white mb-2">
                    ₹{bookingData?.amount || 0}
                </div>

                {/* Recipient */}
                <p className="text-green-200 text-center mb-8">
                    Paid to Humans of Football Pvt.
                </p>

                {/* Transaction Details */}
                <div className="text-green-200 text-center mb-8">
                    <p className="text-sm">
                        {formatDate(new Date().toISOString())} {formatTime(new Date().toISOString())}
                    </p>
                </div>

                {/* Booking Details Card */}
                <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                    <h3 className="text-white font-semibold mb-4 text-center">Booking Details</h3>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-green-300" />
                            <span className="text-white text-sm">{matchData.venue.name}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-green-300" />
                            <span className="text-white text-sm">
                                {formatDate(matchData.startTime)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-green-300" />
                            <span className="text-white text-sm">
                                {formatTime(matchData.startTime)} - {formatTime(matchData.endTime)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-green-300" />
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
                    className="w-full max-w-sm bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2"
                >
                    {isLoading ? 'Processing...' : 'Done'}
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
