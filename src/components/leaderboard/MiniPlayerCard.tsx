'use client';

import { useState, useEffect } from 'react';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import { StatsTable } from '@/components/profile/StatsTable';
import { ProfilePicture } from '../profile/ProfilePicture';
import { cn } from '@/lib/utils/styles';

interface MiniPlayerCardProps {
    playerId: number;
    playerName: string;
    playerProfilePicture: string | null;
    playerPosition?: string; // Optional position from leaderboard
}

export const MiniPlayerCard = ({
    playerId,
    playerName,
    playerProfilePicture,
    playerPosition: initialPosition
}: MiniPlayerCardProps) => {
    const [imageError, setImageError] = useState(false);
    const { playerStats, isPlayerStatsLoading } = usePlayerStats(playerId);

    // Reset image error state when player or profile picture changes
    useEffect(() => {
        setImageError(false);
    }, [playerId, playerProfilePicture]);

    // Determine player position from stats or initial position
    const getPlayerPosition = (): 'GK' | 'DEF' | 'FWD' => {
        // First try to get from stats if available
        if (playerStats?.playerCategory) {
            const category = playerStats.playerCategory.toUpperCase();
            if (category === 'GOALKEEPER' || category === 'GK') return 'GK';
            if (category === 'DEFENDER' || category === 'DEF') return 'DEF';
            if (category === 'FORWARD' || category === 'FWD' || category === 'STRIKER') return 'FWD';
        }
        // Fallback to initial position from leaderboard
        if (initialPosition) {
            const pos = initialPosition.toUpperCase();
            if (pos.includes('GOAL') || pos === 'GK') return 'GK';
            if (pos.includes('DEFEND') || pos === 'DEF') return 'DEF';
            if (pos.includes('STRIKER') || pos === 'FWD' || pos === 'ATK') return 'FWD';
        }
        return 'FWD'; // Default fallback
    };

    const playerPosition = getPlayerPosition();
    const firstName = playerName.split(' ')[0] || '';
    const lastName = playerName.split(' ').slice(1).join(' ') || '';

    // Get goals and assists from stats
    const goals = playerStats?.detailedStats?.impact?.totalGoals || 0;
    const assists = playerStats?.detailedStats?.impact?.totalAssists || 0;

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
        <div className="mini-player-card w-full space-y-4">
            {/* Header Section with Profile and Key Stats */}
            <div className="relative flex items-end justify-between gap-2">
                {/* Left Key Stat - Position and Goals */}
                <div className="flex flex-col items-center">
                    <div className="mt-1 text-xl font-bold text-white font-orbitron">{playerPosition}</div>
                    {isPlayerStatsLoading ? (
                        <StatSkeleton />
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="text-2xl text-[#FFA726] font-bold font-orbitron transition-all duration-300">
                                {goals}
                            </div>
                            <div className="text-sm text-[#FFA726] font-orbitron transition-all duration-300">
                                Goals
                            </div>
                        </div>
                    )}
                </div>

                <ProfilePicture
                    key={`${playerId}-${playerProfilePicture}`}
                    size="md"
                    imageUrl={playerProfilePicture || 'undefined'}
                    userName={playerName}
                />

                {/* Right Key Stat - Assists */}
                <div className="flex flex-col items-center">
                    {isPlayerStatsLoading ? (
                        <StatSkeleton />
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="text-2xl text-[#FFA726] font-bold font-orbitron transition-all duration-300">
                                {assists}
                            </div>
                            <div className="text-sm text-[#FFA726] font-orbitron transition-all duration-300">
                                Assists
                            </div>
                        </div>
                    )}
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
                {isPlayerStatsLoading ? (
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
                    loading={isPlayerStatsLoading}
                    stats={playerStats}
                    screenName="profileStats"
                    playerPosition={playerPosition}
                />
            </div>
        </div>
    );
};

