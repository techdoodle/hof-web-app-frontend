import Link from 'next/link';
import { LeaderboardIcon, PlayIcon, ProfileIcon } from '@/components/icons';

interface CommonNavbarProps {
  activeTab: 'leaderboard' | 'play' | 'profile';
}

export function CommonNavbar({ activeTab }: CommonNavbarProps) {
  const navItems = [
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: <LeaderboardIcon className="w-6 h-6" />,
      href: '/leaderboard'
    },
    {
      id: 'play',
      label: 'Play',
      icon: <PlayIcon className="w-6 h-6" />,
      href: '/play'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <ProfileIcon className="w-6 h-6" />,
      href: '/profile'
    }
  ];

  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
      <nav 
        className="rounded-full px-6 py-3"
        style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
          backdropFilter: 'blur(30px)',
          boxShadow: '0px 20px 30px 0px #00000040',
          border: '0.5px solid',
        //   borderImageSource: 'linear-gradient(0deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.07)), linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
          borderImageSlice: '1',
          borderRadius: '100px',
          borderImageWidth: '1px',
        }}
      >
        <div className="flex items-center gap-12">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                  isActive
                    ? 'text-primary'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <div className={`relative p-2 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary/20 shadow-lg shadow-primary/30' 
                    : 'hover:bg-white/10'
                }`}>
                  {item.icon}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
                  )}
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-white/70'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
} 