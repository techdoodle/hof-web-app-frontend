'use client';

import { forwardRef } from 'react';
import { ProfilePicture } from '../profile/ProfilePicture';
import { StatsTable } from '../profile/StatsTable';
import { UserData } from '@/modules/onboarding/types';
import { determineMainStats } from '@/lib/utils/determineMainStats';
import { cn } from '@/lib/utils/styles';
import { CalendarIcon } from 'lucide-react';

interface ShareableMatchCardProps {
    userData: UserData;
    matchStats: any;
    playerPosition: 'GK' | 'DEF' | 'FWD';
}

export const ShareableMatchCard = forwardRef<HTMLDivElement, ShareableMatchCardProps>(
    ({ userData, matchStats, playerPosition }, ref) => {

        const KEY_STATS = determineMainStats(playerPosition, matchStats);
        const keyStatsEntries = Object.entries(KEY_STATS);

        // Get match details
        const venue = matchStats?.match?.venue || 'Venue TBD';
        const city = matchStats?.match?.venue?.address || '';
        const matchDate = matchStats?.match?.startTime
            ? new Date(matchStats.match.startTime).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })
            : '';
        const matchTime = matchStats?.match?.startTime
            ? new Date(matchStats.match.startTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
            : '';

        const firstName = userData?.firstName || '';
        const lastName = userData?.lastName || '';

        return (
            <div
                ref={ref}
                className="shareable-card bg-[#0B1E19] w-full max-w-md mx-auto"
                style={{
                    minHeight: '550px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Main Content */}
                <div className="p-6 pb-24 space-y-4">
                    {/* Header Section with Profile and Key Stats */}
                    <div className="relative flex items-end justify-between gap-2">
                        {/* Left Key Stat */}
                        <div className="flex flex-col items-center">
                            <div className="mt-1 text-xl font-bold text-white font-orbitron">{playerPosition}</div>
                            {keyStatsEntries[0] && (
                                <div className="flex flex-col items-center">
                                    <div className="text-2xl text-[#FFA726] font-bold font-orbitron">
                                        {keyStatsEntries[0][1]}
                                    </div>
                                    <div className="text-sm text-[#FFA726] font-orbitron">
                                        {keyStatsEntries[0][0]}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <ProfilePicture
                                    key={`share-match-${userData.id}-${userData.profilePicture}`}
                                    size="md"
                                    imageUrl={userData.profilePicture || 'undefined'}
                                    userName={`${userData.firstName} ${userData.lastName}`}
                                />
                                {/* First Name - Positioned overlapping on top of photo with text shadow for visibility */}
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full flex flex-col items-center z-20 px-2">
                                    <div className={cn("text-3xl font-bold font-orbitron", !userData.profilePicture ? "text-yellow-500" : "text-white")} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9)' }}>
                                        {firstName}
                                    </div>
                                </div>
                            </div>
                            {/* Last Name - Positioned below photo */}
                            <div className="mt-2 flex flex-col items-center w-full">
                                <div className="text-3xl font-bold font-orbitron text-[#AAAAAA]">
                                    {lastName}
                                </div>
                            </div>
                        </div>

                        {/* Right Key Stat */}
                        <div className="flex flex-col items-center">
                            {keyStatsEntries[1] && (
                                <div className="flex flex-col items-center">
                                    <div className="text-2xl text-[#FFA726] font-bold font-orbitron">
                                        {keyStatsEntries[1][1]}
                                    </div>
                                    <div className="text-sm text-[#FFA726] font-orbitron">
                                        {keyStatsEntries[1][0]}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Table Section */}
                    <div className="stats-section">
                        <StatsTable
                            loading={false}
                            stats={matchStats}
                            screenName="matchStats"
                            playerPosition={playerPosition}
                        />
                    </div>
                </div>

                {/* Match Venue Info - Right above black strip */}
                <div className="absolute bottom-16 left-0 right-0 px-6">
                    <div className="text-white text-lg font-semibold">
                        {venue} {city && `• ${city}`}
                    </div>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <div className="text-gray-400 text-md">
                            {matchDate} {matchTime && `• ${matchTime}`}
                        </div>
                    </div>
                </div>

                {/* Black Strip at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-16 flex flex-col justify-between px-6 py-2 gap-2">
                    {/* Left: Logo and Text */}
                    <div className="flex items-center gap-2">
                        <img
                            src="/icons/hof-logo-color.svg"
                            alt="Humans of Football"
                            className="w-8 h-8"
                            onError={(e) => {
                                // Fallback if logo doesn't load
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                        <span className="text-white font-semibold text-md font-orbitron whitespace-nowrap">Humans of Football</span>
                    </div>

                    {/* Right: Join Us Link */}
                    <div className="flex items-center gap-2">
                        <div
                            className="text-[#00CC66] font-semibold text-sm hover:underline"
                        >
                            Join Us
                        </div>
                        <div className="text-white font-semibold text-sm">
                            app.humansoffootball.in
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

ShareableMatchCard.displayName = 'ShareableMatchCard';

