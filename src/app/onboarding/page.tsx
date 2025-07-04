'use client';

import { useOnboarding } from '@/modules/onboarding/hooks/useOnboarding';
import { OnboardingContainer } from '@/modules/onboarding/components/OnboardingContainer';
import { WelcomeScreen } from '@/modules/onboarding/components/WelcomeScreen';
import { LoginScreen } from '@/modules/onboarding/components/LoginScreen';
import { OTPVerificationScreen } from '@/modules/onboarding/components/OTPVerificationScreen';
import { UserInfoScreen } from '@/modules/onboarding/components/UserInfoScreen';
import { ProfileSetupScreen } from '@/modules/onboarding/components/ProfileSetupScreen';
import { OnboardingStep } from '@/modules/onboarding/types';

export default function OnboardingPage() {
  const {
    currentStep,
    setCurrentStep,
    phoneNumber,
    isLoading,
    error,
    handleRequestOTP,
    handleVerifyOTP,
    handleUpdateUserInfo,
    handleUploadProfilePicture,
  } = useOnboarding();

  const getProgress = (step: OnboardingStep): number => {
    const steps: OnboardingStep[] = [
      'WELCOME',
      'LOGIN',
      'OTP_VERIFICATION',
      'USER_INFO',
      'PROFILE_SETUP',
    ];
    const currentIndex = steps.indexOf(step);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const getStepTitle = (step: OnboardingStep): string => {
    switch (step) {
      case 'WELCOME':
        return '';
      case 'LOGIN':
        return 'Login';
      case 'OTP_VERIFICATION':
        return 'Verify OTP';
      case 'USER_INFO':
        return 'Your Info';
      case 'PROFILE_SETUP':
        return 'Profile Setup';
      default:
        return '';
    }
  };

  const handleBack = () => {
    console.log('handleBack');
    const steps: OnboardingStep[] = [
      'WELCOME',
      'LOGIN',
      'OTP_VERIFICATION',
      'USER_INFO',
      'PROFILE_SETUP',
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <OnboardingContainer
      showBackButton={currentStep !== 'WELCOME'}
      onBack={handleBack}
      title={getStepTitle(currentStep)}
      {...(currentStep !== 'WELCOME' ? { progress: getProgress(currentStep) } : {})}
    >
      {currentStep === 'WELCOME' && (
        <WelcomeScreen
          onContinue={() => setCurrentStep('LOGIN')}
        />
      )}

      {currentStep === 'LOGIN' && (
        <LoginScreen
          onSubmit={handleRequestOTP}
          isLoading={isLoading.requestOTP}
          error={error.requestOTP}
          onBack={handleBack}
        />
      )}

      {currentStep === 'OTP_VERIFICATION' && (
        <OTPVerificationScreen
          phoneNumber={phoneNumber}
          onSubmit={handleVerifyOTP}
          onResendOTP={() => handleRequestOTP(phoneNumber)}
          isLoading={isLoading.verifyOTP}
          error={error.verifyOTP}
        />
      )}

      {currentStep === 'USER_INFO' && (
        <UserInfoScreen
          onSubmit={handleUpdateUserInfo}
          isLoading={isLoading.updateUserInfo}
          error={error.updateUserInfo}
        />
      )}

      {currentStep === 'PROFILE_SETUP' && (
        <ProfileSetupScreen
          onSubmit={handleUploadProfilePicture}
          isLoading={isLoading.uploadProfilePicture}
          error={error.uploadProfilePicture}
        />
      )}
    </OnboardingContainer>
  );
} 