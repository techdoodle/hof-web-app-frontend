import { useLeaderBoard } from "@/hooks/useLeaderBoard";
import { LeaderboardItem } from "./LeaderBoardItem";
import { useUserData } from "@/hooks/useUserData";
import { Podium } from "./Podium";
import { useState, useEffect, useRef } from "react";
import { LeaderBoardFilters } from "./LeaderBoardFilters";
import { ComingSoon } from "../common/ComingSoon";
import { InfiniteScrollTrigger } from "../common/InfiniteScrollTrigger";

type LeaderboardItemType = {
    id: number;
    rank: number;
    name: string;
    score: number;
    suffix: string;
    imageUrl: string;
};

export function Leaderboard() {
    const itemsPerPage = 50;

    const {
        leaderboard,
        pagination,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLeaderboardLoading,
        leaderboardError,
        prefetchNextPage,
        filters,
        handleFilterClick,
        LEADERBOARD_CUMULATIVE_FILTERS
    } = useLeaderBoard(itemsPerPage);
    console.log("leaderboardui", leaderboard, "pagination:", pagination, "error:", leaderboardError, "loading:", isLeaderboardLoading, "hasNextPage:", hasNextPage);
    const { userData, isLoading: isUserDataLoading } = useUserData();
    const [isUserVisible, setIsUserVisible] = useState(false);
    const [isMerging, setIsMerging] = useState(false);
    const userItemRef = useRef<HTMLDivElement>(null);

    const scrollToUserItem = () => {
        if (userItemRef.current) {
            userItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }
    };

    const userRank = leaderboard?.find((item: LeaderboardItemType) => item.id === userData?.id)?.rank;
    const userItem = leaderboard?.find((item: LeaderboardItemType) => item.id === userData?.id);

    console.log("userRank", userData?.id, userRank);

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
                <div className="text-center text-gray-400">Please wait while we load the leaderboard...</div>
            </div>
        </div>;
    }

    const showBottomCard = userItem && userRank && userRank > 3 && (!isUserVisible || isMerging);

    if (leaderboardError) {
        return <ComingSoon />
    }

    if (!isLeaderboardLoading && (!leaderboard || leaderboard.length === 0)) {
        return <ComingSoon />
    }

    return (
        <div className="flex flex-col gap-1 p-4">
            <LeaderBoardFilters filter_data={LEADERBOARD_CUMULATIVE_FILTERS} filters={filters} handleFilterClick={handleFilterClick} />
            {leaderboard && leaderboard.length === 0 && !isLeaderboardLoading && (
                <div className="text-center text-gray-400">No leaderboard data available</div>
            )}
            <Podium first={leaderboard?.[0]} second={leaderboard?.[1]} third={leaderboard?.[2]} />

            <InfiniteScrollTrigger
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                prefetchNextPage={prefetchNextPage}
            >
                {leaderboard && leaderboard.slice(3).map((item: LeaderboardItemType, index) => (
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