// API Configuration
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 
           (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
             ? 'http://localhost:8000' 
             : 'https://your-backend-domain.com'), // Replace with your actual production API URL
};

// Debug logging
if (typeof window !== 'undefined') {
  console.log('API Config:', API_CONFIG);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('API Base URL from env:', process.env.NEXT_PUBLIC_API_BASE_URL);
} 