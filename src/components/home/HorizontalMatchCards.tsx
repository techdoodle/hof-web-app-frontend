'use client';

import { useMemo } from 'react';
import { useNearbyMatches } from '@/hooks/useNearbyMatches';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Match {
    id: number;
    startTime: string;
    endTime: string;
    venue: {
        id: number;
        name: string;
        display_banner?: string;
        displayBanner?: string;
        distance: number;
    };
}

export function HorizontalMatchCards() {
    const { data: venues, isLoading, error } = useNearbyMatches();
    const router = useRouter();

    // Flatten all matches from all venues, filter for today, and sort by latest first
    const allMatches = useMemo(() => {
        if (!venues) return [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tenDaysFromNow = new Date(today);
        tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
        tenDaysFromNow.setHours(23, 59, 59, 999);

        const matches: Match[] = [];
        venues.forEach((venueData: any) => {
            console.log("venueData", venueData);
            if (Array.isArray(venueData.matches)) {
                venueData.matches.forEach((match: any) => {
                    // Filter out cancelled matches
                    if (match.status === 'CANCELLED') {
                        return;
                    }

                    const matchDate = new Date(match.startTime);
                    // Only include matches within the next 10 days
                    if (matchDate >= today && matchDate <= tenDaysFromNow) {
                        matches.push({
                            ...match,
                            venue: {
                                ...venueData.venue,
                                displayBanner: venueData.venue.displayBanner || venueData.venue.display_banner,
                            },
                        });
                    }
                });
            }
        });

        // Sort by startTime, latest first
        return matches.sort((a, b) => {
            const timeA = new Date(a.startTime).getTime();
            const timeB = new Date(b.startTime).getTime();
            return timeB - timeA;
        });
    }, [venues]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDuration = (startTime: string, endTime: string) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
        return `${durationMinutes} mins`;
    };

    const getVenueImage = (venue: any) => {
        const banner = venue.displayBanner || venue.display_banner;
        if (banner && (banner.startsWith('data:image/jpeg;base64,') || banner.startsWith('data:image/png;base64,'))) {
            return banner;
        }
        return '/dummy-soccer-ground.png';
    };

    if (isLoading) {
        return (
            <div className="relative">
                <div
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                    style={{
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {[...Array(3)].map((_, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 w-[280px] rounded-lg overflow-hidden"
                        >
                            {/* Skeleton Image */}
                            <div className="relative w-full h-40 bg-gray-800 rounded-lg overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer"></div>
                            </div>

                            {/* Skeleton Match Info */}
                            <div className="py-2 px-0 space-y-2">
                                <div className="h-5 bg-gray-800 rounded overflow-hidden w-3/4">
                                    <div className="h-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer"></div>
                                </div>
                                <div className="h-4 bg-gray-800 rounded overflow-hidden w-1/2">
                                    <div className="h-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer"></div>
                                </div>
                                <div className="h-4 bg-gray-800 rounded overflow-hidden w-2/3">
                                    <div className="h-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !allMatches || allMatches.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-400">No matches found nearby.</p>
            </div>
        );
    }

    // Show max 5 matches, then "view more" card
    const displayMatches = allMatches.slice(0, 5);
    const hasMore = allMatches.length > 5;

    return (
        <div className="relative">
            <div
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                style={{
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {displayMatches.map((match: any) => (
                    <div
                        key={match.id}
                        onClick={() => router.push(`/match-details/${match.id}`)}
                        className="flex-shrink-0 w-[280px] rounded-lg overflow-hidden cursor-pointer transition-colors"
                    >
                        {/* Match Image */}
                        <div className="relative w-full h-40">
                            <Image
                                src={getVenueImage(match.venue)}
                                alt={match.venue.name}
                                fill
                                className="object-cover"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent"></div>
                        </div>

                        {/* Match Info */}
                        <div className="py-2 px-0">
                            <h3 className="text-white font-medium text-lg truncate">
                                {match.venue.name}
                            </h3>
                            <p className="text-white font-medium text-sm">
                                {match.venue.distance?.toFixed(1) || '0'} kms away
                            </p>
                            <p className="text-gray-400 text-sm">
                                {formatTime(match.startTime)} ({formatDuration(match.startTime, match.endTime)})
                            </p>
                        </div>
                    </div>
                ))}

                {/* View More Card */}
                {hasMore && (
                    <div
                        onClick={() => router.push('/play')}
                        className="flex-shrink-0 w-[280px] bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-750 transition-colors flex items-center justify-center border-2 border-dashed border-gray-600"
                    >
                        <div className="text-center p-8">
                            <p className="text-white font-medium mb-2">View More</p>
                            <p className="text-gray-400 text-sm">{allMatches.length - 5} more matches</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

