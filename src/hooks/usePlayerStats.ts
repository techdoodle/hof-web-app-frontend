import { fetchPlayerSpiderChart } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const usePlayerStats = (playerId: number) => {
    const {
        data: playerStats,
        isLoading: isPlayerStatsLoading,
        error: playerStatsError,
        refetch: refetchPlayerStats,
    } = useQuery({
        queryKey: ['playerStats', playerId],
        queryFn: () => fetchPlayerSpiderChart(playerId),
        enabled: !!playerId, // Only run query if playerId is available
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });

    return {
        playerStats,
        isPlayerStatsLoading,
        playerStatsError,
        refetchPlayerStats,
    };
};

