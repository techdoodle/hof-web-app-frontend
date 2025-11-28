import { useLeaderBoard } from "@/hooks/useLeaderBoard";
import { LeaderboardItem } from "./LeaderBoardItem";
import { useUserData } from "@/hooks/useUserData";
import { Podium } from "./Podium";
import { useState, useEffect, useRef } from "react";
import { LeaderBoardFilters } from "./LeaderBoardFilters";
import { ComingSoon } from "../common/ComingSoon";
import { InfiniteScrollTrigger } from "../common/InfiniteScrollTrigger";
import { LeaderboardPlayer } from "@/types/leaderboard";
import { useRouter } from "next/navigation";

type AppearancesLeaderboardItemType = {
    id: number;
    rank: number;
    name: string;
    score: number; // Will be appearances count
    suffix: string;
    imageUrl: string;
    appearances: number;
};

export function AppearancesLeaderboard() {
    const itemsPerPage = 50;
    const router = useRouter();

    const {
        leaderboard: gnaLeaderboard,
        pagination,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLeaderboardLoading,
        leaderboardError,
        prefetchNextPage,
        filters: originalFilters,
        handleFilterClick: originalHandleFilterClick,
        resetFilters,
        LEADERBOARD_FILTERS
    } = useLeaderBoard(itemsPerPage); // Use GNA data to extract appearances

    // Override filters to show 'appearances' as selected in UI
    const filters = { ...originalFilters, type: 'appearances' };

    // Custom handleFilterClick to properly handle type changes
    const handleFilterClick = (filterType: 'city' | 'position' | 'gender' | 'leaderboard_type', value: string) => {
        if (filterType === "leaderboard_type") {
            // For type changes, navigate to the appropriate leaderboard page using Next.js router
            const params = new URLSearchParams();
            if (value !== 'overall') {
                params.set('tab', value);
            }
            const newUrl = params.toString() ? `/leaderboard?${params.toString()}` : '/leaderboard';
            router.push(newUrl);
        } else {
            // For other filters (like city), use the original handler
            originalHandleFilterClick(filterType, value);
        }
    };

    const { userData, isLoading: isUserDataLoading } = useUserData();
    const [isUserVisible, setIsUserVisible] = useState(false);
    const [isMerging, setIsMerging] = useState(false);
    const userItemRef = useRef<HTMLDivElement>(null);
    console.log("gnaLeaderboard", gnaLeaderboard);
    // Transform GNA leaderboard data to appearances format
    const appearancesLeaderboard: AppearancesLeaderboardItemType[] = gnaLeaderboard
        ? gnaLeaderboard
            .map((player: LeaderboardPlayer) => ({
                id: player.id,
                rank: 0, // Will be set after sorting
                name: player.name,
                score: player.appearances || 0,
                suffix: '',
                imageUrl: player.imageUrl,
                appearances: player.appearances || 0
            }))
            .sort((a, b) => b.score - a.score) // Sort by appearances desc
            .map((player, index) => ({
                ...player,
                rank: index + 1
            }))
        : [];

    const scrollToUserItem = () => {
        if (userItemRef.current) {
            userItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }
    };

    const userRank = appearancesLeaderboard?.find((item: AppearancesLeaderboardItemType) => item.id === userData?.id)?.rank;
    const userItem = appearancesLeaderboard?.find((item: AppearancesLeaderboardItemType) => item.id === userData?.id);

    console.log("appearancesLeaderboard", appearancesLeaderboard, "userRank", userRank);

    useEffect(() => {
        if (!userItemRef.current || !userItem) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                console.log('User item intersection:', entry.isIntersecting, 'showBottomCard will be:', userItem && !entry.isIntersecting);

                if (entry.isIntersecting && !isUserVisible) {
                    // User item is becoming visible - start merge animation
                    setIsMerging(true);
                    setTimeout(() => {
                        setIsUserVisible(true);
                        setIsMerging(false);
                    }, 300); // Match this with CSS transition duration
                } else if (!entry.isIntersecting && isUserVisible) {
                    // User item is becoming hidden - show bottom card
                    setIsUserVisible(false);
                }
            },
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
                rootMargin: '0px 0px -100px 0px' // Add some margin to trigger earlier
            }
        );

        observer.observe(userItemRef.current);

        return () => observer.disconnect();
    }, [userItem, isUserVisible]);

    if (isLeaderboardLoading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col gap-4">
                <div className="text-center text-gray-400">Loading...</div>
                <div className="text-center text-gray-400">Please wait while we load the appearances leaderboard...</div>
            </div>
        </div>;
    }

    const showBottomCard = userItem && userRank && userRank > 3 && (!isUserVisible || isMerging);

    if (leaderboardError) {
        return <ComingSoon />
    }

    if (!isLeaderboardLoading && (!appearancesLeaderboard || appearancesLeaderboard.length === 0)) {
        return <ComingSoon />
    }

    return (
        <div className="flex flex-col gap-1 p-4">
            <LeaderBoardFilters filterData={LEADERBOARD_FILTERS} filters={filters} handleFilterClick={handleFilterClick} resetFilters={resetFilters} />
            {appearancesLeaderboard && appearancesLeaderboard.length === 0 && !isLeaderboardLoading && (
                <div className="text-center text-gray-400">No appearances data available</div>
            )}
            <Podium first={appearancesLeaderboard?.[0]} second={appearancesLeaderboard?.[1]} third={appearancesLeaderboard?.[2]} />

            <InfiniteScrollTrigger
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                prefetchNextPage={prefetchNextPage}
            >
                {appearancesLeaderboard && appearancesLeaderboard.slice(3).map((item: AppearancesLeaderboardItemType, index) => (
                    <div
                        key={`${item.id}-${index}`}
                        ref={item.id === userData?.id ? userItemRef : null}
                        className={`max-w-full transition-all duration-300 ease-in-out ${item.id === userData?.id && isMerging ? 'scale-105 shadow-lg' : ''
                            }`}
                    >
                        <LeaderboardItem
                            item={item}
                            isUser={item.id === userData?.id}
                            isVisible={isUserVisible}
                        />
                    </div>
                ))}
            </InfiniteScrollTrigger>

            {showBottomCard && (
                <div
                    className={`fixed left-1/2 transform -translate-x-1/2 p-[1px] rounded-2xl transition-all duration-300 ease-in-out cursor-pointer hover:scale-105 ${isMerging
                        ? 'opacity-0 scale-95 bottom-[50vh]'
                        : 'opacity-100 scale-100 bottom-[125px]'
                        }`}
                    onClick={scrollToUserItem}
                >
                    <LeaderboardItem floating={true} item={userItem} isUser={true} isVisible={isUserVisible} />
                </div>
            )}
        </div>
    );
}
