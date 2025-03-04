// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

// Modificação para resolver problemas com módulos nativos
const config = {
  ...defaultConfig,
  // Evitando a tentativa de acessar o módulo 'os'
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: [...defaultConfig.resolver.sourceExts, 'mjs']
  }
};

module.exports = config;
