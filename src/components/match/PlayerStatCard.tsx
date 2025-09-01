
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface PlayerStatCardProps {
    id: number;
    name: string;
    position: string;
    statVal: string;
    profilePicture: string | null;
    mvp: boolean;
    onClick?: () => void;
}

export const PlayerStatCard = ({
    id,
    name,
    position,
    statVal,
    profilePicture,
    mvp,
    onClick
}: PlayerStatCardProps) => {
    const [imageError, setImageError] = useState(false);

    // Function to get position abbreviation and color
    const getPositionConfig = (pos: string) => {
        const upperPos = pos.toUpperCase();
        if (upperPos.includes('DEFEND') || upperPos === 'DEF') {
            return { abbr: 'DEF', color: 'text-blue-400' };
        }
        if (upperPos.includes('FORWARD') || upperPos === 'FWD' || upperPos.includes('STRIKER')) {
            return { abbr: 'FWD', color: 'text-red-400' };
        }
        if (upperPos.includes('GOAL') || upperPos === 'GK') {
            return { abbr: 'GK', color: 'text-yellow-400' };
        }
        return { abbr: pos.slice(0, 3).toUpperCase(), color: 'text-gray-400' };
    };

    const positionConfig = getPositionConfig(position);

    return (
        <div
            className="flex flex-row justify-center items-center gap-4 b-#0D1F1E px-4 py-1 bg-[#0D1F1E] border-2 rounded-3xl border-[#00CC66] backdrop-blur-[30px] cursor-pointer hover:bg-[#1a2e2c] transition-colors duration-200"
            onClick={onClick}
        >
            {/* Profile Picture with MVP indicator */}
            <div className="relative h-full flex items-center justify-center">
                <div className="w-16 h-16 relative overflow-hidden rounded-full">
                    {profilePicture && profilePicture !== '' && !imageError ? (
                        <>
                            <Image
                                src={profilePicture}
                                alt={name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover rounded-full"
                                onError={() => setImageError(true)}
                            />
                            {/* Gradient overlay for bottom fade */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none rounded-full"
                                style={{
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0) 30%, transparent 100%)'
                                }}>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center rounded-full">
                                <span className="text-gray-400 text-lg font-semibold">
                                    {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </span>
                            </div>
                            {/* Gradient overlay for fallback as well */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none rounded-full"
                                style={{
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 15%, rgba(0,0,0,0) 30%, transparent 100%)'
                                }}>
                            </div>
                        </>
                    )}
                </div>

                {/* MVP Badge */}
                {mvp && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black-900">
                        <span className="text-[#00CC66] text-md font-bold">MVP</span>
                    </div>
                )}
            </div>

            <div className='flex flex-col justify-start items-start gap-0'>
                {/* Position */}
                <div className={`text-lg font-bold font-rajdhani min-w-0`}>
                    {positionConfig.abbr}
                </div>

                {/* Stat Value */}
                <div className="text-md font-rajdhani text-bold text-center text-[#FFA726] leading-tight whitespace-nowrap">
                    {statVal}
                </div>
            </div>
        </div>
    );
};
