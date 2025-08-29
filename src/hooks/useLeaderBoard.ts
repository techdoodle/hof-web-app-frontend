import { fetchLeaderBoard } from "@/lib/api";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const LEADERBOARD_QUERY_KEY = 'leaderboard';
const LEADERBOARD_STALE_TIME = 60 * 60 * 1000; // 5 minutes

const LEADERBOARD_TYPES = {
    'Overall': 'overall',
    'G+A': 'g+a',
}

const LEADERBOARD_CITIES = {
    'INDIA': 'India',
    'GURUGRAM': 'Gurugram',
    'DELHI': 'Delhi',
    'MUMBAI': 'Mumbai',
    'CHENNAI': 'Chennai',
}

const LEADERBOARD_CUMULATIVE_FILTERS = {
    'leaderboard_types': LEADERBOARD_TYPES,
    'leaderboard_cities': LEADERBOARD_CITIES,
}

const defaultFilters = {
    city: 'India',
    type: 'overall',
    limit: 50
};

export const useLeaderBoard = (limit: number = 20) => {
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState(defaultFilters);

    const handleFilterClick = (key: string, value: string) => {
        console.log("handleFilterClick", key, value);
        if (key === "type") {
            setFilters({ ...filters, type: value });
        } else if (key === "city") {
            setFilters({ ...filters, city: value, type: 'overall' });
        } else return;
    }

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch
    } = useInfiniteQuery({
        queryKey: [LEADERBOARD_QUERY_KEY, limit, filters],
        queryFn: ({ pageParam = 1 }) => fetchLeaderBoard(pageParam, limit, filters),
        getNextPageParam: (lastPage) => {
            // Handle both old format (direct array) and new format (with pagination)
            if (Array.isArray(lastPage)) {
                // Old format - if we got a full page, there might be more
                return lastPage.length === limit ? 2 : undefined;
            } else if (lastPage?.pagination?.hasNextPage) {
                // New format with pagination
                return lastPage.pagination.currentPage + 1;
            }
            return undefined;
        },
        staleTime: LEADERBOARD_STALE_TIME,
        refetchOnWindowFocus: false,
        initialPageParam: 1,
    });

    // Prefetch next page when user is near the end
    const prefetchNextPage = () => {
        if (hasNextPage && !isFetchingNextPage && data?.pages) {
            const lastPage = data.pages[data.pages.length - 1];
            let nextPage = 2;

            if (Array.isArray(lastPage)) {
                // Old format - assume we're on page 1, next is page 2
                nextPage = 2;
            } else if (lastPage?.pagination?.currentPage) {
                // New format with pagination
                nextPage = lastPage.pagination.currentPage + 1;
            }

            queryClient.prefetchQuery({
                queryKey: [LEADERBOARD_QUERY_KEY, limit, nextPage],
                queryFn: () => fetchLeaderBoard(nextPage, limit, filters),
                staleTime: LEADERBOARD_STALE_TIME,
            });
        }
    };

    // Flatten all pages into a single array
    // Check if the page structure has 'data' property or if it's a direct array
    const leaderboard = data?.pages?.flatMap(page => {
        if (Array.isArray(page)) {
            // If page is directly an array (old format)
            return page;
        } else if (page?.data && Array.isArray(page.data)) {
            // If page has data property (new paginated format)
            return page.data;
        }
        return [];
    }) || [];

    const pagination = data?.pages?.[data.pages.length - 1]?.pagination;

    console.log("useLeaderBoard debug:", {
        rawData: data,
        pages: data?.pages,
        leaderboard,
        pagination,
        hasNextPage,
        error
    });

    return {
        LEADERBOARD_CUMULATIVE_FILTERS,
        filters,
        handleFilterClick,
        leaderboard,
        pagination,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLeaderboardLoading: isLoading,
        leaderboardError: error,
        refetchLeaderboard: refetch,
        prefetchNextPage
    };
}