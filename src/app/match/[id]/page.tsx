'use client';

import { AuthWrapper } from "@/components/auth/AuthWrapper";
import MatchDetailsHeader from "@/components/match/MatchDetailsHeader";
import MatchPlayerProfile from "@/components/match/MatchPlayerProfile";
import { VenueDetails } from "@/components/match/VenueDetails";
import { StatsTable } from "@/components/profile/StatsTable";
import { useMatchStats } from "@/hooks/useMatchStats";
import { getUser } from "@/lib/utils/auth";
import { UserData } from "@/modules/onboarding/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface MatchPageProps {
  params: {
    id: string;
  };
}

const MatchPage = ({ params }: MatchPageProps) => {
  const { id: matchStatsId } = params;
  console.log('debugging matchStatsId', matchStatsId);
  const queryClient = useQueryClient();
  const userData = queryClient.getQueryData(['user']) as UserData;
  console.log('debugging user', userData);

  const { matchStats, isMatchStatsLoading, matchStatsError, refetchMatchStats } = useMatchStats(userData?.id, parseInt(matchStatsId));
  console.log('debugging matchStats', matchStats);

  useEffect(() => {
    if(!userData) {
      queryClient.prefetchQuery({
        queryKey: ['user'],
        queryFn: () => {
          const user = getUser();
          console.log('debugging user', user);
          return user;
        },
      });
    }
  }, [userData]);

  // Get player position from matchStats or userData
  const getPlayerPosition = (): 'GK' | 'DEF' | 'FWD' | undefined => {
    if (matchStats?.player?.playerCategory) {
      const category = matchStats.player.playerCategory.toUpperCase();
      if (category === 'GOALKEEPER') return 'GK';
      if (category === 'DEFENDER') return 'DEF';
      if (category === 'FORWARD' || category === 'FWD') return 'FWD';
    }
    if (userData?.playerCategory) {
      const category = userData.playerCategory.toUpperCase();
      if (category === 'GOALKEEPER') return 'GK';
      if (category === 'DEFENDER') return 'DEF';
      if (category === 'FORWARD' || category === 'FWD') return 'FWD';
    }
    return undefined;
  };

  const playerPosition = getPlayerPosition();

  return (
    <AuthWrapper>
      {(userData: UserData) => (
      <div 
        className="match-details-page min-h-screen overflow-y-auto p-4 flex flex-col gap-4"
        style={{
          backgroundImage: 'url(/hof-background.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
          <MatchDetailsHeader matchStats={matchStats} />
          <MatchPlayerProfile matchStats={matchStats} />
          <StatsTable stats={matchStats} screenName="matchStats" playerPosition={playerPosition} />
          <VenueDetails matchStats={matchStats} />
      </div>
      )}
    </AuthWrapper>
  );
};

export default MatchPage; 