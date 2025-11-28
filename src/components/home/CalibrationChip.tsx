'use client';

import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CalibrationChip() {
    const router = useRouter();

    const handleNavigate = () => {
        router.push('/play');
    };

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
                <div className="flex items-center justify-between px-2 gap-2">
                    <Image
                        src="/skeleton.png"
                        alt="Calibration Icon"
                        width={40}
                        height={40}
                        className="pointer-events-none"
                    />
                    <div className="flex flex-col items-start justify-center gap-0 flex-1">
                        <p className="text-sm text-[#FFA726] font-medium leading-relaxed">
                            Your profile is not calibrated
                        </p>
                        <p className="text-xs text-white font-medium leading-relaxed">
                            Play a match to calibrate
                        </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-orange-100 flex-shrink-0 pointer-events-none" />
                </div>
            </div>
        </div>
    );
}

