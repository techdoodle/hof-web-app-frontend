import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { OnboardingRepository } from '../repository/onboarding.repository';
import { OnboardingStep, UserInfo } from '../types';

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('WELCOME');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [token, setToken] = useState('');
  const [requestOTPData, setRequestOTPData] = useState<{ iv: string, encryptedOtp: string, mobile: string | number } | null>(null);

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
      setToken(data.token);
      setRequestOTPData(null);
      setCurrentStep('USER_INFO');
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

  const handleRequestOTP = async (phone: string) => {
    setPhoneNumber(phone);
    await requestOTPMutation.mutateAsync(phone);
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
  };
} 