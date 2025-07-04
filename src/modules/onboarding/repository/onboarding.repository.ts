import axios from 'axios';
import { UserInfo } from '../types';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

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
    const response = await axios.post(`${API_BASE_URL}/auth/send-otp`, {
      "mobile": phoneNumber,
    });
    return response.data;
  }

  async verifyOTP(mobile: string | number, iv: string, encryptedOtp: string, otp: string): Promise<{ token: string }> {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
      mobile,
      iv,
      encryptedOtp,
      otp,
    });
    return response.data;
  }

  async updateUserInfo(userInfo: UserInfo, token: string): Promise<{ success: boolean }> {
    const response = await axios.post(
      `${API_BASE_URL}/users/profile`,
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

    const response = await axios.post(
      `${API_BASE_URL}/users/profile/picture`,
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