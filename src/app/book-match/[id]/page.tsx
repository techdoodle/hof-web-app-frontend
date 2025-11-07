"use client";

import { useParams, useRouter } from "next/navigation";
import { useMatchDetails } from "@/hooks/useMatchDetails";
import { BookingDetails } from '@/components/booking/BookingDetails';

const MatchDetailsPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { data: matchData, isLoading, error } = useMatchDetails(Number(id));

    const handleBack = () => {
        // Navigate back to match details page
        router.push(`/match-details/${id}`);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
            </div>
        );
    }

    if (error || !matchData) {
        return (
            <div className="flex min-h-screen items-center justify-center text-white">
                <div className="text-center">
                    <p className="text-red-500">Failed to load match details</p>
                    <button onClick={handleBack} className="text-blue-500 mt-4 block">
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-background text-foreground antialiased"
            style={{
                backgroundImage: 'url(/hof-background.svg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <BookingDetails
                matchId={Number(id)}
                matchData={matchData}
                onClose={handleBack}
            />
        </div>
    );
};

export default MatchDetailsPage;
