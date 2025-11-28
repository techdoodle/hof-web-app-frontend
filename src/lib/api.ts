import axios from 'axios';
import { getAccessToken, getRefreshToken, storeAuthData, clearAuthData } from './utils/auth';

let environment = process.env.NODE_ENV;
let deploymentEnv = process.env.NEXT_PUBLIC_DEPLOYMENT_ENV || process.env.DEPLOYMENT_ENV;
let baseURL = '';

console.log("environment DEBUG", environment, "deployment:", deploymentEnv);

if (environment === 'development') {
  baseURL = 'http://localhost:8000';
  // baseURL = 'https://hof-web-app-backend-production.up.railway.app';
  // baseURL = 'https://hof-web-app-backend-staging.up.railway.app';
} else if (deploymentEnv === 'staging') {
  baseURL = 'https://testapi.humansoffootball.in';
} else {
  // Default to production for any production build
  baseURL = 'https://api.humansoffootball.in';
  // baseURL = 'http://localhost:8000';
}

const api = axios.create({
  baseURL: baseURL,
  // baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://hof-web-app-backend-production.up.railway.app',
  withCredentials: true,
  timeout: 30000, // 30 second timeout for all requests
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

export async function fetchLeaderBoard(page: number = 1, limit: number = 20, filters: any) {
  const response = await api.get(`/match-participant-stats/leaderboard/overall?type=${filters?.type}&city=${filters?.city}&limit=${limit}&page=${page}`);
  console.log("leaderboard", response, response.data);
  return response.data;
}

export async function fetchNewLeaderBoard(
  page: number = 1,
  limit: number = 50,
  filters: { city?: string; position?: string; gender?: string; leaderboard_type?: string }
) {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', limit.toString());
  params.set('city', filters.city || 'all');
  params.set('position', filters.position || 'all');
  params.set('gender', filters.gender || 'male');
  params.set('type', filters.leaderboard_type || 'overall');

  const response = await api.get(`/leaderboard/overall?${params.toString()}`);
  return response.data;
}

export default api;

// Determine if the current user already has an active booking for a given match
export async function hasActiveBookingForMatch(matchId: number, userId: number) {
  try {
    const res = await api.get(`/bookings?userId=${userId}&status=CONFIRMED`);
    const bookings = res.data || [];
    return bookings.some((b: any) => {
      const bMatchId = Number(b.matchId ?? b.match_id);
      const slots = Array.isArray(b.slots) ? b.slots : [];
      return bMatchId === Number(matchId) && slots.some((s: any) => s.status === 'ACTIVE');
    });
  } catch {
    return false;
  }
}

// Fetch calibration status for the current user
export async function fetchCalibrationStatus() {
  const response = await api.get('/users/calibration-status');
  return response.data;
}