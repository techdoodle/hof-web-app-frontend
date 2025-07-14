import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OnboardingRepository } from '../repository/onboarding.repository';
import { OnboardingStep, UserInfo } from '../types';
import { storeAuthData } from '@/lib/utils/auth';
import { getAccessToken } from '@/lib/utils/auth';
import { getUser } from '@/lib/utils/auth';
import { useRouter } from 'next/navigation';

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('WELCOME');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [token, setToken] = useState('');
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
      if (user.onboardingComplete) {
        router.replace('/landing');
      } else {
        setCurrentStep('USER_INFO');
      }
    }
  }, [router]);

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
      }
      // Save user info in React Query cache
      queryClient.setQueryData(['user'], userData);
    },
  });

  const updateUserInfoMutation = useMutation({
    mutationFn: (userInfo: UserInfo) => repository.updateUserInfo(userInfo, token),
    onSuccess: () => {
      setCurrentStep('PROFILE_SETUP');
    },
  });

  const uploadProfilePictureMutation = useMutation({
    mutationFn: (file: File) => repository.uploadProfilePicture(file, token),
  });

  const handleRequestOTP = async (otp: string) => {
    await requestOTPMutation.mutateAsync(otp);
  };

  const handleVerifyOTP = async (otp: string) => {
    await verifyOTPMutation.mutateAsync({ iv: requestOTPData?.iv || '', encryptedOtp: requestOTPData?.encryptedOtp || '', mobile: phoneNumber, otp });
  };

  const handleUpdateUserInfo = async (userInfo: UserInfo) => {
    await updateUserInfoMutation.mutateAsync(userInfo);
  };

  const handleUploadProfilePicture = async (file: File) => {
    return await uploadProfilePictureMutation.mutateAsync(file);
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
    isLoading: {
      requestOTP: requestOTPMutation.isPending,
      verifyOTP: verifyOTPMutation.isPending,
      updateUserInfo: updateUserInfoMutation.isPending,
      uploadProfilePicture: uploadProfilePictureMutation.isPending,
    },
    error: {
      requestOTP: requestOTPMutation.error,
      verifyOTP: verifyOTPMutation.error,
      updateUserInfo: updateUserInfoMutation.error,
      uploadProfilePicture: uploadProfilePictureMutation.error,
    },
    handleRequestOTP,
    handleVerifyOTP,
    handleUpdateUserInfo,
    handleUploadProfilePicture,
    otpAttempts,
    maxOtpAttempts,
    handleResendOTP,
    resendAttempts,
    maxResendAttempts,
    invalidOtpError,
  };
} 