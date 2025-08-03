import axios from 'axios';
import { getAccessToken, getRefreshToken, storeAuthData, clearAuthData } from './utils/auth';

const api = axios.create({
  // baseURL: 'https://hof-web-app-backend-production.up.railway.app',
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://hof-web-app-backend-production.up.railway.app',
  withCredentials: true,
  // baseURL: 'http://localhost:8000',
});

api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, { refreshToken });
          storeAuthData(res.data); // assumes res.data has new tokens and user data
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          clearAuthData();
          window.location.href = '/onboarding'; // or your login route
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to fetch player spider chart stats
export async function fetchPlayerSpiderChart(playerId: number) {
  const response = await api.get(`/match-participant-stats/player/${playerId}/spider-chart`);
  return response.data;
}

export default api; 