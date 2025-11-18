'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OnboardingContainer } from '@/modules/onboarding/components/OnboardingContainer';
import { WelcomeScreen } from '@/modules/onboarding/components/WelcomeScreen';
import { getAccessToken, getUser } from '@/lib/utils/auth';
import { Loader2Icon } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const token = getAccessToken();
      const user = getUser();

      if (token && user) {
        // Check if user has already completed onboarding
        if (user.onboardingComplete) {
          // User is validated, redirect to home
          router.replace('/home');
          return;
        } else {
          // User is logged in but not validated, redirect to onboarding
          router.replace('/onboarding');
          return;
        }
      }

      // No user found, show welcome screen
      setIsChecking(false);
    };

    checkAuthAndRedirect();
  }, [router]);

  const handleContinue = () => {
    console.log('Get Started button clicked');
    router.push('/onboarding');
  };

  // Show loader while checking authentication
  if (isChecking) {
    return (
      <div className="fixed inset-0 h-full min-h-screen w-full overflow-hidden bg-background">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/landing-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 z-10 bg-black opacity-40" />

        <div className="relative z-20 flex flex-col items-center justify-center h-full px-4">
          <div className="logo-container mb-8">
            <Image src="/logo.svg" alt="Humans of Football Logo" width={100} height={100} />
          </div>

          <Loader2Icon className="h-12 w-12 animate-spin text-light-green mb-4" />

          <p className="text-white text-lg font-medium">
            Loading the app for you...
          </p>
        </div>
      </div>
    );
  }

  return (
    <OnboardingContainer fullBleed={true}>
      <WelcomeScreen onContinue={handleContinue} />
    </OnboardingContainer>
  );
}
