import api from '../../../lib/api';
import { UserInfo, UserData } from '../types';


export class OnboardingRepository {
  private static instance: OnboardingRepository;
  private constructor() {
  }

  static getInstance(): OnboardingRepository {
    if (!OnboardingRepository.instance) {
      OnboardingRepository.instance = new OnboardingRepository();
    }
    return OnboardingRepository.instance;
  }

  async requestOTP(phoneNumber: string): Promise<{ iv: string, encryptedOtp: string, mobile: string | number }> {
    const response = await api.post(`/auth/send-otp`, {
      "mobile": phoneNumber,
    });
    return response.data;
  }

  async verifyOTP(
    mobile: string | number,
    iv: string,
    encryptedOtp: string,
    otp: string
  ): Promise<UserData> {
    const response = await api.post(`/auth/verify-otp`, {
      mobile,
      iv,
      encryptedOtp,
      otp,
    });
    console.log(" verifyOTP response.data", response.data);
    return response.data;
  }

  async updateUserInfo(userInfo: UserInfo, token: string): Promise<{ success: boolean }> {
    const response = await api.post(
      `/users/profile`,
      userInfo,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }

  async uploadProfilePicture(file: File, token: string): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(
      `/users/profile/picture`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
} 