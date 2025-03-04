/**
 * Arquivo de configurações globais do aplicativo
 * Centraliza valores que precisam ser atualizados em um único lugar
 */

// Configurações da aplicação
export const APP = {
  // Nome do aplicativo
  NAME: 'E-Prev'
};

// URL da API em produção
export const API_URL_PRODUCTION = 'https://previdencia-2025-plw27a.fly.dev/api';

// Configurações da API
export const API = {
  // URL base da API
  BASE_URL: API_URL_PRODUCTION,
  // Timeout para requisições (em milissegundos)
  TIMEOUT: 30000,
};

// Função para obter a URL da API de acordo com o ambiente
export const getApiUrl = () => {
  return API.BASE_URL;
};

// Exportar para facilitar a importação
export default {
  APP,
  API,
  API_URL_PRODUCTION,
  getApiUrl
};