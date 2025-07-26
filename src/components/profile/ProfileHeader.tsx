import { UserData } from '@/modules/onboarding/types';
import { EditIcon, ShareIcon } from '@/components/icons';

interface ProfileHeaderProps {
  userData: UserData;
}

export function ProfileHeader({ userData }: ProfileHeaderProps) {
  return (
    <div className="border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - empty for balance */}
        <div className="w-8"></div>
        
        {/* Center - Title */}
        <h1 className="text-lg font-semibold text-white">Profile</h1>
        
        {/* Right side - Icons */}
        <div className="flex items-center gap-4">
          <button className="p-1 hover:bg-gray-800 rounded transition-colors">
            <EditIcon className="w-5 h-5 text-white opacity-50" />
          </button>
          <button className="p-1 hover:bg-gray-800 rounded transition-colors">
            <ShareIcon className="w-5 h-5 text-white opacity-50" />
          </button>
        </div>
      </div>
    </div>
  );
} 