'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CalibrationChipProps {
    onDismiss?: () => void;
}

export function CalibrationChip({ onDismiss }: CalibrationChipProps) {
    const [isVisible, setIsVisible] = useState(true);
    const router = useRouter();

    const handleNavigate = () => {
        router.push('/play');
    };

    return (
        <div className="w-full px-4 pt-2 pb-2 z-10">
            <div className="rounded-full p-1 bg-[#0D1F1E] backdrop-blur-md border border-[#22C55E] shadow-lg">
                <div className="flex items-center justify-between px-2">
                    <Image src="/skeleton.png" alt="Calibration Icon" width={40} height={40} />
                    <div className="flex-col items-start justify-between gap-1">
                        <p className="flex-1 text-sm text-[#FFA726] font-medium leading-relaxed">
                            Your profile is not calibrated
                        </p>
                        <p className="flex-1 text-xs text-white font-medium leading-relaxed">
                            Play a match to calibrate
                        </p>
                    </div>
                    <button
                        onClick={handleNavigate}
                        className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <ChevronRight className="w-4 h-4 text-orange-100" />
                    </button>
                </div>
            </div>
        </div>
    );
}

