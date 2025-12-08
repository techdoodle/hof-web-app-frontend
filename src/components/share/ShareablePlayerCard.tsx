'use client';

import { forwardRef } from 'react';
import { ProfilePicture } from '../profile/ProfilePicture';
import { StatsTable } from '../profile/StatsTable';
import { UserData } from '@/modules/onboarding/types';
import NameComponent from '../profile/NameComponent';

interface ShareablePlayerCardProps {
    userData: UserData;
    stats: any;
    playerPosition: 'GK' | 'DEF' | 'FWD' | undefined;
}

export const ShareablePlayerCard = forwardRef<HTMLDivElement, ShareablePlayerCardProps>(
    ({ userData, stats, playerPosition }, ref) => {

        const goals = stats?.detailedStats?.impact?.totalGoals || 0;
        const assists = stats?.detailedStats?.impact?.totalAssists || 0;

        return (
            <div
                ref={ref}
                className="shareable-card bg-[#0B1E19] w-full max-w-md mx-auto"
                style={{
                    minHeight: '500px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Main Content */}
                <div className="p-6 pb-2 space-y-2">
                    {/* Header Section with Profile and Key Stats */}
                    <div className="relative flex items-end justify-between gap-2">
                        {/* Left Key Stat - Position and Goals */}
                        <div className="flex flex-col items-center">
                            <div className="mt-1 text-xl font-bold text-white font-orbitron">{playerPosition || 'FWD'}</div>
                            <div className="flex flex-col items-center">
                                <div className="text-2xl text-[#FFA726] font-bold font-orbitron">
                                    {goals}
                                </div>
                                <div className="text-sm text-[#FFA726] font-orbitron">
                                    Goals
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <ProfilePicture
                                    key={`share-${userData.id}-${userData.profilePicture}`}
                                    size="md"
                                    imageUrl={userData.profilePicture || 'undefined'}
                                    userName={`${userData.firstName} ${userData.lastName}`}
                                />
                                {/* First Name - Positioned overlapping on top of photo with text shadow for visibility */}
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full flex flex-col items-center z-20 px-2">
                                    <div className="text-3xl font-bold font-orbitron text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9)' }}>
                                        {userData.firstName}
                                    </div>
                                </div>
                            </div>
                            {/* Last Name - Positioned below photo */}
                            <div className="mt-2 flex flex-col items-center w-full">
                                <div className="text-3xl font-bold font-orbitron text-[#AAAAAA]">
                                    {userData.lastName}
                                </div>
                            </div>
                        </div>

                        {/* Right Key Stat - Assists */}
                        <div className="flex flex-col items-center">
                            <div className="flex flex-col items-center">
                                <div className="text-2xl text-[#FFA726] font-bold font-orbitron">
                                    {assists}
                                </div>
                                <div className="text-sm text-[#FFA726] font-orbitron">
                                    Assists
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Table Section */}
                    <div className="stats-section">
                        <StatsTable
                            loading={false}
                            stats={stats}
                            screenName="profileStats"
                            playerPosition={playerPosition}
                        />
                    </div>
                </div>

                {/* Black Strip at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-between px-6 gap-0" data-footer="true">
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
                        <div className="text-white font-semibold text-sm text-right">
                            app.humansoffootball.in
                        </div>
                    </div>

                    {/* <div className="flex items-center gap-2">
                        <div
                            className="text-[#00CC66] font-semibold text-sm"
                        >
                            Join Us
                        </div>
                        <div className="text-white font-semibold text-sm">
                            app.humansoffootball.in
                        </div>
                    </div> */}
                </div>
            </div>
        );
    }
);

ShareablePlayerCard.displayName = 'ShareablePlayerCard';

