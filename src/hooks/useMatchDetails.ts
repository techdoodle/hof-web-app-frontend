import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface MatchDetails {
  id: number;
  venue: {
    name: string;
    address: string;
    display_banner?: string;
    latitude: number;
    longitude: number;
  };
  startTime: string;
  endTime: string;
  matchType: string;
  slotPrice: number;
  offerPrice: number;
  playerCapacity: number;
  bookedSlots: number;
  isFastFilling: boolean;
}

export function useMatchDetails(matchId: string | number) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['match-details', matchId],
    queryFn: async () => {
      // Try to find the match in the nearby-matches cache first
      const nearbyMatchesData = queryClient.getQueryData<{ venue: any; matches: any[] }[]>(['nearby-matches']);

      // If we have nearby matches data, try to find this match
      if (nearbyMatchesData) {
        for (const venueMatches of nearbyMatchesData) {
          const match = venueMatches.matches.find(m => m.id === Number(matchId));
          if (match) {
            return {
              ...match,
              venue: venueMatches.venue,
              isFastFilling: match.bookedSlots / match.playerCapacity > 0.7,
              distance: venueMatches.venue.distance,
            };
          }
        }
      }

      // If not found in cache, fetch from API
      const response = await api.get(`/matches/${matchId}`);
      const matchData = response.data;

      return {
        ...matchData,
        isFastFilling: matchData.bookedSlots / matchData.playerCapacity > 0.7
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
