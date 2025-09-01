import { format } from 'date-fns';
import { Clock3 } from 'lucide-react';

export const VenueDetails = ({ matchStats }: { matchStats: any }) => {
    return (
        <div className="venue-details">
            {matchStats?.match && <div className="venue-details-header">
                <div className="text-xl font-rajdhani font-bold">{matchStats.match.venue}</div>
                {matchStats.match.startTime &&
                    <div className="flex flex-row gap-2 items-center">
                        <Clock3 className="w-4 h-4" />
                        <div className="text-md font-rajdhani text-gray-300">
                            {format(matchStats.match.startTime, 'dd MMM yyyy • hh:mm a')}
                        </div>
                    </div>}
            </div>}

        </div>
    );
};