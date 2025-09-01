'use client';

import { HorizontalScroll } from '@/components/common/HorizontalScroll';
import { PlayerStatCardWithDrawer } from './PlayerStatCardWithDrawer';
import { UserData } from '@/modules/onboarding/types';

interface PlayerStat {
    id: number;
    firstName: string;
    lastName: string;
    position: string;
    statVal: string;
    profilePicture: string | null;
    mvp: boolean;
}

interface TeamStatsProps {
    stats: PlayerStat[];
    team: string;
    userData?: UserData;
    matchId?: number;
    onDrawerOpen?: () => void;
    onDrawerClose?: () => void;
}

export const TeamStats = ({ stats, team, userData, matchId, onDrawerOpen, onDrawerClose }: TeamStatsProps) => {
    return (
        <div className="flex flex-col gap-4">
            {/* Team Header */}
            <div className="flex items-center justify-between">
                <div className="text-xl font-rajdhani font-bold text-white">
                    {team}
                </div>
                <div className="text-sm font-rajdhani text-gray-400">
                    {stats.length} players
                </div>
            </div>

            {/* Horizontal Scrollable Player List */}
            <HorizontalScroll
                className="w-full"
                itemClassName="px-4 py-2"
                showGradient={true}
            >
                {stats.map((player) => (
                    <PlayerStatCardWithDrawer
                        key={player.id}
                        player={player}
                        userData={userData}
                        matchId={matchId}
                        onDrawerOpen={onDrawerOpen}
                        onDrawerClose={onDrawerClose}
                    />
                ))}
            </HorizontalScroll>
        </div>
    );
};