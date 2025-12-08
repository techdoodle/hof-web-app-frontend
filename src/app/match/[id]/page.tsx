'use client';

import { useState } from 'react';
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import MatchDetailsHeader from "@/components/match/MatchDetailsHeader";
import MatchPlayerProfile from "@/components/match/MatchPlayerProfile";
import { TeamStats } from "@/components/match/TeamStats";
import { VenueDetails } from "@/components/match/VenueDetails";
import { StatsTable } from "@/components/profile/StatsTable";
import { useMatchStats } from "@/hooks/useMatchStats";
import { UserData } from "@/modules/onboarding/types";
import { useBottomNavVisibility } from "@/hooks/useBottomNavVisibility";
import HighlightLinks from "@/components/match/HighlightLinks";
import { ShareModal } from "@/components/share/ShareModal";
import { ShareableMatchCard } from "@/components/share/ShareableMatchCard";

interface MatchPageProps {
  params: {
    id: string;
  };
}

interface MatchPageContentProps {
  userData: UserData;
  matchId: string;
}

const MatchPageContent = ({ userData, matchId }: MatchPageContentProps) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { matchStats, isMatchStatsLoading, matchStatsError, refetchMatchStats } = useMatchStats(userData?.id, parseInt(matchId));
  const { shouldHideBottomNav, showDrawer, hideDrawer } = useBottomNavVisibility();

  console.log('debugging user', userData);
  console.log('debugging matchStats', matchStats);

  const getMatchRecapAndHighlights = (matchStats: any) => {
    if (matchStats?.match) {
      if (matchStats?.match?.matchRecap && matchStats?.match?.matchHighlights) {
        return [matchStats.match?.matchHighlights, matchStats.match?.matchRecap];
      }
      else if (matchStats?.match?.matchHighlights) {
        return [matchStats.match?.matchHighlights];
      }
      else if (matchStats?.match?.matchRecap) {
        return [matchStats.match?.matchRecap];
      }
    }
    return [];
  };

  // Get player position from matchStats or userData
  const getPlayerPosition = (): 'GK' | 'DEF' | 'FWD' => {
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
    return 'FWD'; // Default fallback
  };

  const playerPosition = getPlayerPosition();
  console.log('debugging playerPosition', playerPosition);

  return (
    <div className="match-details-page min-h-screen overflow-y-auto p-4 flex flex-col gap-4">
      <MatchDetailsHeader matchStats={matchStats} onShareClick={() => setIsShareModalOpen(true)} />
      <MatchPlayerProfile
        key={`match-profile-${matchId}-${userData?.id}`}
        matchStats={matchStats}
        userData={userData}
        playerPosition={playerPosition as 'GK' | 'DEF' | 'FWD'}
      />
      <StatsTable loading={isMatchStatsLoading} stats={matchStats} screenName="matchStats" playerPosition={playerPosition} />
      <VenueDetails matchStats={matchStats} />
      <div className="border-b border-white border-dashed" />
      {matchStats && matchStats?.myTeam && <TeamStats
        stats={matchStats?.myTeam}
        team=" Your Team"
        userData={userData}
        matchId={parseInt(matchId)}
        onDrawerOpen={showDrawer}
        onDrawerClose={hideDrawer}
      />}
      {matchStats && matchStats?.opponentTeam && <TeamStats
        stats={matchStats?.opponentTeam}
        team=" Opponents"
        userData={userData}
        matchId={parseInt(matchId)}
        onDrawerOpen={showDrawer}
        onDrawerClose={hideDrawer}
      />}
      {getMatchRecapAndHighlights(matchStats).length > 0 && <HighlightLinks links={getMatchRecapAndHighlights(matchStats)} heading="Match Highlights and Recap" />}
      {matchStats?.playerHighlights && typeof matchStats.playerHighlights === 'string' && matchStats.playerHighlights.trim().length > 0 && <HighlightLinks links={[matchStats.playerHighlights]} heading="Player Highlights" />}
      <div className="h-24" />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        type="match"
        playerName={`${userData.firstName} ${userData.lastName}`}
      >
        <ShareableMatchCard
          userData={userData}
          matchStats={matchStats}
          playerPosition={playerPosition}
        />
      </ShareModal>
    </div>
  );
};

const MatchPage = ({ params }: MatchPageProps) => {
  const { id: matchId } = params;
  console.log('debugging matchId', matchId);

  return (
    <AuthWrapper>
      {(userData: UserData) => (
        <MatchPageContent userData={userData} matchId={matchId} />
      )}
    </AuthWrapper>
  );
};

export default MatchPage; 