'use client';

import { useState } from 'react';
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

    // Get the key stats for the player position
    const keyStats = determineMainStats(playerPosition, matchStats);
    const keyStatsEntries = Object.entries(keyStats);

    const firstName = playerName.split(' ')[0] || '';
    const lastName = playerName.split(' ').slice(1).join(' ') || '';

    return (
        <div className="mini-match-card w-full space-y-6">
            {/* Header Section with Profile and Key Stats */}
            <div className="relative flex items-center justify-between">
                {/* Left Key Stat */}
                <div>
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
                    <div className="mt-1 text-xl font-bold text-white font-orbitron">{playerPosition}</div>
                </div>

                <ProfilePicture size="md" imageUrl={playerProfilePicture || 'undefined'} userName={playerName} />

                {/* Right Key Stat */}
                <div>
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
                    {mvp && <div className="mt-1 text-xl font-bold font-orbitron text-[#00CC66]">MVP</div>}
                </div>
            </div>
            <div className={"flex flex-col items-center w-full"} style={{
                marginTop: '-35px',
                position: 'relative',
                zIndex: 100,
            }}>
                <div className={cn("text-4xl font-bold font-orbitron text-gradient-bg", !playerProfilePicture ? "text-yellow-500" : "text-white")}>{firstName}</div>
                <div className={"text-4xl font-bold font-orbitron text-[#AAAAAA] text-gradient-bg"}> {lastName}</div>
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
