'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { OnboardingContainer } from '@/modules/onboarding/components/OnboardingContainer';
import { WelcomeScreen } from '@/modules/onboarding/components/WelcomeScreen';
import { getAccessToken, getUser } from '@/lib/utils/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    const user = getUser();
    
    if (token && user) {
      // Check if user has already completed onboarding
      if (user.onboardingComplete) {
        // User is validated, redirect to profile
        router.replace('/profile');
      } else {
        // User is logged in but not validated, redirect to onboarding
        router.replace('/onboarding');
      }
    }
  }, [router]);

  const handleContinue = () => {
    router.push('/onboarding');
  };

  return (
    <OnboardingContainer>
      <WelcomeScreen onContinue={handleContinue} />
    </OnboardingContainer>
  );
}
