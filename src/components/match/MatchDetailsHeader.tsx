"use client";

import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const MatchDetailsHeader = ({ matchStats }: { matchStats: any }) => {
    const router = useRouter();

    return (<div className="flex flex-col gap-4">
        <div className="flex flex-row align-center justify-between">
            <div onClick={() => router.back()}><ChevronLeftIcon className="w-6 h-6" /></div>
            <div className="text-xl font-bold">Match Details</div>
            <div>
                {/* <Share2 className="w-6 h-6 text-gray-500" /> */}
            </div>
        </div>
    </div>);
};

export default MatchDetailsHeader;