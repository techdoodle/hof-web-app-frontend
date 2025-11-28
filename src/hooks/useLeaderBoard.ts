import { fetchNewLeaderBoard } from "@/lib/api";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const LEADERBOARD_QUERY_KEY = 'leaderboard';
const LEADERBOARD_STALE_TIME = 300 * 60 * 1000;

// UPDATED FILTER STRUCTURE - Removed timeframes, added gender & leaderboard types
const LEADERBOARD_FILTERS = {
    leaderboard_types: {
        'Overall': 'overall',
        'Goals + Assists': 'gna',
        'Appearances': 'appearances',
        'Shot Accuracy': 'shot_accuracy',
        'Pass Accuracy': 'pass_accuracy',
    },
    cities: {
        'All Cities': 'all',
        'Gurugram': 'gurugram',
        'Mumbai': 'mumbai',
        'Bengaluru': 'bengaluru',
    },
    positions: {
        'All Positions': 'all',
        'ATK': 'atk',
        'DEF': 'def',
        'GK': 'gk',
    },
    gender: {
        'All': 'all',
        'Male': 'male',
        'Female': 'female',
    }
};

const defaultFilters = {
    leaderboard_type: 'overall',
    city: 'all',
    position: 'all',
    gender: 'all', // UI has "All" option, API handles 'all' correctly
    limit: 50,
};

export const useLeaderBoard = (limit: number = 50) => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    const getInitialFilters = () => {
        // Read type from URL (?leaderboard_type=...), default to overall
        const urlTypeParam = (searchParams.get('leaderboard_type') || defaultFilters.leaderboard_type).toLowerCase();
        const normalizedType =
            Object.values(LEADERBOARD_FILTERS.leaderboard_types).includes(urlTypeParam)
                ? urlTypeParam
                : defaultFilters.leaderboard_type;

        const city = (searchParams.get('city') || defaultFilters.city).toLowerCase();
        const position = (searchParams.get('position') || defaultFilters.position).toLowerCase();
        const gender = (searchParams.get('gender') || defaultFilters.gender).toLowerCase();

        return {
            leaderboard_type: normalizedType,
            city,
            position,
            gender,
            limit,
        };
    };

    const [filters, setFilters] = useState(getInitialFilters());

    const updateURL = (newFilters: typeof filters) => {
        const params = new URLSearchParams();

        if (newFilters.city !== 'all') params.set('city', newFilters.city);
        if (newFilters.position !== 'all') params.set('position', newFilters.position);
        if (newFilters.gender !== 'all') params.set('gender', newFilters.gender);
        if (newFilters.leaderboard_type !== 'overall') params.set('leaderboard_type', newFilters.leaderboard_type);
        const newUrl = params.toString() ? `/leaderboard?${params.toString()}` : '/leaderboard';
        router.push(newUrl, { scroll: false });
    };

    const handleFilterClick = (
        filterType: 'city' | 'position' | 'gender' | 'leaderboard_type',
        value: string
    ) => {
        const newFilters = { ...filters, [filterType]: value };
        setFilters(newFilters);
        updateURL(newFilters);
    };

    const resetFilters = () => {
        const resetFilters = { ...defaultFilters, limit };
        setFilters(resetFilters);
        updateURL(resetFilters);
    };

    useEffect(() => {
        const urlTypeParam = (searchParams.get('leaderboard_type') || defaultFilters.leaderboard_type).toLowerCase();
        const urlCity = (searchParams.get('city') || 'all').toLowerCase();
        const urlPosition = (searchParams.get('position') || 'all').toLowerCase();
        const urlGender = (searchParams.get('gender') || 'all').toLowerCase();

        const normalizedType =
            Object.values(LEADERBOARD_FILTERS.leaderboard_types).includes(urlTypeParam)
                ? urlTypeParam
                : defaultFilters.leaderboard_type;

        if (
            urlCity !== filters.city ||
            urlPosition !== filters.position ||
            urlGender !== filters.gender ||
            normalizedType !== filters.leaderboard_type
        ) {
            setFilters(prev => ({
                leaderboard_type: normalizedType,
                city: urlCity,
                position: urlPosition,
                gender: urlGender,
                limit: prev.limit ?? limit,
            }));
        }
    }, [searchParams, filters.city, filters.position, filters.gender, filters.leaderboard_type, limit]);

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
        queryFn: ({ pageParam = 1 }) => fetchNewLeaderBoard(pageParam, limit, filters),
        getNextPageParam: (lastPage) => {
            if (Array.isArray(lastPage)) {
                return lastPage.length === limit ? 2 : undefined;
            } else if (lastPage?.pagination?.hasNextPage) {
                return lastPage.pagination.currentPage + 1;
            }
            return undefined;
        },
        staleTime: LEADERBOARD_STALE_TIME,
        refetchOnWindowFocus: false,
        initialPageParam: 1,
    });

    const prefetchNextPage = () => {
        if (hasNextPage && !isFetchingNextPage && data?.pages) {
            const lastPage = data.pages[data.pages.length - 1];
            let nextPage = 1;

            if (Array.isArray(lastPage)) {
                nextPage = 2;
            } else if (lastPage?.pagination?.currentPage) {
                nextPage = lastPage.pagination.currentPage + 1;
            }

            // Use prefetchInfiniteQuery with the same query key to cache pages together
            queryClient.prefetchInfiniteQuery({
                queryKey: [LEADERBOARD_QUERY_KEY, limit, filters],
                queryFn: ({ pageParam = nextPage }) => fetchNewLeaderBoard(pageParam, limit, filters),
                getNextPageParam: (lastPage: any) => {
                    if (Array.isArray(lastPage)) {
                        return lastPage.length === limit ? nextPage + 1 : undefined;
                    } else if (lastPage?.pagination?.hasNextPage) {
                        return lastPage.pagination.currentPage + 1;
                    }
                    return undefined;
                },
                initialPageParam: nextPage,
                staleTime: LEADERBOARD_STALE_TIME,
            });
        }
    };

    const leaderboard = data?.pages?.flatMap(page => {
        if (Array.isArray(page)) {
            return page;
        } else if (page?.data && Array.isArray(page.data)) {
            return page.data;
        }
        return [];
    }) || [];

    const pagination = data?.pages?.[data.pages.length - 1]?.pagination;

    return {
        LEADERBOARD_FILTERS,
        filters,
        handleFilterClick,
        resetFilters,
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
};