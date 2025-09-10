import { UserData } from '@/modules/onboarding/types';
import { EditIcon, ShareIcon } from '@/components/icons';
import Link from 'next/link';

interface ProfileHeaderProps {
  userData: UserData;
}

export function ProfileHeader({ userData }: ProfileHeaderProps) {
  return (
    <div className="border-gray-800 px-4 py-3 z-10">
      <div className="flex items-center justify-between">
        {/* Left side - empty for balance */}
        <div className="w-16"></div>

        {/* Center - Title */}
        <div className="flex flex-row items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-white">Profile</h1>
          <div className="">
            <Link href="/profile/me">
              <EditIcon className="w-5 h-5 text-white opacity-50 hover:opacity-100" />
            </Link>
          </div>
        </div>
        <div className="w-16"></div>


        {/* Right side - Edit Link */}
        {/* <div className="flex items-center justify-end w-16">
          <Link
            href="/profile/me"
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <EditIcon className="w-5 h-5 text-white opacity-50 hover:opacity-100" />
          </Link>
        </div> */}
      </div>
    </div>
  );
} 