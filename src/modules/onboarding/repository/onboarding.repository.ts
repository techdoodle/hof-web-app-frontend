import api from '../../../lib/api';
import { UserInfo, UserData, GenderSelection, PositionSelection, TeamSelection, FootballTeam } from '../types';
import { useQueryClient } from '@tanstack/react-query';


export class OnboardingRepository {
  private static instance: OnboardingRepository;
  private constructor() {
  }
  private queryClient = useQueryClient();

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

  async updateUserInfo(userInfo: any, userId: number, token: string): Promise<{ success: boolean }> {
    const response = await api.patch(
      `/users/${userId}`,
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
      `/users/profile-picture/upload`,
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

  async processProfilePictureBase64(imageData: string, token: string): Promise<{ url: string }> {
    const response = await api.post(
      `/users/profile-picture/process-base64`,
      { imageData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async processOnlyProfilePictureBase64(imageData: string, token: string): Promise<{ url: string }> {
    const response = await api.post(
      `/users/profile-picture/process-only-base64`,
      { imageData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async extractFaceFromImage(imageData: string, token: string): Promise<{ url: string }> {
    const response = await api.post(
      `/users/profile-picture/extract-face`,
      { imageData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async updateGenderSelection(genderData: GenderSelection & { profilePicture?: string }, userId: number, token: string): Promise<{ success: boolean }> {
    const response = await api.patch(
      `/users/${userId}`,
      genderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }

  async getCurrentUser(): Promise<UserData> {
    const response = await api.get(`/auth/me`);
    console.log(" getCurrentUser response.data", response.data);
    this.queryClient.setQueryData(['user'], response.data);
    return response.data;
  }

  async updatePositionSelection(positionData: PositionSelection, userId: number, token: string): Promise<{ success: boolean }> {
    const response = await api.patch(
      `/users/${userId}`,
      positionData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }

  async updateTeamSelection(teamData: TeamSelection, userId: number, token: string): Promise<{ success: boolean }> {
    const response = await api.patch(
      `/users/${userId}`,
      teamData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }

  async getTopTeams(limit: number = 9): Promise<FootballTeam[]> {
    const response = await api.get(`/football-teams/top?limit=${limit}`);
    return response.data;
  }

  async searchTeams(query: string): Promise<FootballTeam[]> {
    if (!query.trim()) {
      return [];
    }
    const response = await api.get(`/football-teams/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
} 