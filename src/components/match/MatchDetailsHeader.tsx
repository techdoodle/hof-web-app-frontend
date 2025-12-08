"use client";

import { ChevronLeftIcon, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface MatchDetailsHeaderProps {
    matchStats: any;
    onShareClick?: () => void;
}

const MatchDetailsHeader = ({ matchStats, onShareClick }: MatchDetailsHeaderProps) => {
    const router = useRouter();

    return (<div className="flex flex-col gap-4">
        <div className="flex flex-row align-center justify-between">
            <div onClick={() => router.back()}><ChevronLeftIcon className="w-6 h-6" /></div>
            <div className="text-xl font-bold">Match Details</div>
            <div>
                {onShareClick && (
                    <button
                        onClick={onShareClick}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                        title="Share match stats"
                    >
                        <Share2 className="w-6 h-6 text-white" />
                    </button>
                )}
            </div>
        </div>
    </div>);
};

export default MatchDetailsHeader;