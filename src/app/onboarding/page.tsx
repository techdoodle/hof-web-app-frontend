'use client';

import { useOnboarding } from '@/modules/onboarding/hooks/useOnboarding';
import { OnboardingContainer } from '@/modules/onboarding/components/OnboardingContainer';
import { WelcomeScreen } from '@/modules/onboarding/components/WelcomeScreen';
import { LoginScreen } from '@/modules/onboarding/components/LoginScreen';
import { OTPVerificationScreen } from '@/modules/onboarding/components/OTPVerificationScreen';
import { UserInfoScreen } from '@/modules/onboarding/components/UserInfoScreen';
import { ProfileSetupScreen } from '@/modules/onboarding/components/ProfileSetupScreen';
import { OnboardingStep } from '@/modules/onboarding/types';
import { useRouter } from 'next/navigation';
import { GenderSelectionScreen } from '@/modules/onboarding/components/GenderSelectionScreen';

export default function OnboardingPage() {
  const router = useRouter();
  const {
    currentStep,
    setCurrentStep,
    phoneNumber,
    isLoading,
    error,
    handleRequestOTP,
    handleVerifyOTP,
    handleUpdateUserInfo,
    handleGenderSelection,
    handleUploadProfilePicture,
    otpAttempts,
    maxOtpAttempts,
    handleResendOTP,
    resendAttempts,
    maxResendAttempts,
    invalidOtpError,
  } = useOnboarding();

  // Only show progress bar and skip after OTP
  const showProgress = currentStep === 'USER_INFO' || currentStep === 'GENDER_SELECTION' || currentStep === 'PROFILE_SETUP';
  const showSkip = showProgress;
  const showBackButton =
    (currentStep !== 'WELCOME' && currentStep !== 'LOGIN' && currentStep !== 'OTP_VERIFICATION') && currentStep !== 'USER_INFO' ? true : false;

  const getProgress = (step: OnboardingStep): number => {
    const steps: OnboardingStep[] = [
      'WELCOME',
      'LOGIN',
      'OTP_VERIFICATION',
      'USER_INFO',
      'GENDER_SELECTION',
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
      case 'GENDER_SELECTION':
        return 'About You';
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
      'GENDER_SELECTION',
      'PROFILE_SETUP',
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSkip = () => {
    router.push('/landing');
  };

  return (
    <OnboardingContainer
      showBackButton={showBackButton}
      onBack={handleBack}
      title={getStepTitle(currentStep)}
      progress={showProgress ? getProgress(currentStep) : 0}
      showSkip={showSkip}
      onSkip={handleSkip}
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
          onResendOTP={handleResendOTP}
          isLoading={isLoading.verifyOTP}
          error={error.verifyOTP}
          otpAttempts={otpAttempts}
          maxOtpAttempts={maxOtpAttempts}
          resendAttempts={resendAttempts}
          maxResendAttempts={maxResendAttempts}
          invalidOtpError={invalidOtpError}
        />
      )}

      {currentStep === 'USER_INFO' && (
        <UserInfoScreen
          onSubmit={handleUpdateUserInfo}
          isLoading={isLoading.updateUserInfo}
          error={error.updateUserInfo}
          setCurrentStep={setCurrentStep}
        />
      )}

      {currentStep === 'GENDER_SELECTION' && (
        <GenderSelectionScreen
          onSubmit={handleGenderSelection}
          isLoading={isLoading.updateGenderSelection}
          error={error.updateGenderSelection}
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