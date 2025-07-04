'use client';

import { useRouter } from 'next/navigation';
import { OnboardingContainer } from '@/modules/onboarding/components/OnboardingContainer';
import { WelcomeScreen } from '@/modules/onboarding/components/WelcomeScreen';

export default function HomePage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/onboarding');
  };

  return (
    <OnboardingContainer>
      <WelcomeScreen onContinue={handleContinue} />
    </OnboardingContainer>
  );
}
