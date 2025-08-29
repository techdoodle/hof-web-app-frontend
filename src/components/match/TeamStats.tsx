'use client';

import { HorizontalScroll } from '@/components/common/HorizontalScroll';
import { PlayerStatCard } from './PlayerStatCard';

interface PlayerStat {
    id: number;
    name: string;
    position: string;
    statVal: string;
    profilePicture: string;
    mvp: boolean;
}

interface TeamStatsProps {
    stats: PlayerStat[];
    team: string;
}

export const TeamStats = ({ stats, team }: TeamStatsProps) => {
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
                    <PlayerStatCard
                        key={player.id}
                        id={player.id}
                        name={player.name}
                        position={player.position}
                        statVal={player.statVal}
                        profilePicture={player.profilePicture}
                        mvp={player.mvp}
                    />
                ))}
            </HorizontalScroll>
        </div>
    );
};