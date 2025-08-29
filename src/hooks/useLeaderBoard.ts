import { fetchLeaderBoard } from "@/lib/api";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";

const LEADERBOARD_QUERY_KEY = 'leaderboard';
const LEADERBOARD_STALE_TIME = 5 * 60 * 1000; // 5 minutes

const DUMMY_LEADERBOARD = [
    {
        id: 111,
        rank: 1,
        name: "Daksh Taneja Fake",
        score: 100,
        suffix: 'xp',
        imageUrl: "https://storage.googleapis.com/hof-storage.firebasestorage.app/profile_pictures/1/a0d3ba40-cb39-46fc-93e6-c27b042cad3a.png",
    },
    {
        id: 2,
        rank: 2,
        name: "Jane Doe",
        score: 90,
        suffix: 'xp',
        imageUrl: "",
    },
    {
        rank: 3,
        id: 3,
        name: "John Doe 2",
        score: 100,
        suffix: 'xp',
        imageUrl: "https://storage.googleapis.com/hof-storage.firebasestorage.app/profile_pictures/1/a0d3ba40-cb39-46fc-93e6-c27b042cad3b.png",
    },
    {
        rank: 4,
        id: 4,
        name: "John Doe 3",
        score: 100,
        suffix: 'xp',
        imageUrl: "https://storage.googleapis.com/hof-storage.firebasestorage.app/profile_pictures/1/a0d3ba40-cb39-46fc-93e6-c27b042cad3c.png",
    },
    {
        rank: 5,
        id: 5,
        name: "John Doe 4",
        score: 100,
        suffix: 'xp',
        imageUrl: "",
    },
    {
        rank: 6,
        id: 6,
        name: "John Doe 5",
        score: 100,
        suffix: 'xp',
        imageUrl: "",
    },
    {
        rank: 7,
        id: 7,
        name: "John Doe 6",
        score: 100,
        suffix: 'xp',
        imageUrl: "",
    },
    {
        rank: 8,
        id: 8,
        name: "John Doe 7",
        score: 100,
        suffix: 'xp',
        imageUrl: "",
    },
    {
        rank: 9,
        id: 9,
        name: "John Doe 8",
        score: 100,
        suffix: 'xp',
        imageUrl: "",
    },
    {
        rank: 13,
        id: 1,
        name: "Daksh Taneja",
        score: 100,
        suffix: 'xp',
        imageUrl: "https://storage.googleapis.com/hof-storage.firebasestorage.app/profile_pictures/1/a0d3ba40-cb39-46fc-93e6-c27b042cad3a.png"
    },
    {
        rank: 10,
        id: 10,
        name: "John Doe 9",
        score: 100,
        suffix: 'xp',
        imageUrl: "",
    },
    {
        rank: 11,
        id: 11,
        name: "John Doe 10",
        score: 100,
        suffix: 'xp',
        imageUrl: "",
    },
    {
        rank: 12,
        id: 12,
        name: "John Doe 11",
        score: 100,
        suffix: 'xp',
        imageUrl: "",
    }
]

export const useLeaderBoard = (limit: number = 20) => {
    const queryClient = useQueryClient();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch
    } = useInfiniteQuery({
        queryKey: [LEADERBOARD_QUERY_KEY, limit],
        queryFn: ({ pageParam = 1 }) => fetchLeaderBoard(pageParam, limit),
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
                queryFn: () => fetchLeaderBoard(nextPage, limit),
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