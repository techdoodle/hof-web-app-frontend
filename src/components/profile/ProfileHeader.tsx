import { UserData } from '@/modules/onboarding/types';
import { EditIcon } from '@/components/icons';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/DropdownMenu';
import { useRouter } from 'next/navigation';
import { BookCheckIcon, EllipsisVertical, HistoryIcon, LogOutIcon } from 'lucide-react';
import { NotificationTest } from '@/components/common/NotificationTest';

interface ProfileHeaderProps {
  userData: UserData;
}

export function ProfileHeader({ userData }: ProfileHeaderProps) {
  const router = useRouter();

  const dropdownItems: DropdownMenuItem[] = [
    {
      id: 'edit-profile',
      label: 'Edit Profile',
      onClick: () => router.push('/profile/me'),
      icon: <EditIcon className="w-4 h-4" />
    },
    {
      id: 'booking-history',
      label: 'Booking History',
      onClick: () => router.push('/bookings'),
      icon: <HistoryIcon className="w-4 h-4" />
    },
    {
      id: 'logout',
      label: 'Logout',
      onClick: () => {
        localStorage.removeItem('token');
        router.push('/login');
      },
      icon: <LogOutIcon className="w-4 h-4" />
    }
  ];

  return (
    <div className="border-gray-800 px-4 py-3 z-10">
      {/* <NotificationTest /> */}
      <div className="flex items-center justify-between">
        {/* Left side - empty for balance */}
        <div className="w-10"></div>

        {/* Center - Title */}
        <h1 className="text-xl font-semibold text-white">Profile</h1>

        {/* Right side - Dropdown Menu */}
        <div className="w-10 flex justify-end">
          <DropdownMenu
            trigger={
              <div className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                <EllipsisVertical />
              </div>
            }
            items={dropdownItems}
          />
        </div>
      </div>
    </div>
  );
}