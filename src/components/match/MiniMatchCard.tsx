'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMatchStats } from '@/hooks/useMatchStats';
import { determineMainStats } from '@/lib/utils/determineMainStats';
import { StatsTable } from '@/components/profile/StatsTable';
import { UserData } from '@/modules/onboarding/types';
import { ProfilePicture } from '../profile/ProfilePicture';
import { cn } from '@/lib/utils/styles';

interface MiniMatchCardProps {
    playerId: number;
    playerName: string;
    playerProfilePicture: string | null;
    matchId: number;
    playerPosition: 'GK' | 'DEF' | 'FWD';
    mvp?: boolean;
}

export const MiniMatchCard = ({ playerId, playerName, playerProfilePicture, matchId, playerPosition, mvp = false }: MiniMatchCardProps) => {
    const [imageError, setImageError] = useState(false);
    const { matchStats, isMatchStatsLoading } = useMatchStats(playerId, matchId);

    // Reset image error state when player or profile picture changes
    useEffect(() => {
        setImageError(false);
    }, [playerId, playerProfilePicture]);

    // Get the key stats for the player position
    const keyStats = determineMainStats(playerPosition, matchStats);
    const keyStatsEntries = Object.entries(keyStats);

    const firstName = playerName.split(' ')[0] || '';
    const lastName = playerName.split(' ').slice(1).join(' ') || '';

    // Loading skeleton component with shimmer effect
    const StatSkeleton = () => (
        <div className="flex flex-col items-center">
            <div className="w-8 h-6 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-pulse rounded mb-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
            <div className="w-12 h-4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-pulse rounded relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>
        </div>
    );

    return (
        <div className="mini-match-card w-full space-y-4">
            {/* Header Section with Profile and Key Stats */}
            <div className="relative flex items-end justify-between gap-2">
                {/* Left Key Stat */}
                <div className="flex flex-col items-center">
                    <div className="mt-1 text-xl font-bold text-white font-orbitron">{playerPosition}</div>
                    {isMatchStatsLoading ? (
                        <StatSkeleton />
                    ) : keyStatsEntries[0] ? (
                        <div className="flex flex-col items-center">
                            <div className="text-2xl text-[#FFA726] font-bold font-orbitron transition-all duration-300">
                                {keyStatsEntries[0][1]}
                            </div>
                            <div className="text-sm text-[#FFA726] font-orbitron transition-all duration-300">
                                {keyStatsEntries[0][0]}
                            </div>
                        </div>
                    ) : null}
                </div>

                <ProfilePicture
                    key={`${playerId}-${playerProfilePicture}`}
                    size="md"
                    imageUrl={playerProfilePicture || 'undefined'}
                    userName={playerName}
                />

                {/* Right Key Stat */}
                <div className="flex flex-col items-center">
                    {mvp && <div className="mt-1 text-xl font-bold font-orbitron text-[#00CC66]">MVP</div>}
                    {isMatchStatsLoading ? (
                        <StatSkeleton />
                    ) : keyStatsEntries[1] ? (
                        <div className="flex flex-col items-center">
                            <div className="text-2xl text-[#FFA726] font-bold font-orbitron transition-all duration-300">
                                {keyStatsEntries[1][1]}
                            </div>
                            <div className="text-sm text-[#FFA726] font-orbitron transition-all duration-300">
                                {keyStatsEntries[1][0]}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
            <div className={"flex flex-col items-center w-full"} style={{
                marginTop: '-35px',
                position: 'relative',
                zIndex: 100,
                // iOS-specific fixes
                WebkitTransform: 'translateZ(0)',
                transform: 'translateZ(0)',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden'
            }}>
                {isMatchStatsLoading ? (
                    <div className="flex flex-col items-center space-y-2">
                        <div className="w-32 h-8 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-pulse rounded relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        </div>
                        <div className="w-28 h-8 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-pulse rounded relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={cn("text-3xl font-bold font-orbitron text-gradient-bg transition-all duration-300", !playerProfilePicture ? "text-yellow-500" : "text-white")}>{firstName}</div>
                        <div className={"text-3xl font-bold font-orbitron text-[#AAAAAA] text-gradient-bg transition-all duration-300"}> {lastName}</div>
                    </>
                )}
            </div>

            {/* Stats Table Section */}
            <div className="stats-section">
                <StatsTable
                    loading={isMatchStatsLoading}
                    stats={matchStats}
                    screenName="matchStats"
                    playerPosition={playerPosition}
                />
            </div>
        </div>
    );
};
