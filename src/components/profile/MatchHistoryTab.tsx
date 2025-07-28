import { UserData } from '@/modules/onboarding/types';
import { MatchHistoryIcon } from '@/components/icons';
import CardList from './CardList';

interface MatchHistoryTabProps {
  userData: UserData;
}

export function MatchHistoryTab({ userData }: MatchHistoryTabProps) {
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