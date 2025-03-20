const { getDefaultConfig } = require('@expo/metro-config')

const config = getDefaultConfig(__dirname)

// Remove 'os' from the list of Node.js core modules that Metro tries to polyfill
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  os: null
}

module.exports = config
