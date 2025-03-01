import axios from 'axios';
import Constants from 'expo-constants';

// Obtém o IP do host de desenvolvimento
const debuggerHost = Constants.manifest2?.extra?.expoGo?.debuggerHost;
const localIp = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';

// Configuração da API
const API_URL = __DEV__ 
  ? `http://${localIp}:3000/api`
  : 'https://previdencia-2025-plw27a.fly.dev/api';

// Log para debug
if (__DEV__) {
  console.log('\n[API] Configuração:');
  console.log('- debuggerHost:', debuggerHost);
  console.log('- localIp:', localIp);
  console.log('- baseURL:', API_URL);
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Interceptor para debug
api.interceptors.request.use(
  config => {
    if (__DEV__) {
      console.log('\n[API] Requisição:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers
      });
    }
    return config;
  },
  error => {
    if (__DEV__) {
      console.error('\n[API] Erro na requisição:', error);
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log('\n[API] Resposta:', {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  error => {
    if (__DEV__) {
      console.error('\n[API] Erro na resposta:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    }
    return Promise.reject(error);
  }
);