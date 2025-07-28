import { UserData } from '@/modules/onboarding/types';
import { MatchHistoryIcon } from '@/components/icons';
import CardList from './CardList';
import { UserMatches } from '@/hooks/useProfile';

interface MatchHistoryTabProps {
  userData: UserData;
  matches?: UserMatches;
  isLoading?: boolean;
  error?: any;
}

export function MatchHistoryTab({ userData, matches, isLoading, error }: MatchHistoryTabProps) {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex-1 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading matches...</div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex-1 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400">Error loading matches: {error.message}</div>
        </div>
      </div>
    );
  }

  // Handle empty matches
  if (!matches || !matches.matches || matches.matches.length === 0) {
    return (
      <div className="flex-1 p-4">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MatchHistoryIcon className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Match History</h3>
          <p className="text-gray-400">Your match history will appear here</p>
        </div>
        <CardList />
      </div>
    );
  }

  // Handle matches data
  return (
    <div className="flex-1 p-4">
      <div className="text-left pb-2">
        <p className="text-gray-400">{matches.matches.length} matches played</p>
      </div>
      <CardList matches={matches.matches} />
    </div>
  );
} 