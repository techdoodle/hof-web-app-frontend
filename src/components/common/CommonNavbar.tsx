'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useBottomNavVisibility } from '@/hooks/useBottomNavVisibility';

interface CommonNavbarProps {
  activeTab: 'home' | 'leaderboard' | 'play' | 'profile';
}

export function CommonNavbar({ activeTab }: CommonNavbarProps) {
  const navItems: Array<{
    id: 'home' | 'leaderboard' | 'play' | 'profile';
    label: string;
    href: string;
    iconSrc: { active: string; inactive: string };
  }> = [
      {
        id: 'home',
        label: 'Home',
        href: '/home',
        iconSrc: {
          active: '/icons/nav/Home-active.svg',
          inactive: '/icons/nav/Home-inactive.svg',
        },
      },
      {
        id: 'leaderboard',
        label: 'Leaderboard',
        href: '/leaderboard',
        iconSrc: {
          active: '/icons/nav/leaderboard-active.svg',
          inactive: '/icons/nav/Leaderboard-inactive.svg',
        },
      },
      {
        id: 'play',
        label: 'Play',
        href: '/play',
        iconSrc: {
          active: '/icons/nav/HOF-active.svg',
          inactive: '/icons/nav/HOF-inactive.svg',
        },
      },
      {
        id: 'profile',
        label: 'Profile',
        href: '/profile',
        iconSrc: {
          active: '/icons/nav/Profile-active.svg',
          inactive: '/icons/nav/Profile-inactive.svg',
        },
      },
    ];

  const { shouldHideBottomNav } = useBottomNavVisibility();
  console.log('isDrawerOpen shouldHideBottomNav', shouldHideBottomNav);
  return (
    <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 ${shouldHideBottomNav ? 'hidden' : 'block'}`}>
      <nav
        className="rounded-full px-6 py-3"
        style={{
          borderRadius: "30px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0px",
          width: "310px",
          height: "77px",
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
          backdropFilter: 'blur(30px)',
          boxShadow: '0px 20px 30px 0px #00000040',
          border: '0.5px solid',
          //   borderImageSource: 'linear-gradient(0deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.07)), linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
          borderImageSlice: '1',
          // borderRadius: '100px',
          borderImageWidth: '1px',
        }}
      >
        <div className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                style={item.id === 'play' ? { marginLeft: '-14px' } : {}}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive
                  ? 'text-primary'
                  : 'text-white/70 hover:text-white'
                  }`}
              >
                <div className={`relative p-2 rounded-full transition-all duration-300 ${isActive
                  ? 'bg-primary/20 shadow-lg shadow-primary/30'
                  : 'hover:bg-white/10'
                  }`}>
                  <Image
                    src={isActive ? item.iconSrc.active : item.iconSrc.inactive}
                    alt={item.label}
                    width={36}
                    height={36}
                    priority
                  />
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
                  )}
                </div>
                <span className={`text-xs font-medium transition-colors ${isActive ? 'text-primary' : 'text-white/70'
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