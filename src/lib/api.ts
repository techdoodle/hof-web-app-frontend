import axios from 'axios';
import { getAccessToken, getRefreshToken, storeAuthData, clearAuthData } from './utils/auth';

let environment = process.env.NODE_ENV;
let deploymentEnv = process.env.NEXT_PUBLIC_DEPLOYMENT_ENV || process.env.DEPLOYMENT_ENV;
let baseURL = '';

console.log("environment DEBUG", environment, "deployment:", deploymentEnv);

if (environment === 'development') {
  baseURL = 'http://localhost:8000';
} else if (deploymentEnv === 'staging') {
  baseURL = 'https://hof-web-app-backend-staging.up.railway.app';
} else {
  // Default to production for any production build
  baseURL = 'https://hof-web-app-backend-production.up.railway.app';
}

const api = axios.create({
  baseURL: baseURL,
  // baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://hof-web-app-backend-production.up.railway.app',
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
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
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

// Helper function to fetch user match participants
export async function fetchUserMatchParticipants(userId: number) {
  const response = await api.get(`/match-participants/user/${userId}`);
  return response.data;
}

export async function fetchUserMatchStats(playerId: number, matchId: string | number) {
  const response = await api.get(`/match-participant-stats/player/${playerId}/match/${matchId}`);
  return response.data;
}

export async function fetchLeaderBoard(page: number = 1, limit: number = 20) {
  const response = await api.get(`/match-participant-stats/leaderboard/overall?limit=${limit}&page=${page}`);
  console.log("leaderboard", response, response.data);
  return response.data;
}

export default api; 