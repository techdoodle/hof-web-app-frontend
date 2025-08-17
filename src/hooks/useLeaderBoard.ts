import { fetchLeaderBoard } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

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

export const useLeaderBoard = () => {
    const { data: leaderboard, isLoading: isLeaderboardLoading, error: leaderboardError, refetch: refetchLeaderboard } = useQuery({
        queryKey: [LEADERBOARD_QUERY_KEY],
        queryFn: () => fetchLeaderBoard(),
        // queryFn: () => DUMMY_LEADERBOARD,
        staleTime: LEADERBOARD_STALE_TIME,
        refetchOnWindowFocus: false,
    });

    return { leaderboard, isLeaderboardLoading, leaderboardError };
}