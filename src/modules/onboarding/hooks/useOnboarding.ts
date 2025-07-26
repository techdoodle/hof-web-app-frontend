import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OnboardingRepository } from '../repository/onboarding.repository';
import { OnboardingStep, UserInfo, GenderSelection, PositionSelection, TeamSelection } from '../types';
import { storeAuthData } from '@/lib/utils/auth';
import { getAccessToken } from '@/lib/utils/auth';
import { getUser } from '@/lib/utils/auth';
import { useRouter } from 'next/navigation';

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('LOGIN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  const [requestOTPData, setRequestOTPData] = useState<{ iv: string, encryptedOtp: string, mobile: string | number } | null>(null);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const maxOtpAttempts = 3;
  const [resendAttempts, setResendAttempts] = useState(0);
  const maxResendAttempts = 2;
  const [invalidOtpError, setInvalidOtpError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();

  // Persist login state across refreshes
  useEffect(() => {
    const token = getAccessToken();
    const user = getUser();
    
    if (token && user) {
      setToken(token);
      setUserId(user.id);
      
      // Refresh user data from server on page load
      const refreshUserData = async () => {
        try {
          console.log('Refreshing user data from /auth/me...');
          const repository = OnboardingRepository.getInstance();
          const freshUserData = await repository.getCurrentUser();
          
          // Update local storage with fresh data
          localStorage.setItem('user', JSON.stringify(freshUserData));
          queryClient.setQueryData(['user'], freshUserData);
          
          // Check onboarding status with fresh data
          console.log('Fresh user data:', { 
            id: freshUserData.id, 
            onboardingComplete: freshUserData.onboardingComplete 
          });
          
          if (freshUserData.onboardingComplete) {
            console.log('Onboarding complete, redirecting to landing...');
            router.replace('/landing');
          } else {
            console.log('Onboarding not complete, starting from USER_INFO...');
            setCurrentStep('USER_INFO');
          }
        } catch (error) {
          console.error('Failed to refresh user data:', error);
          
          // Fallback to cached data
          console.log('Using cached user data as fallback...');
          if (user.onboardingComplete) {
            console.log('Cached data shows onboarding complete, redirecting to landing...');
            router.replace('/landing');
          } else {
            console.log('Cached data shows onboarding not complete, starting from USER_INFO...');
            setCurrentStep('USER_INFO');
          }
        }
      };
      
      refreshUserData();
    } else {
      console.log('No token or user found, staying on current step');
    }
  }, [router, queryClient]);

  const repository = OnboardingRepository.getInstance();

  const requestOTPMutation = useMutation({
    mutationFn: (phone: string) => repository.requestOTP(phone),
    onSuccess: (data) => {
      console.log(data);
      setRequestOTPData(data);
      setCurrentStep('OTP_VERIFICATION');
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: ({ iv, encryptedOtp, mobile, otp }: { iv: string, encryptedOtp: string, mobile: string, otp: string }) =>
      repository.verifyOTP(mobile, iv, encryptedOtp, otp),
    onSuccess: (data) => {
      if (data.valid === false) {
        setOtpAttempts((prev) => prev + 1);
        setInvalidOtpError((data as any)?.message || 'Invalid OTP');
        return;
      }
      setOtpAttempts(0); // reset on success
      setRequestOTPData(null);
      setCurrentStep('USER_INFO');
      setInvalidOtpError(null);
      // Store tokens and user data
      const { accessToken, refreshToken, ...userData } = data;
      if (accessToken && refreshToken) {
        storeAuthData({ accessToken, refreshToken, ...userData });
        setToken(accessToken);
        setUserId(userData.id);
      }
      // Save user info in React Query cache
      queryClient.setQueryData(['user'], userData);
    },
  });

  const updateUserInfoMutation = useMutation({
    mutationFn: (userInfo: UserInfo) => {
      if (!userId || !token) {
        throw new Error('User ID or token not available');
      }
      return repository.updateUserInfo(userInfo, userId, token);
    },
    onSuccess: (data) => {
      console.log("updateUserInfoMutation", data);
      setCurrentStep('GENDER_SELECTION');
    },
    onError: (error) => {
      console.error("updateUserInfoMutation error", error);
    },
  });

  const updateGenderSelectionMutation = useMutation({
    mutationFn: (genderData: GenderSelection & { profilePicture?: string }) => {
      if (!userId || !token) {
        throw new Error('User ID or token not available');
      }
      return repository.updateGenderSelection(genderData, userId, token);
    },
    onSuccess: (data) => {
      console.log("updateGenderSelectionMutation", data);
      queryClient.setQueryData(['user'], data);
      setCurrentStep('PROFILE_SETUP');
    },
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: (file: File) => {
      if (!token) {
        throw new Error('Token not available');
      }
      return repository.uploadProfilePicture(file, token);
    },
  });

  const updatePositionSelectionMutation = useMutation({
    mutationFn: (positionData: PositionSelection) => {
      if (!userId || !token) {
        throw new Error('User ID or token not available');
      }
      return repository.updatePositionSelection(positionData, userId, token);
    },
    onSuccess: (data) => {
      console.log("updatePositionSelectionMutation", data);
      queryClient.setQueryData(['user'], data);
      setCurrentStep('TEAM_SELECTION');
    },
  });

  const updateTeamSelectionMutation = useMutation({
    mutationFn: (teamData: TeamSelection) => {
      if (!userId || !token) {
        throw new Error('User ID or token not available');
      }
      return repository.updateTeamSelection(teamData, userId, token);
    },
    onSuccess: (data) => {
      console.log("updateTeamSelectionMutation", data);
      queryClient.setQueryData(['user'], data);
      
      // Track onboarding completion
      console.log('Onboarding completed successfully');
      
      // Optional: Send analytics event
      // analytics.track('onboarding_completed', {
      //   userId: userId,
      //   completedAt: new Date().toISOString(),
      //   totalSteps: 8,
      //   method: 'full_completion'
      // });
      
      // Complete onboarding flow
      router.push('/profile');
    },
  });

  const handleRequestOTP = async (otp: string) => {
    setPhoneNumber(otp);
    await requestOTPMutation.mutateAsync(otp);
  };

  const handleVerifyOTP = async (otp: string) => {
    await verifyOTPMutation.mutateAsync({ iv: requestOTPData?.iv || '', encryptedOtp: requestOTPData?.encryptedOtp || '', mobile: phoneNumber, otp });
  };

  const handleUpdateUserInfo = async (userInfo: UserInfo) => {
    console.log("handleUpdateUserInfo", userInfo);
    await updateUserInfoMutation.mutateAsync(userInfo).then((data) => {
      console.log("updateUserInfoMutation data", data);
      queryClient.setQueryData(['user'], data);
      setCurrentStep('GENDER_SELECTION');
    });
  };

  const handleGenderSelection = async (genderData: GenderSelection & { profilePicture?: string }) => {
    await updateGenderSelectionMutation.mutateAsync(genderData).then((data) => {
      console.log("updateGenderSelectionMutation data", data);
      queryClient.setQueryData(['user'], data);
      setCurrentStep('POSITION_SELECTION');
    });
  };

  const handleUploadProfilePicture = async (file: File) => {
    return await uploadProfilePictureMutation.mutateAsync(file);
  };

  const handlePositionSelection = async (positionData: PositionSelection) => {
    await updatePositionSelectionMutation.mutateAsync(positionData).then((data) => {
      console.log("updatePositionSelectionMutation data", data);
      queryClient.setQueryData(['user'], data);
      setCurrentStep('TEAM_SELECTION');
    });
  };

  const handleTeamSelection = async (teamData: TeamSelection) => {
    await updateTeamSelectionMutation.mutateAsync(teamData).then((data) => {
      console.log("updateTeamSelectionMutation data", data);
      queryClient.setQueryData(['user'], data);
      // Complete onboarding - redirect to profile
      router.push('/profile');
    });
  };

  const handleResendOTP = async () => {
    if (resendAttempts >= maxResendAttempts) return;
    await requestOTPMutation.mutateAsync(phoneNumber);
    setOtpAttempts(0); // reset attempts on resend
    setResendAttempts((prev) => prev + 1);
  };

  return {
    currentStep,
    setCurrentStep,
    phoneNumber,
    userId,
    isLoading: {
      requestOTP: requestOTPMutation.isPending,
      verifyOTP: verifyOTPMutation.isPending,
      updateUserInfo: updateUserInfoMutation.isPending,
      updateGenderSelection: updateGenderSelectionMutation.isPending,
      uploadProfilePicture: uploadProfilePictureMutation.isPending,
      updatePositionSelection: updatePositionSelectionMutation.isPending,
      updateTeamSelection: updateTeamSelectionMutation.isPending,
    },
    error: {
      requestOTP: requestOTPMutation.error,
      verifyOTP: verifyOTPMutation.error,
      updateUserInfo: updateUserInfoMutation.error,
      updateGenderSelection: updateGenderSelectionMutation.error,
      uploadProfilePicture: uploadProfilePictureMutation.error,
      updatePositionSelection: updatePositionSelectionMutation.error,
      updateTeamSelection: updateTeamSelectionMutation.error,
    },
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
  };
} 