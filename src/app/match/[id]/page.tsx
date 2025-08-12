'use client';

import { AuthWrapper } from "@/components/auth/AuthWrapper";
import MatchDetailsHeader from "@/components/match/MatchDetailsHeader";
import MatchPlayerProfile from "@/components/match/MatchPlayerProfile";
import { VenueDetails } from "@/components/match/VenueDetails";
import { StatsTable } from "@/components/profile/StatsTable";
import { useMatchStats } from "@/hooks/useMatchStats";
import { UserData } from "@/modules/onboarding/types";

interface MatchPageProps {
  params: {
    id: string;
  };
}

const MatchPage = ({ params }: MatchPageProps) => {
  const { id: matchStatsId } = params;
  console.log('debugging matchStatsId', matchStatsId);

  return (
    <AuthWrapper>
      {(userData: UserData) => {
        console.log('debugging user', userData);

        const { matchStats, isMatchStatsLoading, matchStatsError, refetchMatchStats } = useMatchStats(userData?.id, parseInt(matchStatsId));
        console.log('debugging matchStats', matchStats);

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
            if (category === 'FORWARD' || category === 'STRIKER' || category === 'FWD') return 'FWD';
          }
          return undefined;
        };

        const playerPosition = getPlayerPosition();
        console.log('debugging playerPosition', playerPosition);

        return (
          <div className="match-details-page min-h-screen overflow-y-auto p-4 flex flex-col gap-4">
            <MatchDetailsHeader matchStats={matchStats} />
            <MatchPlayerProfile matchStats={matchStats} userData={userData} />
            <StatsTable loading={isMatchStatsLoading} stats={matchStats} screenName="matchStats" playerPosition={playerPosition} />
            <VenueDetails matchStats={matchStats} />
          </div>
        );
      }}
    </AuthWrapper>
  );
};

export default MatchPage; 