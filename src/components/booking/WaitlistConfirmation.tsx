import { Button } from '@/components/ui/button';
import { CheckCircle2, ChevronRight, Clock, Users, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface WaitlistConfirmationProps {
    waitlistId: string;
    matchData: any;
    waitlistData: {
        id: string;
        slotsRequired: number;
        email: string;
    };
    onClose: () => void;
}

export function WaitlistConfirmation({ waitlistId, matchData, waitlistData, onClose }: WaitlistConfirmationProps) {
    const router = useRouter();
    const confirmationDate = new Date();

    const handleDone = () => {
        router.push('/play');
        onClose();
    };

    return (
        <div className="h-full flex flex-col bg-orange-900/20 text-white p-4">
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-orange-500/30 animate-pulse-slow">
                    <Clock className="w-20 h-20 text-orange-400" />
                </div>
                <h1 className="text-3xl font-bold">Added to Waitlist</h1>
                <p className="text-2xl font-extrabold text-orange-400">You're in the queue!</p>
                <p className="text-sm text-gray-300">We'll notify you when slots become available</p>
                <p className="text-xs text-gray-400">{format(confirmationDate, 'dd MMMM yyyy hh:mm a')}</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 space-y-3 mb-6">
                <h2 className="text-lg font-semibold">Waitlist Details</h2>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Waitlist ID:</span>
                    <span className="font-medium">{waitlistId}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Slots Requested:</span>
                    <span className="font-medium">{waitlistData.slotsRequired}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Email:</span>
                    <span className="font-medium">{waitlistData.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span className="font-medium text-orange-400">On Waitlist</span>
                </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 space-y-3 mb-6">
                <h2 className="text-lg font-semibold">Match Details</h2>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Venue:</span>
                    <span className="font-medium">{matchData.venueName}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Date:</span>
                    <span className="font-medium">{format(new Date(matchData.startTime), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Time:</span>
                    <span className="font-medium">
                        {format(new Date(matchData.startTime), 'hh:mm a')} - {format(new Date(matchData.endTime), 'hh:mm a')}
                    </span>
                </div>
            </div>

            <div className="bg-orange-800/30 rounded-lg p-4 space-y-3 mb-6">
                <h2 className="text-lg font-semibold flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Football Chief Contact
                </h2>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Name:</span>
                    <span className="font-medium">{matchData.footballChief.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Phone:</span>
                    <span className="font-medium flex items-center">
                        <Phone className="w-4 h-4 mr-1 cursor-pointer" onClick={() => window.open(`tel:${matchData.footballChief.phone}`, '_blank')} />
                        {matchData.footballChief.phone}
                    </span>
                </div>
            </div>

            <div className="bg-blue-800/30 rounded-lg p-4 space-y-3 mb-6">
                <h2 className="text-lg font-semibold">What Happens Next?</h2>
                <ul className="text-sm space-y-2 text-gray-300">
                    <li>• We'll monitor the match for any cancellations</li>
                    <li>• When slots become available, you'll receive an email notification</li>
                    <li>• You'll have a limited time to confirm your booking</li>
                </ul>
            </div>

            <Button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-3 flex items-center justify-center"
                onClick={handleDone}
            >
                Done <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
        </div>
    );
}
