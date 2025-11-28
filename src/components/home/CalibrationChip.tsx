'use client';

import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchCalibrationStatus } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export function CalibrationChip() {
    const router = useRouter();
    const { user } = useAuth();

    // Use cached data from React Query (same query key as home page)
    const { data: calibrationStatus } = useQuery({
        queryKey: ['calibration-status'],
        queryFn: fetchCalibrationStatus,
        staleTime: 5 * 60 * 60 * 1000, // 5 hours
    });

    const handleNavigate = () => {
        if (calibrationStatus?.isCalibrated && calibrationStatus?.isMinimumRequisiteCompleteForCalibration) {
            router.push('/leaderboard');
        } else {
            router.push('/play');
        }
    };

    // Determine text based on calibration status
    let titleText = 'Your profile is not calibrated';
    let subtitleText = 'Play a match to calibrate';

    if (calibrationStatus) {
        if (calibrationStatus.isCalibrated && !calibrationStatus.isMinimumRequisiteCompleteForCalibration) {
            titleText = 'Your stats are not calibrated';
            switch (user?.playerCategory?.toLowerCase()) {
                case 'goalkeeper':
                    subtitleText = 'Save a goal to level up';
                    break;
                case 'defender':
                    subtitleText = 'Make a tackle to level up';
                    break;
                case 'midfielder':
                    subtitleText = 'Make a key pass to level up';
                    break;
                case 'striker':
                    subtitleText = 'Score a goal to level up';
                    break;
                default:
                    subtitleText = 'Play a match to level up';
            }
        } else if (calibrationStatus.isCalibrated && calibrationStatus.isMinimumRequisiteCompleteForCalibration) {
            titleText = 'You are ranked #' + calibrationStatus.rank;
            subtitleText = 'in the Leaderboard, check it out!';
        }
    }

    return (
        <div className="w-full px-4 pt-2 pb-2 z-10">
            <div
                className="rounded-full p-1 bg-[#0D1F1E] cursor-pointer backdrop-blur-md border border-[#22C55E] shadow-lg"
                onClick={handleNavigate}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigate();
                    }
                }}
                role="button"
                tabIndex={0}
            >
                <div className="flex items-center justify-between pr-4 pl-8 gap-2">
                    <Image
                        src={user?.profilePicture ?? "/skeleton.png"}
                        alt="Calibration Icon"
                        width={40}
                        height={40}
                        className="pointer-events-none"
                    />
                    <div className="flex flex-col items-start justify-center gap-0 flex-1">
                        <p className="text-md text-[#FFA726] font-medium leading-relaxed">
                            {titleText}
                        </p>
                        {subtitleText && (
                            <p className="text-md text-white font-medium leading-relaxed">
                                {subtitleText}
                            </p>
                        )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-orange-100 flex-shrink-0 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}

