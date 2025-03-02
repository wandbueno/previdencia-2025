import axios from 'axios';
import { getAuthToken } from '@/utils/auth';

// Função para determinar a URL base da API
function getBaseUrl() {
  // Primeiro, tenta usar a variável de ambiente definida
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Em produção, assumir que a API está na mesma origem que o frontend
  if (import.meta.env.PROD) {
    const origin = window.location.origin;
    return `${origin}/api`;
  }
  
  // Em desenvolvimento, usar localhost
  return 'http://localhost:3000/api';
}

export const api = axios.create({
  baseURL: getBaseUrl(),
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Handle unauthorized/forbidden errors
      console.error('Authentication error:', error.response?.data?.message);
    }
    return Promise.reject(error);
  }
);