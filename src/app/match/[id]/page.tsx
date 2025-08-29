'use client';

import { AuthWrapper } from "@/components/auth/AuthWrapper";
import MatchDetailsHeader from "@/components/match/MatchDetailsHeader";
import MatchPlayerProfile from "@/components/match/MatchPlayerProfile";
import { TeamStats } from "@/components/match/TeamStats";
import { VenueDetails } from "@/components/match/VenueDetails";
import { StatsTable } from "@/components/profile/StatsTable";
import { useMatchStats } from "@/hooks/useMatchStats";
import { UserData } from "@/modules/onboarding/types";

const MY_TEAM = [
  {
    id: 1,
    name: "John Doe",
    position: "DEFENDER",
    statVal: '1 Tackle',
    profilePicture: 'https://storage.googleapis.com/hof-storage.firebasestorage.app/profile_pictures_stg/2/9bb07e14-cb39-4fc6-9a86-9a7f30b80d88.png',
    mvp: true,
  },
  {
    id: 2,
    name: "Jane Doe",
    position: "FORWARD",
    statVal: '1 Goal',
    profilePicture: 'https://storage.googleapis.com/hof-storage.firebasestorage.app/profile_pictures_stg/5/eebd34da-337d-4d96-bbca-0d740e511642.png',
    mvp: false,
  },
  {
    id: 2,
    name: "Jane Doe",
    position: "FORWARD",
    statVal: '1 Goal',
    profilePicture: 'https://storage.googleapis.com/hof-storage.firebasestorage.app/profile_pictures_stg/4/f74e6533-fc9e-4a40-9cd4-fd2c568165d5.png',
    mvp: false,
  },
  {
    id: 2,
    name: "Jane Doe",
    position: "FORWARD",
    statVal: '1 Goal',
    profilePicture: 'url+here_pls',
    mvp: false,
  },
  {
    id: 2,
    name: "Jane Doe",
    position: "FORWARD",
    statVal: '1 Goal',
    profilePicture: 'url+here_pls',
    mvp: false,
  },
  {
    id: 2,
    name: "Jane Doe",
    position: "FORWARD",
    statVal: '1 Goal',
    profilePicture: 'url+here_pls',
    mvp: false,
  }
];

const OPPONENT_TEAM = [
  {
    id: 1,
    name: "John Doe",
    position: "DEFENDER",
    statVal: '1 Tackle',
    profilePicture: 'https://storage.googleapis.com/hof-storage.firebasestorage.app/profile_pictures_stg/3/7f8c6d8b-9d6f-49d7-bdd4-91ee8d0b6499.png',
    mvp: true,
  },
  {
    id: 2,
    name: "Jane Doe",
    position: "FORWARD",
    statVal: '1 Goal',
    profilePicture: 'url+here_pls',
    mvp: false,
  }
];

interface MatchPageProps {
  params: {
    id: string;
  };
}

const MatchPage = ({ params }: MatchPageProps) => {
  const { id: matchId } = params;
  console.log('debugging matchId', matchId);

  return (
    <AuthWrapper>
      {(userData: UserData) => {
        console.log('debugging user', userData);

        const { matchStats, isMatchStatsLoading, matchStatsError, refetchMatchStats } = useMatchStats(userData?.id, parseInt(matchId));
        console.log('debugging matchStats', matchStats);

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
            <MatchDetailsHeader matchStats={matchStats} />
            <MatchPlayerProfile matchStats={matchStats} userData={userData} playerPosition={playerPosition as 'GK' | 'DEF' | 'FWD'} />
            <StatsTable loading={isMatchStatsLoading} stats={matchStats} screenName="matchStats" playerPosition={playerPosition} />
            <VenueDetails matchStats={matchStats} />
            <div className="border-b border-white border-dashed" />
            {/* <TeamStats stats={MY_TEAM} team=" Your Team" />
            <TeamStats stats={OPPONENT_TEAM} team=" Opponents" /> */}
            <div className="h-24" />
          </div>
        );
      }}
    </AuthWrapper>
  );
};

export default MatchPage; 