import { format } from 'date-fns';

export const VenueDetails = ({ matchStats }: { matchStats: any }) => {
    return (
        <div className="venue-details">
            {matchStats?.match && <div className="venue-details-header">
                <div className="text-xl font-rajdhani font-bold">{matchStats.match.venue}</div>
                {matchStats.match.startTime && <div className="text-md font-rajdhani font-bold">{format(matchStats.match.startTime, 'dd MMM yyyy, hh:mm a')}</div>}
            </div>}
        </div>
    );
};