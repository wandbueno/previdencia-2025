/**
 * Arquivo de configurações globais do aplicativo
 * Centraliza constantes e configurações que podem variar entre ambientes
 */

// Configurações da aplicação
export const APP = {
  // Versão do aplicativo (atualizar manualmente a cada release)
  VERSION: '1.0.1',
  // Nome do aplicativo
  NAME: 'E-Prev',
  // Organização responsável
  ORGANIZATION: 'Instituto de Previdência'
};

// Configurações da API
export const API = {
  // URL base da API em produção
  BASE_URL: 'https://api.e-prev.com.br/api',
  // URL base da API em desenvolvimento (substituído dinamicamente pelo script de inicialização)
  DEV_URL: 'http://192.168.15.150:3000/api',
  // Timeout padrão para requisições (em ms)
  TIMEOUT: 30000,
  // Versão da API
  VERSION: 'v1'
};

// Configurações de timeout para operações
export const TIMEOUTS = {
  // Tempo de exibição da tela de splash (em ms)
  SPLASH_SCREEN: 2500,
  // Tempo para expiração do token (em ms)
  TOKEN_EXPIRATION: 3600000, // 1 hora
  // Tempo para auto-logout por inatividade (em ms)
  AUTO_LOGOUT: 1800000 // 30 minutos
};

// Configurações de armazenamento local
export const STORAGE = {
  // Chave para armazenamento do token de autenticação
  AUTH_TOKEN: '@e-prev:auth-token',
  // Chave para armazenamento dos dados do usuário
  USER_DATA: '@e-prev:user-data',
  // Chave para armazenamento da organização selecionada
  ORGANIZATION: '@e-prev:organization'
};

// Função para obter a URL da API baseada no ambiente
export const getApiUrl = (): string => {
  // Em uma aplicação real, isso poderia verificar o ambiente (DEV, STAGING, PROD)
  // Por enquanto, usamos apenas a URL de desenvolvimento
  return API.DEV_URL;
};

// Exportar todas as configurações em um único objeto
export default {
  APP,
  API,
  TIMEOUTS,
  STORAGE,
  getApiUrl
};
