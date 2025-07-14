import axios from 'axios';
import { getAccessToken, getRefreshToken, storeAuthData, clearAuthData } from './utils/auth';

const api = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:8000',
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

export default api; 