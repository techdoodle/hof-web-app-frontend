import { UserData } from '@/modules/onboarding/types';
import { MatchHistoryIcon } from '@/components/icons';
import CardList from './CardList';
import { UserMatches, useMatchParticipants } from '@/hooks/useProfile';

interface MatchHistoryTabProps {
  userData: UserData;
  matches?: UserMatches;
  isLoading?: boolean;
  error?: any;
  // Optional: if not provided, the component will use the hook directly
  useHookDirectly?: boolean;
}

export function MatchHistoryTab({ 
  userData, 
  matches, 
  isLoading, 
  error, 
  useHookDirectly = false 
}: MatchHistoryTabProps) {
  // Optionally use the hook directly for better caching
  const hookData = useHookDirectly ? useMatchParticipants() : null;
  
  // Use hook data if available, otherwise use props
  const finalMatches = hookData?.userMatches || matches;
  const finalIsLoading = hookData?.isLoading || isLoading;
  const finalError = hookData?.error || error;

  // Handle loading state
  if (finalIsLoading) {
    return (
      <div className="flex-1 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading matches...</div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (finalError) {
    return (
      <div className="flex-1 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400">Error loading matches: {finalError.message}</div>
        </div>
      </div>
    );
  }

  // Handle empty matches
  if (!finalMatches || !finalMatches.matches || finalMatches.matches.length === 0) {
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
        <p className="text-gray-400">{finalMatches.matches.length} matches played</p>
      </div>
      <CardList matches={finalMatches.matches} />
    </div>
  );
} 