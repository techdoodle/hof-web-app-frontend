
'use client';

import Image from 'next/image';

interface PlayerStatCardProps {
    id: number;
    name: string;
    position: string;
    statVal: string;
    profilePicture: string;
    mvp: boolean;
}

export const PlayerStatCard = ({
    id,
    name,
    position,
    statVal,
    profilePicture,
    mvp
}: PlayerStatCardProps) => {
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
        <div className="flex flex-row justify-center items-center gap-4 b-#0D1F1E p-2 bg-[#0D1F1E] border-2 rounded-lg border-[#00CC66]">
            {/* Profile Picture with MVP indicator */}
            <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600">
                    {profilePicture && profilePicture !== 'url+here_pls' ? (
                        <Image
                            src={profilePicture}
                            alt={name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                            <span className="text-gray-400 text-xs font-semibold">
                                {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                        </div>
                    )}
                </div>

                {/* MVP Badge */}
                {mvp && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                        <span className="text-[#00CC66] text-md font-bold">MVP</span>
                    </div>
                )}
            </div>

            <div className='flex flex-col justify-center items-center gap-2'>
                {/* Position */}
                <div className={`text-lg font-bold font-rajdhani min-w-0`}>
                    {positionConfig.abbr}
                </div>

                {/* Stat Value */}
                <div className="text-md font-rajdhani text-bold text-center text-[#FFA726] leading-tight">
                    {statVal}
                </div>
            </div>
        </div>
    );
};
