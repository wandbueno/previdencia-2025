const { getDefaultConfig } = require('expo/metro-config')

module.exports = {
  name: 'E-Prev',
  slug: 'prova-vida',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0284C7'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    bundleIdentifier: 'com.provavida.app',
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription:
        'Este aplicativo precisa de acesso à câmera para tirar fotos para prova de vida.',
      NSPhotoLibraryUsageDescription:
        'Este aplicativo precisa de acesso às suas fotos para salvar as imagens da prova de vida.',
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
        NSAllowsLocalNetworking: true
      }
    }
  },
  android: {
    package: 'com.provavida.app',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.CAMERA',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_EXTERNAL_STORAGE'
    ],
    softwareKeyboardLayoutMode: 'resize',
    compileSdkVersion: 33,
    targetSdkVersion: 33,
    minSdkVersion: 21
  },
  plugins: [
    'expo-font',
    [
      'expo-image-picker',
      {
        photosPermission:
          'O aplicativo precisa de acesso à câmera para realizar a prova de vida.'
      }
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          'O aplicativo precisa de acesso à câmera para realizar a prova de vida.'
      }
    ]
  ],
  extra: {
    eas: {
      projectId: '6baf8832-3784-4d07-9f75-937761157167'
    }
  }
}
