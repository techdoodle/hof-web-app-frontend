import { OnboardingRepository } from '@/modules/onboarding/repository/onboarding.repository';

// Utility functions for authentication token and user data storage

export function storeAuthData({ accessToken, refreshToken, ...userData }: { accessToken: string, refreshToken: string, [key: string]: any }) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(userData));
}

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

export function getUser(): any {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function clearAuthData() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function updateUserData(userData: any) {
  localStorage.setItem('user', JSON.stringify(userData));
}

export async function refreshUserData(): Promise<any> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No access token available');
  }

  try {
    const repository = OnboardingRepository.getInstance();
    const userData = await repository.getCurrentUser();
    updateUserData(userData);
    return userData;
  } catch (error) {
    console.error('Failed to refresh user data:', error);
    throw error;
  }
} 