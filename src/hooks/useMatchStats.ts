import { fetchUserMatchStats } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useMatchStats = (playerId: number, matchStatsId: number | string) => {
    const {
        data: matchStats,
        isLoading: isMatchStatsLoading,
        error: matchStatsError,
        refetch: refetchMatchStats,
      } = useQuery({
        queryKey: ['userMatchStats', playerId, matchStatsId],
        queryFn: () => fetchUserMatchStats(playerId!, matchStatsId),
        enabled: !!playerId && !!matchStatsId, // Only run query if playerId and matchStatsId are available
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
      }); 

    return {
        matchStats,
        isMatchStatsLoading,
        matchStatsError,
        refetchMatchStats,
    }
}