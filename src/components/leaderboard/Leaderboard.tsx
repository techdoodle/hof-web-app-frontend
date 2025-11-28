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
import { Table, TableColumn, PlayerAvatar, TruncatedText } from "../common/Table";

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
        resetFilters,
        LEADERBOARD_FILTERS,
    } = useLeaderBoard(itemsPerPage);

    const { userData, isLoading: isUserDataLoading } = useUserData();
    const [isUserVisible, setIsUserVisible] = useState(false);
    const [isMerging, setIsMerging] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);
    const userItemRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Get userId safely
    const userId = userData?.id ?? null;

    // Set scroll root for IntersectionObserver
    useEffect(() => {
        if (scrollContainerRef.current) {
            setScrollRoot(scrollContainerRef.current);
        }
    }, []);

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
                rootMargin: '0px 0px -100px 0px', // Add some margin to trigger earlier
                root: scrollContainerRef.current,
            }
        );

        observer.observe(userItemRef.current);

        return () => observer.disconnect();
    }, [userItem, isUserVisible]);

    const isOverall = (filters as any).leaderboard_type === 'overall' || !(filters as any).leaderboard_type;

    // Show loading skeletons for leaderboard data
    if (isLeaderboardLoading) {
        return (
            <div className="relative h-screen overflow-hidden max-w-md mx-auto">
                {/* Header skeleton with filters */}
                <div className="sticky top-0 z-20 backdrop-blur-md pb-4 bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-900/80">
                    <div className="px-4 pt-4">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="h-9 w-24 rounded-full bg-gray-800/80 border border-gray-700/60 animate-pulse"
                                />
                            ))}
                        </div>
                    </div>

                    {isOverall && (
                        <div className="px-4 mt-4">
                            <div className="h-40 rounded-2xl bg-gray-900/80 border border-gray-800 animate-pulse" />
                        </div>
                    )}
                </div>

                {/* Scrollable skeleton content */}
                <div className="relative z-10 h-[calc(100vh-200px)] overflow-y-auto px-4 pt-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {isOverall ? (
                        // Card-style skeletons for overall leaderboard
                        Array.from({ length: 6 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/70 border border-gray-800 animate-pulse"
                            >
                                <div className="w-8 h-6 rounded bg-gray-800" />
                                <div className="w-10 h-10 rounded-full bg-gray-800" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-32 rounded bg-gray-800" />
                                    <div className="h-3 w-20 rounded bg-gray-800" />
                                </div>
                                <div className="h-4 w-10 rounded bg-gray-800" />
                            </div>
                        ))
                    ) : (
                        // Table-style skeleton for non-overall types
                        <div className="w-full">
                            {/* Header skeleton */}
                            <div className="flex items-center bg-surface/50 rounded-t-xl p-3 border-b border-primary/20 animate-pulse">
                                <div className="flex-none w-12 h-4 rounded bg-gray-800 mr-2" />
                                <div className="flex-none h-4 w-28 rounded bg-gray-800 mr-4" />
                                <div className="flex-none h-4 w-24 rounded bg-gray-800" />
                            </div>
                            {/* Rows skeleton */}
                            <div className="bg-background/90 rounded-b-xl">
                                {Array.from({ length: 6 }).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center p-3 border-b border-surface/30 bg-gray-900/60 animate-pulse"
                                    >
                                        <div className="flex-none w-10 h-4 rounded bg-gray-800 mr-2" />
                                        <div className="flex-none w-40 h-4 rounded bg-gray-800 mr-4" />
                                        <div className="flex-none w-20 h-4 rounded bg-gray-800" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (leaderboardError) {
        return <ComingSoon />;
    }

    // Check if leaderboard is empty after loading
    const hasNoData = !isLeaderboardLoading && leaderboard && leaderboard.length === 0;

    const showBottomCard = isOverall && userItem && userRank && userRank > 3 && (!isUserVisible || isMerging);
    const parallaxOffset = scrollY * 0.5;

    // Table columns for non-overall types (generic)
    const tableColumns: TableColumn[] = [
        {
            key: "name",
            label: "Name",
            width: "180px",
            align: "left",
            sortable: true,
            render: (value: string, row: any) => (
                <div className="flex items-center gap-2 min-w-0 max-w-[180px]">
                    <PlayerAvatar src={row.imageUrl} name={value} size={28} />
                    <div className="min-w-0 flex-1">
                        <TruncatedText text={value} maxLength={15} />
                    </div>
                </div>
            ),
        },
        {
            key: "score",
            label:
                (filters as any).leaderboard_type === "gna"
                    ? "G+A"
                    : (filters as any).leaderboard_type === "appearances"
                        ? "Appearances"
                        : (filters as any).leaderboard_type === "shot_accuracy"
                            ? "Shot Acc %"
                            : (filters as any).leaderboard_type === "pass_accuracy"
                                ? "Pass Acc %"
                                : "Score",
            width: "100px",
            align: "left",
            sortable: true,
            render: (value: number, row: any) => (
                <span className="text-sm font-bold text-primary">
                    {Math.round(value ?? 0)}
                    {row.suffix && row.suffix !== "XP" ? ` ${row.suffix}` : ""}
                </span>
            ),
        },
    ];

    return (
        <div className="relative h-screen overflow-hidden">
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
            <div className="sticky top-0 z-20 backdrop-blur-md pb-4 overflow-visible">
                <div className="px-4 pt-4 relative z-30 overflow-visible">
                    <LeaderBoardFilters
                        filters={filters}
                        filterData={LEADERBOARD_FILTERS}
                        handleFilterClick={handleFilterClick}
                        resetFilters={resetFilters}
                    />
                </div>

                {isOverall && (
                    <div className="relative z-10 px-4 mt-4">
                        <Podium
                            first={leaderboard[0]}
                            second={leaderboard[1]}
                            third={leaderboard[2]}
                            currentUserId={userId}
                        />
                    </div>
                )}

                <div className={`absolute bottom-0 left-0 right-0 h-8 ${isOverall && leaderboard && leaderboard.length > 0 ? 'bg-gradient-to-b from-transparent to-gray-900' : ''} pointer-events-none`}></div>
            </div>

            {/* Scrollable List Container */}
            <div
                ref={scrollContainerRef}
                className={`relative z-10 ${isOverall ? 'h-[calc(100vh-450px)]' : 'h-[calc(100vh-0px)]'} overflow-y-auto px-2 pt-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent`}
            >
                {hasNoData ? (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="text-center text-gray-400 mb-4">
                            <p className="text-lg font-medium mb-2">No players yet for the filters</p>
                            <p className="text-sm text-gray-500">Try adjusting your filter selections</p>
                            <button className="bg-green-500 text-white mt-2 px-2 py-1 rounded-md" onClick={() => {
                                resetFilters();
                            }}>Reset Filters</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {isOverall ? (
                            <InfiniteScrollTrigger
                                hasNextPage={hasNextPage}
                                isFetchingNextPage={isFetchingNextPage}
                                fetchNextPage={fetchNextPage}
                                prefetchNextPage={prefetchNextPage}
                            >
                                <div className={`space-y-3 ${showBottomCard ? "pb-32" : "pb-0"}`}>
                                    {leaderboard.slice(3).map((item: LeaderboardItemType, index) => (
                                        <div
                                            key={`${item.id}-${index}`}
                                            ref={userId && item.id === userId ? userItemRef : null}
                                            className={`max-w-full transition-all duration-300 ease-in-out ${userId && item.id === userId && isMerging ? "scale-105" : ""
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
                        ) : (
                            <InfiniteScrollTrigger
                                hasNextPage={hasNextPage}
                                isFetchingNextPage={isFetchingNextPage}
                                fetchNextPage={fetchNextPage}
                                prefetchNextPage={prefetchNextPage}
                            >
                                <Table
                                    data={leaderboard || []}
                                    columns={tableColumns}
                                    currentUserId={userId || undefined}
                                    showRank={true}
                                    className="w-full mt-2"
                                />
                            </InfiniteScrollTrigger>
                        )}
                    </>
                )}
            </div>

            {/* Sticky Bottom Card */}
            {showBottomCard && (
                <div
                    className={`fixed left-1/2 bg-black transform -translate-x-1/2 p-[1px] rounded-2xl transition-all duration-300 ease-in-out cursor-pointer hover:scale-105 z-30 
                        ${isMerging
                            ? 'opacity-0 scale-95 bottom-[50vh]'
                            : 'opacity-100 scale-100 bottom-[125px]'
                        }`}
                    onClick={scrollToUserItem}
                >
                    <LeaderboardItem
                        floating={true}
                        item={userItem}
                        isUser={true}
                        isVisible={isUserVisible}
                        isBottomCard={true}
                    />
                </div>
            )}
        </div>
    );
}
