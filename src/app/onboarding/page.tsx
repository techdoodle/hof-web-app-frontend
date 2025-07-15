'use client';

import { useOnboarding } from '@/modules/onboarding/hooks/useOnboarding';
import { OnboardingContainer } from '@/modules/onboarding/components/OnboardingContainer';
import { WelcomeScreen } from '@/modules/onboarding/components/WelcomeScreen';
import { LoginScreen } from '@/modules/onboarding/components/LoginScreen';
import { OTPVerificationScreen } from '@/modules/onboarding/components/OTPVerificationScreen';
import { UserInfoScreen } from '@/modules/onboarding/components/UserInfoScreen';
import { ProfileSetupScreen } from '@/modules/onboarding/components/ProfileSetupScreen';
import { OnboardingStep, UserData } from '@/modules/onboarding/types';
import { useRouter } from 'next/navigation';
import { GenderSelectionScreen } from '@/modules/onboarding/components/GenderSelectionScreen';
import { PositionSelectionScreen } from '@/modules/onboarding/components/PositionSelectionScreen';
import { TeamSelectionScreen } from '@/modules/onboarding/components/TeamSelectionScreen';
import { useQueryClient } from '@tanstack/react-query';
import { useOnboardingTracking } from '@/hooks/useOnboardingTracking';

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
    handlePositionSelection,
    handleTeamSelection,
    otpAttempts,
    maxOtpAttempts,
    handleResendOTP,
    resendAttempts,
    maxResendAttempts,
    invalidOtpError,
  } = useOnboarding();
  const queryClient = useQueryClient();
  const userData = queryClient.getQueryData(['user']);
  const { trackOnboardingSkipped, trackStepCompleted } = useOnboardingTracking();
  
  console.log("userData", userData);
  // Only show progress bar and skip after OTP
  const showProgress = currentStep === 'USER_INFO' || currentStep === 'GENDER_SELECTION' || currentStep === 'PROFILE_SETUP' || currentStep === 'POSITION_SELECTION' || currentStep === 'TEAM_SELECTION';
  const showSkip = showProgress;
  // Show back button for all steps after LOGIN, except USER_INFO (first form after OTP)
  const showBackButton = currentStep !== 'WELCOME' && currentStep !== 'LOGIN' && currentStep !== 'USER_INFO';

  const getProgress = (step: OnboardingStep): number => {
    const steps: OnboardingStep[] = [
      'WELCOME',
      'LOGIN',
      'OTP_VERIFICATION',
      'USER_INFO',
      'GENDER_SELECTION',
      'PROFILE_SETUP',
      'POSITION_SELECTION',
      'TEAM_SELECTION',
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
      case 'POSITION_SELECTION':
        return 'Position';
      case 'TEAM_SELECTION':
        return 'Team';
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
      'POSITION_SELECTION',
      'TEAM_SELECTION',
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSkip = () => {
    // Track skip event
    console.log('Onboarding skipped at step:', currentStep);
    
    // Track the skip event with current progress
    trackOnboardingSkipped(currentStep, getProgress(currentStep));
    
    // Optional: Send analytics event
    // analytics.track('onboarding_skipped', {
    //   step: currentStep,
    //   progress: getProgress(currentStep),
    //   timestamp: new Date().toISOString()
    // });
    
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
      fullBleed={currentStep === 'WELCOME'} // <-- only for welcome screen
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
          userData={userData as UserData}
        />
      )}

      {currentStep === 'GENDER_SELECTION' && (
        <GenderSelectionScreen
          onSubmit={handleGenderSelection}
          isLoading={isLoading.updateGenderSelection}
          error={error.updateGenderSelection}
          userData={userData as UserData}
        />
      )}

      {currentStep === 'PROFILE_SETUP' && (
        <ProfileSetupScreen
          onSubmit={handleUploadProfilePicture}
          onFinish={() => setCurrentStep('POSITION_SELECTION')}
          isLoading={isLoading.uploadProfilePicture}
          error={error.uploadProfilePicture}
          userData={userData as UserData}
        />
      )}

      {currentStep === 'POSITION_SELECTION' && (
        <PositionSelectionScreen
          onSubmit={handlePositionSelection}
          isLoading={isLoading.updatePositionSelection}
          error={error.updatePositionSelection}
          userData={userData as UserData}
        />
      )}

      {currentStep === 'TEAM_SELECTION' && (
        <TeamSelectionScreen
          onSubmit={handleTeamSelection}
          isLoading={isLoading.updateTeamSelection}
          error={error.updateTeamSelection}
          userData={userData as UserData}
        />
      )}
    </OnboardingContainer>
  );
} 