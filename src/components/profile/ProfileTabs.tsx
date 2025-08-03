import { LeaderboardIcon } from '@/components/icons';
import { Button } from '@/lib/ui/components/Button/Button';

interface ProfileTabsProps {
  activeTab: 'stats' | 'matchHistory';
  onTabChange: (tab: 'stats' | 'matchHistory') => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Tabs Section */}
        <div 
          className="p-1 bg-black rounded-[0.5rem]"
          style={{
            border: '1px solid',
            borderImageSource: 'linear-gradient(0deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.07)), linear-gradient(0deg, rgba(255, 255, 255, 0.4) -38.64%, rgba(255, 255, 255, 0) 135.23%)',
            borderImageSlice: '1',
          }}
        >
          <div className="flex gap-6">
            {activeTab === 'stats' ? (
              <Button
                onClick={() => onTabChange('stats')}
                className="px-6 py-2 rounded-lg font-medium bg-green-gradient-dark text-[#F9F9F9] shadow-lg shadow-primary/30"
              >
                Stats
              </Button>
            ) : (
              <button
                onClick={() => onTabChange('stats')}
                className="px-6 py-2 font-medium text-[#F9F9F9] hover:text-white transition-colors"
              >
                Stats
              </button>
            )}

            {activeTab === 'matchHistory' ? (
              <Button
                onClick={() => onTabChange('matchHistory')}
                className="px-6 py-2 rounded-lg font-medium bg-green-gradient-dark text-white shadow-lg shadow-primary/30"
              >
                Matches
              </Button>
            ) : (
              <button
                onClick={() => onTabChange('matchHistory')}
                className="px-6 py-2 font-medium text-gray-400 hover:text-white transition-colors"
              >
                Matches
              </button>
            )}
          </div>
        </div>

        {/* Circular Icon */}
        {/* <div className="w-10 h-10 rounded-full border border-primary flex items-center justify-center " style={{background:'rgba(0, 204, 102, 0.2)'}}>
          <LeaderboardIcon className="w-5 h-5 text-white" />
        </div> */}
      </div>
    </div>
  );
} 