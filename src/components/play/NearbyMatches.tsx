import { Button } from '../ui/button';
import { Loader2Icon, MapPinIcon } from 'lucide-react';
import { useNearbyMatches } from '@/hooks/useNearbyMatches';
import { useLocation } from '@/contexts/LocationContext';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { HofSelectChip } from '../common/HofSelectChip';
import { useState, useMemo, useEffect } from 'react';

type DayFilter = 'all' | 'weekend' | 'weekday';

interface NearbyMatchesProps {
    location?: { latitude: number; longitude: number } | null;
}

export function NearbyMatches({ location: propLocation }: NearbyMatchesProps = {}) {
    const { location: contextLocation } = useLocation();
    // Use prop location if provided, otherwise fall back to context location
    const location = propLocation !== undefined ? propLocation : contextLocation;

    const router = useRouter();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [dayFilter, setDayFilter] = useState<DayFilter>('all');
    const [hofSelectOnly, setHofSelectOnly] = useState(false);

    // Use the hook with a custom location if provided
    const { data: venues, isLoading, error, refetch } = useNearbyMatches(propLocation);

    const filteredVenues = useMemo(() => {
        if (!venues) return [];

        return venues.map((venueData: any) => ({
            ...venueData,
            matches: venueData.matches.filter((match: any) => {
                const matchDate = new Date(match.startTime);
                const isWeekend = matchDate.getDay() === 0 || matchDate.getDay() === 6;
                const matchesDayFilter =
                    dayFilter === 'all' ? true :
                        dayFilter === 'weekend' ? isWeekend :
                            !isWeekend;

                const matchesHofSelect = !hofSelectOnly || match.matchType === 'HOF Select';

                const matchesSearch = searchQuery === '' ||
                    venueData.venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    match.footballChief.name.toLowerCase().includes(searchQuery.toLowerCase());

                return matchesDayFilter && matchesHofSelect && matchesSearch;
            })
        })).filter((venueData: any) => venueData.matches.length > 0);
    }, [venues, dayFilter, hofSelectOnly, searchQuery]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDuration = (startTime: string, endTime: string) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const duration = Number(((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(2)); // hours
        return `${formatTime(startTime)} (${duration}h)`;
    };

    // Note: We don't show error here anymore - parent component handles showing LocationPicker
    // This allows users to select a city even when location is denied

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2Icon className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">{error?.message || 'Failed to load nearby matches'}</p>
                <Button onClick={() => refetch()} className="mt-4">
                    Try Again
                </Button>
            </div>
        );
    }

    if (!venues || (Array.isArray(venues) && venues.length === 0)) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-400">No venues found nearby.</p>
                <p className="text-gray-500 text-sm mt-2">Try selecting a different location or check back later.</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* Search Bar */}
            <div className="w-full">
                <input
                    type="text"
                    placeholder="Search by venue or organizer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-primary"
                />
            </div>

            {/* Filters Row */}
            <div className="flex items-end gap-2">
                {/* Day Filters - 50% width */}
                <div className="flex gap-2 flex-1">
                    {['all', 'weekend', 'weekday'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setDayFilter(filter as DayFilter)}
                            className={`px-4 py-2 rounded-lg ${dayFilter === filter
                                ? 'bg-primary text-black'
                                : 'bg-gray-800 text-gray-300'
                                }`}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>


                {/* HOF Select Filter - 25% width */}
                <div className="flex items-center justify-end">
                    <button
                        onClick={() => setHofSelectOnly(!hofSelectOnly)}
                        className="relative flex-col items-end rounded-lg px-3 py-2"
                    >
                        <span className="text-xs font-medium text-white-400">HOF Select</span>
                        {/* Toggle Switch */}
                        <div className="ml-2 w-12 h-6 rounded-full bg-gray-700 relative">
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all duration-200 ${hofSelectOnly
                                ? 'translate-x-6 bg-golden'
                                : 'translate-x-0 bg-gray-600'
                                }`}>
                                {hofSelectOnly && (
                                    <div className="p-1 w-full h-full bg-hof-select-golden-gradient-light rounded-full">
                                        <div className="w-full h-full bg-[url(/tick-hof-select.svg)] bg-cover bg-center bg-no-repeat" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {filteredVenues.map((venueData: any) => (
                    <div key={venueData.venue.id} className="overflow-hidden">
                        {/* Venue Header */}
                        <div className="flex items-center p-4">
                            <div
                                className="h-16 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0"
                                style={{ flex: '0 0 35%' }}
                            >
                                {venueData.venue.displayBanner && (venueData.venue.displayBanner.startsWith('data:image/jpeg;base64,') || venueData.venue.displayBanner.startsWith('data:image/png;base64,')) ? (
                                    <Image
                                        src={venueData.venue.displayBanner}
                                        alt={venueData.venue.name}
                                        width={100}
                                        height={64}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-30 h-16 flex items-center justify-center">
                                        <MapPinIcon className="w-10 h-10 text-gray-500" />
                                    </div>
                                )}
                            </div>
                            <div
                                className="ml-4"
                                style={{ flex: '0 0 65%' }}
                            >
                                <h3 className="font-large text-xl text-white">{venueData.venue.name}</h3>
                                <p className="text-sm text-gray-400">{venueData.venue.distance.toFixed(1)} kms away</p>
                            </div>
                        </div>

                        {/* Matches */}
                        {Array.isArray(venueData?.matches) && venueData?.matches?.length > 0 && (
                            <>
                                <div className="border-t border-gray-700"></div>
                                <div className="p-4 space-y-3">
                                    {venueData.matches.map((match: any) => (
                                        <div
                                            key={match.id}
                                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors ${match.matchType === "HOF Select" ? 'bg-hof-select-golden-gradient' : ''}`}
                                            onClick={() => {
                                                // Prefetch match details before navigation
                                                queryClient.prefetchQuery({
                                                    queryKey: ['match-details', match.id],
                                                    queryFn: async () => {
                                                        return {
                                                            ...match,
                                                            venue: venueData.venue,
                                                            isFastFilling: match.bookedSlots / match.playerCapacity > 0.5,
                                                        };
                                                    },
                                                });
                                                router.push(`/match-details/${match.id}`);
                                            }}
                                        >
                                            <div className="flex-3">
                                                {match.matchType === "HOF Select" && (
                                                    <div className="mb-2">
                                                        <HofSelectChip />
                                                    </div>
                                                )}
                                                <p className="text-sm text-gray-300 italic">{match.playerCapacity / 2}v{match.playerCapacity / 2}</p>
                                                <p className="text-sm text-gray-300">
                                                    {formatDate(match.startTime)}
                                                </p>
                                                <p className="text-sm text-gray-300">
                                                    {formatDuration(match.startTime, match.endTime)}
                                                </p>
                                            </div>
                                            <div className="flex-4 text-left pl-4">
                                                <p className="text-sm font-medium text-gray-300">
                                                    {match.footballChief.name || 'HOF Admin'} (Organiser)
                                                </p>
                                            </div>
                                            <div className="flex-4 text-right">
                                                {match.offerPrice < match.slotPrice ? (
                                                    <div>
                                                        <p className="text-sm text-white-500 line-through">
                                                            ₹{match.slotPrice}
                                                        </p>
                                                        <p className="text-md text-font-bold font-medium text-green-400">
                                                            ₹{match.offerPrice}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm font-medium text-white-400">
                                                        ₹{match.slotPrice}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
