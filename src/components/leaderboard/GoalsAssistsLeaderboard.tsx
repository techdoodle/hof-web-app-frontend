import { useLeaderBoard } from "@/hooks/useLeaderBoard";
import { useUserData } from "@/hooks/useUserData";
import { useState, useEffect, useRef } from "react";
import { LeaderBoardFilters } from "./LeaderBoardFilters";
import { ComingSoon } from "../common/ComingSoon";
import { InfiniteScrollTrigger } from "../common/InfiniteScrollTrigger";
import { Table, TableColumn, PlayerAvatar, TruncatedText } from "../common/Table";
import { LeaderboardPlayer } from "@/types/leaderboard";

export function GoalsAssistsLeaderboard() {
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
        LEADERBOARD_FILTERS
    } = useLeaderBoard(itemsPerPage); // Force G+A type

    console.log("G+A leaderboard", leaderboard, "pagination:", pagination, "error:", leaderboardError, "loading:", isLeaderboardLoading, "hasNextPage:", hasNextPage);
    const { userData, isLoading: isUserDataLoading } = useUserData();
    const [isUserVisible, setIsUserVisible] = useState(false);
    const userItemRef = useRef<HTMLDivElement>(null);

    const userRank = leaderboard?.find((item: LeaderboardPlayer) => item.id === userData?.id)?.rank;
    const userItem = leaderboard?.find((item: LeaderboardPlayer) => item.id === userData?.id);

    // Define table columns for the G+A leaderboard (Name | Appearances | Goals | Assists | G+A)
    const tableColumns: TableColumn[] = [
        {
            key: 'name',
            label: 'Name',
            width: '180px',
            align: 'left',
            sortable: true,
            render: (value: string, row: LeaderboardPlayer) => (
                <div className="flex items-center gap-2 min-w-0 max-w-[180px]">
                    <PlayerAvatar src={row.imageUrl} name={value} size={28} />
                    <div className="min-w-0 flex-1">
                        <TruncatedText text={value} maxLength={15} />
                    </div>
                </div>
            )
        },
        {
            key: 'goalsAssists',
            label: 'G+A',
            width: '80px',
            align: 'left',
            sortable: true,
            render: (value: any, row: LeaderboardPlayer) => (
                <span className="text-sm font-bold text-primary">
                    {(row.goals || 0) + (row.assists || 0)}
                </span>
            )
        },
        {
            key: 'appearances',
            label: 'Appearances',
            width: '100px',
            align: 'left',
            sortable: true,
            render: (value: number) => (
                <span className="text-sm font-medium text-foreground">{value || 0}</span>
            )
        },
        {
            key: 'goals',
            label: 'Goals',
            width: '80px',
            align: 'left',
            sortable: true,
            render: (value: number) => (
                <span className="text-sm font-medium text-foreground">{value || 0}</span>
            )
        },
        {
            key: 'assists',
            label: 'Assists',
            width: '80px',
            align: 'left',
            sortable: true,
            render: (value: number) => (
                <span className="text-sm font-medium text-foreground">{value || 0}</span>
            )
        }
    ];

    useEffect(() => {
        if (!userItemRef.current || !userItem) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsUserVisible(entry.isIntersecting);
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            }
        );

        observer.observe(userItemRef.current);

        return () => observer.disconnect();
    }, [userItem]);

    if (isLeaderboardLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col gap-4">
                    <div className="text-center text-gray-400">Loading...</div>
                    <div className="text-center text-gray-400">Please wait while we load the Goals + Assists leaderboard...</div>
                </div>
            </div>
        );
    }

    if (leaderboardError) {
        return <ComingSoon />
    }

    if (!isLeaderboardLoading && (!leaderboard || leaderboard.length === 0)) {
        return <ComingSoon />
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <LeaderBoardFilters
                filterData={LEADERBOARD_FILTERS}
                filters={filters}
                handleFilterClick={handleFilterClick}
                resetFilters={resetFilters}
            />

            {leaderboard && leaderboard.length === 0 && !isLeaderboardLoading && (
                <div className="text-center text-gray-400">No leaderboard data available</div>
            )}

            {/* No Podium - directly show table */}
            <InfiniteScrollTrigger
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
                prefetchNextPage={prefetchNextPage}
            >
                <div
                    className="mt-2"
                    ref={userItem && leaderboard?.some(item => item.id === userData?.id) ? userItemRef : null}
                >
                    <Table
                        data={leaderboard || []}
                        columns={tableColumns}
                        currentUserId={userData?.id}
                        showRank={true}
                        className="w-full"
                    />
                </div>
            </InfiniteScrollTrigger>
        </div>
    );
}
