'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { OnboardingContainer } from '@/modules/onboarding/components/OnboardingContainer';
import { WelcomeScreen } from '@/modules/onboarding/components/WelcomeScreen';
import { getAccessToken } from '@/lib/utils/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      // User is logged in, redirect to onboarding
      router.replace('/onboarding');
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
