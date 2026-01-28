import axios from 'axios';
import { TOKEN_KEY } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout for all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Guard to prevent multiple concurrent auth error redirects
let isRedirecting = false;

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (!isRedirecting) {
        isRedirecting = true;
        localStorage.removeItem(TOKEN_KEY);
        // Full page reload on auth error is intentional to clear all state
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
