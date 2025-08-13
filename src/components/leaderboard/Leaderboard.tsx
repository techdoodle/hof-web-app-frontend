import { useLeaderBoard } from "@/hooks/useLeaderBoard";
import { LeaderboardItem } from "./LeaderBoardItem";
import { useUserData } from "@/hooks/useUserData";
import Image from "next/image";
import { Podium } from "./Podium";
import { useState, useEffect, useRef } from "react";
import { LeaderBoardFilters } from "./LeaderBoardFilters";

export function Leaderboard() {
    const [filters, setFilters] = useState({
        city: 'Gurugram'
    });

    const { leaderboard, isLeaderboardLoading, leaderboardError } = useLeaderBoard({ filters });
    const { userData, isLoading: isUserDataLoading } = useUserData();
    const [isUserVisible, setIsUserVisible] = useState(false);
    const userItemRef = useRef<HTMLDivElement>(null);

    const userRank = leaderboard?.find((item) => item.id === userData?.id)?.rank;
    const userItem = leaderboard?.find((item) => item.id === userData?.id);

    console.log("userRank", userData?.id, userRank);

    useEffect(() => {
        if (!userItemRef.current || !userItem) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsUserVisible(entry.isIntersecting);
            },
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
                rootMargin: '0px 0px -100px 0px' // Add some margin to trigger earlier
            }
        );

        observer.observe(userItemRef.current);

        return () => observer.disconnect();
    }, [userItem]);

    if (isLeaderboardLoading) {
        return <div>Loading...</div>;
    }

    const showBottomCard = userItem && !isUserVisible;

    return (
        <div className="flex flex-col gap-1 p-4">
            {/* <LeaderBoardFilters selectedCity={filters.city} setSelectedCity={(city) => setFilters({ ...filters, city })} /> */}
            {leaderboard && leaderboard.length === 0 && !isLeaderboardLoading && (
                <div className="text-center text-gray-400">No leaderboard data available</div>
            )}
            <Podium first={leaderboard?.[0]} second={leaderboard?.[1]} third={leaderboard?.[2]} />
            {leaderboard && leaderboard.slice(3).map((item) => (
                <div key={item.name} ref={item.id === userData?.id ? userItemRef : null}>
                    <LeaderboardItem
                        item={item}
                        isUser={item.id === userData?.id}
                        isVisible={isUserVisible}
                    />
                </div>
            ))}
            {showBottomCard && (
                <div className="fixed bottom-[125px] p-[1px] rounded-2xl bg-[#00CC6661] transition-all duration-500 ease-in-out">
                    <div className="text-center flex items-center gap-4 justify-center text-gray-400 p-1 bg-[#0B1E19] rounded-2xl">
                        <LeaderboardItem floating={true} item={userItem} isUser={true} isVisible={isUserVisible} />
                    </div>
                </div>
            )}
        </div>
    );
}