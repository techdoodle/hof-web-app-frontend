import axios from 'axios';
import { getAccessToken, getRefreshToken, storeAuthData, clearAuthData } from './utils/auth';
import { API_CONFIG } from '@/config/api';

console.log('DEBUG: API_CONFIG', API_CONFIG);
console.log('DEBUG: API_CONFIG.baseURL', API_CONFIG.baseURL);
console.log('DEBUG: process.env', process.env);
console.log('DEBUG: window', window);
console.log('DEBUG: process.env.NEXT_PUBLIC_API_BASE_URL', process.env.NEXT_PUBLIC_API_BASE_URL);

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
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