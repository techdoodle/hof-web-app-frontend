{
  /*
    
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

*/
}

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
    LEADERBOARD_FILTERS,
  } = useLeaderBoard(itemsPerPage);

  const { userData, isLoading: isUserDataLoading } = useUserData();
  const [isUserVisible, setIsUserVisible] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const userItemRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get userId safely
  const userId = userData?.id ?? null;

  // Track scroll position for parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        setScrollY(scrollContainerRef.current.scrollTop);
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollToUserItem = () => {
    if (userItemRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const item = userItemRef.current;
      const containerRect = container.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      const scrollTop =
        container.scrollTop +
        itemRect.top -
        containerRect.top -
        containerRect.height / 2 +
        itemRect.height / 2;

      container.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    }
  };

  // Only find user item if userId exists
  const userRank = userId
    ? leaderboard?.find((item: LeaderboardItemType) => item.id === userId)?.rank
    : null;
  const userItem = userId
    ? leaderboard?.find((item: LeaderboardItemType) => item.id === userId)
    : null;

  useEffect(() => {
    if (!userItemRef.current || !userItem) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isUserVisible) {
          setIsMerging(true);
          setTimeout(() => {
            setIsUserVisible(true);
            setIsMerging(false);
          }, 300);
        } else if (!entry.isIntersecting && isUserVisible) {
          setIsUserVisible(false);
        }
      },
      {
        threshold: 0.5,
        root: scrollContainerRef.current,
      }
    );

    observer.observe(userItemRef.current);
    return () => observer.disconnect();
  }, [userItem, isUserVisible]);

  // Show loading only for leaderboard data
  if (isLeaderboardLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col gap-4">
          <div className="text-center text-gray-400">Loading...</div>
          <div className="text-center text-gray-400">
            Please wait while we load the leaderboard...
          </div>
        </div>
      </div>
    );
  }

  if (leaderboardError) {
    return <ComingSoon />;
  }

  if (!leaderboard || leaderboard.length === 0) {
    return <ComingSoon />;
  }

  const showStickyCard = userItem && userRank && userRank > 3 && !isUserVisible;
  const parallaxOffset = scrollY * 0.5;

  return (
    <div className="relative h-[calc(100vh-180px)] overflow-hidden">
      {/* Fixed Background Layer with Parallax */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-60 left-1/2 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Sticky Header Section */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-900/80 backdrop-blur-md pb-4">
        <div className="px-4 pt-4">
          <LeaderBoardFilters
            filters={filters}
            filterData={LEADERBOARD_FILTERS}
            handleFilterClick={handleFilterClick}
          />
        </div>

        <div
          className="relative z-10 px-4 mt-4"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <Podium
            first={leaderboard[0]}
            second={leaderboard[1]}
            third={leaderboard[2]}
            currentUserId={userId}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-gray-900 pointer-events-none"></div>
      </div>

      {/* Scrollable List Container */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 h-full overflow-y-auto px-4 pt-6 pb-32 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        <InfiniteScrollTrigger
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          prefetchNextPage={prefetchNextPage}
        >
          <div className="space-y-3">
            {leaderboard.slice(3).map((item: LeaderboardItemType, index) => (
              <div
                key={`${item.id}-${index}`}
                ref={userId && item.id === userId ? userItemRef : null}
                className={`max-w-full transition-all duration-300 ease-in-out ${
                  userId && item.id === userId && isMerging ? "scale-105" : ""
                }`}
              >
                <LeaderboardItem
                  item={item}
                  isUser={userId ? item.id === userId : false}
                  isVisible={isUserVisible}
                />
              </div>
            ))}
          </div>
        </InfiniteScrollTrigger>
      </div>

      {/* Sticky Bottom Card */}
      {showStickyCard && (
        <div
          className="fixed left-0 right-0 bottom-[100px] z-30 px-4 animate-slide-up"
          onClick={scrollToUserItem}
        >
          <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl border-2 border-[#00CC66] shadow-[0_0_30px_rgba(0,204,102,0.3)] cursor-pointer hover:scale-[1.02] transition-transform">
            <LeaderboardItem
              floating={true}
              item={userItem}
              isUser={true}
              isVisible={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
