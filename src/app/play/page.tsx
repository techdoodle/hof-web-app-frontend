'use client';

import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { CommonNavbar } from '@/components/common/CommonNavbar';
import { UserData } from '@/modules/onboarding/types';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from 'lucide-react';
import Image from 'next/image';
import { ComingSoon } from '@/components/common/ComingSoon';

export default function PlayPage() {
  const router = useRouter();
  return (
    <AuthWrapper>
      {(userData: UserData) => (
        <div className="min-h-screen flex flex-col pb-24 max-w-md mx-auto">
          {/* Header */}
          <div className=" border-b border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="w-8">
                <ChevronLeftIcon className="w-6 h-6" onClick={() => router.back()} />
              </div>
              <h1 className="text-lg text-white">Book & Play Matches</h1>
              <div className="w-8"></div>
            </div>
          </div>

          {/* Main Content */}
          <ComingSoon />

          {/* Common Navbar */}
          <CommonNavbar activeTab="play" />
        </div>
      )}
    </AuthWrapper>
  );
} 