import { useQuery } from '@tanstack/react-query';
import { getAccessToken, getUser } from '@/lib/utils/auth';
import api, { fetchPlayerSpiderChart, fetchUserMatchParticipants } from '@/lib/api';
import stats from '@/responses/profile.json';
import matches from '@/responses/matches.json';

// Types for the API responses
export interface UserStats {
  playerId: number;
  matchesPlayed: number;
  totalMvpWins: number;
  spiderChart: {
    shooting: number;
    passing: number;
    dribbling: number;
    tackling: number;
    impact: number;
  };
  detailedStats: {
    shooting: {
      shotAccuracy: number;
      shotsPerMatch: number;
      totalShots: number;
      totalOnTargetShots: number;
    };
    passing: {
      totalCompletePassingActions: number;
      overallAccuracy: number;
      openPlayAccuracy: number;
    };
    dribbling: {
      successRate: number;
      attemptsPerMatch: number;
      totalAttempts: number;
      totalSuccessful: number;
    };
    tackling: {
      successRate: number;
      defensiveActionsPerMatch: number;
      totalDefensiveActions: number;
      successfulTackles: number;
      totalTackleAttempts: number;
      interceptions: number;
    };
    impact: {
      goalsAndAssistsPerMatch: number;
      totalGoals: number;
      totalAssists: number;
    };
  };
}

export interface NoUserStats {
  playerId: number;
  matchesPlayed: number;
  totalMvpWins: number;
  spiderChart: any;
  detailedStats: {};
}

// New interfaces for the match participants API response
export interface Venue {
  id: number;
  name: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  matchId: number;
  matchStatsId: string;
  matchType: string;
  startTime: string;
  endTime: string;
  statsReceived: boolean;
  teamAScore: number | null;
  teamBScore: number | null;
  venue: Venue;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  phoneNumber: string;
  username: string | null;
  email: string | null;
  firstName: string;
  lastName: string;
  gender: string;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  playerCategory: string;
  invitesLeft: number;
  whatsappInviteOpt: boolean;
  inviteSent: boolean;
}

export interface MatchParticipant {
  matchParticipantId: number;
  match: Match;
  user: User;
  teamSide: string;
  paidStatsOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoUserMatches {
}

// Legacy interface for backward compatibility
export interface UserMatch {
  id: number;
  timestamp: string;
  venue: string;
}

export interface UserMatches {
  matches: UserMatch[];
}

// API functions
const fetchUserSpiderChart = async (): Promise<UserStats | NoUserStats> => {
  const token = getAccessToken();
  const user = getUser();
  
  if (!token) {
    throw new Error('No access token available');
  }

  if (!user || !user.id) {
    throw new Error('No user data available');
  }

  try {
    // Call the actual backend API using the helper function
    const data = await fetchPlayerSpiderChart(user.id);
    return data;
  } catch (error) {
    console.error('Failed to fetch user spider chart:', error);
    
    // Fallback to hardcoded data if API fails
    console.log('Falling back to hardcoded data');
    await new Promise(resolve => setTimeout(resolve, 500));
    return stats as UserStats | NoUserStats;
  }
};

const fetchUserMatches = async (): Promise<UserMatches> => {
  const token = getAccessToken();
  const user = getUser();
  
  if (!token) {
    throw new Error('No access token available');
  }

  if (!user || !user.id) {
    throw new Error('No user data available');
  }

  try {
    // Call the new API endpoint
    const matchParticipants: MatchParticipant[] = await fetchUserMatchParticipants(user.id);
    
    // Transform the API response to match the expected UserMatches format
    const transformedMatches: UserMatch[] = matchParticipants.map(participant => ({
      id: participant.match.matchId,
      timestamp: new Date(participant.match.startTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      venue: participant.match.venue.name
    }));
    
    return { matches: transformedMatches };
  } catch (error) {
    console.error('Failed to fetch user matches:', error);
    
    // Fallback to hardcoded data if API fails
    console.log('Falling back to hardcoded data');
    await new Promise(resolve => setTimeout(resolve, 500));
    return matches as UserMatches;
  }
};

export function useProfile() {
  const user = getUser();
  const playerId = user?.id;

  // Query for user stats
  const {
    data: userStats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['userSpiderChart', playerId],
    queryFn: fetchUserSpiderChart,
    enabled: !!playerId, // Only run query if playerId is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 401 (unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Query for user matches
  const {
    data: userMatches,
    isLoading: isMatchesLoading,
    error: matchesError,
    refetch: refetchMatches,
  } = useQuery({
    queryKey: ['userMatches', playerId],
    queryFn: fetchUserMatches,
    enabled: !!playerId, // Only run query if playerId is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 401 (unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    // Stats data
    userStats,
    isStatsLoading,
    statsError,
    refetchStats,
    
    // Matches data
    userMatches,
    isMatchesLoading,
    matchesError,
    refetchMatches,
    
    // Combined loading state
    isLoading: isStatsLoading || isMatchesLoading,
    
    // Combined error state
    error: statsError || matchesError,
    
    // Combined refetch function
    refetch: () => {
      refetchStats();
      refetchMatches();
    },
  };
} 