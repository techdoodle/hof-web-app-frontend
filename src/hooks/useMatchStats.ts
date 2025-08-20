import { fetchUserMatchStats } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const useMatchStats = (playerId: number, matchId: number | string) => {
    const {
        data: matchStats,
        isLoading: isMatchStatsLoading,
        error: matchStatsError,
        refetch: refetchMatchStats,
      } = useQuery({
        queryKey: ['userMatchStats', playerId, matchId],
        queryFn: () => fetchUserMatchStats(playerId!, matchId),
        enabled: !!playerId && !!matchId, // Only run query if playerId and matchId are available
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