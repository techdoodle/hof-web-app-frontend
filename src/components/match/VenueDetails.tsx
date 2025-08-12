export const VenueDetails = ({ matchStats }: { matchStats: any }) => {
    return (
        <div className="venue-details">
            <div className="venue-details-header">
                <div className="text-xl font-rajdhani font-bold">{matchStats.match.venue}</div>
                <div className="text-md font-rajdhani font-bold">{matchStats.match.startTime}</div>
            </div>
        </div>
    );
};