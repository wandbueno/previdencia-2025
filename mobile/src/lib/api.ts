import axios from 'axios';
import Constants from 'expo-constants';
import { API_URL_PRODUCTION } from '@/config';

// Obtém o IP do host de desenvolvimento
const debuggerHost = Constants.manifest2?.extra?.expoGo?.debuggerHost;
const localIp = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';

// Flag para forçar o uso da API de produção mesmo em desenvolvimento (para testes)
const FORCE_PRODUCTION_API = true;

// Configuração da API
const API_URL = FORCE_PRODUCTION_API 
  ? API_URL_PRODUCTION 
  : (__DEV__ 
      ? `http://${localIp}:3000/api` // Para desenvolvimento local
      : API_URL_PRODUCTION); // URL configurada no arquivo config para produção

// Log para debug
if (__DEV__) {
  console.log('\n[API] Configuração:');
  console.log('- debuggerHost:', debuggerHost);
  console.log('- localIp:', localIp);
  console.log('- baseURL:', API_URL);
  console.log('- forçando produção:', FORCE_PRODUCTION_API);
  console.log('- URL produção:', API_URL_PRODUCTION);
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Aumentando o timeout para dar mais tempo para a API responder
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
        baseURL: config.baseURL,
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

// Interceptor de resposta para melhor log de erros
api.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log('\n[API] Resposta:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
    }
    return response;
  },
  error => {
    if (__DEV__) {
      console.error('\n[API] Erro na resposta:', {
        message: error.message,
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        } : 'Sem resposta'
      });
    }
    return Promise.reject(error);
  }
);