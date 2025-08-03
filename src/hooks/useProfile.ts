import { useQuery } from '@tanstack/react-query';
import { getAccessToken } from '@/lib/utils/auth';
import api from '@/lib/api';
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

export interface NoUserMatches {
}

export interface UserMatch {
  id: number;
  timestamp: string;
  venue: string;
}

export interface UserMatches {
  matches: UserMatch[];
}

// API functions
const fetchUserStats = async (): Promise<UserStats | NoUserStats> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }

  try {
    // For now, return hardcoded data since API doesn't exist
    // In the future, this will be: const response = await api.get('/stats');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return stats as UserStats | NoUserStats;
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    throw error;
  }
};

const fetchUserMatches = async (): Promise<UserMatches> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }

  try {
    // For now, return hardcoded data since API doesn't exist
    // In the future, this will be: const response = await api.get('/matches');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return matches as UserMatches;
  } catch (error) {
    console.error('Failed to fetch user matches:', error);
    throw error;
  }
};

export function useProfile() {
  // Query for user stats
  const {
    data: userStats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['userStats'],
    queryFn: fetchUserStats,
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
    queryKey: ['userMatches'],
    queryFn: fetchUserMatches,
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