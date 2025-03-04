module.exports = {
  name: "E-Prev",
  slug: "prova-vida",
  version: "1.0.0",
  orientation: "portrait",
  owner: "publixel",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  jsEngine: "hermes",
  plugins: [
    "expo-font",
    [
      "expo-image-picker",
      {
        photosPermission: "O aplicativo precisa acessar suas fotos para realizar a prova de vida",
        cameraPermission: "O aplicativo precisa acessar sua câmera para realizar a prova de vida"
      }
    ],
    [
      "expo-camera",
      {
        cameraPermission: "O aplicativo precisa acessar sua câmera para realizar a prova de vida"
      }
    ]
  ],
  splash: {
    backgroundColor: "#0284C7"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    buildNumber: "1.0",
    supportsTablet: true,
    bundleIdentifier: "com.publixelaplicativos.provavida",
    infoPlist: {
      NSCameraUsageDescription: "Este aplicativo precisa de acesso à câmera para tirar fotos para prova de vida.",
      NSPhotoLibraryUsageDescription: "Este aplicativo precisa de acesso às suas fotos para salvar as imagens da prova de vida.",
      NSPhotoLibraryAddUsageDescription: "Este aplicativo precisa de acesso às suas fotos para salvar as imagens da prova de vida.",
      NSMicrophoneUsageDescription: "Este aplicativo precisa de acesso ao microfone para gravar vídeos de prova de vida.",
      NSLocationWhenInUseUsageDescription: "Este aplicativo precisa de acesso à sua localização para a prova de vida.",
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
        NSAllowsLocalNetworking: true
      }
    }
  },
  android: {
    package: "com.publixelaplicativos.provavida",
    versionCode: 2,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE"
    ]
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    eas: {
      projectId: "6baf8832-3784-4d07-9f75-937761157167"
    },
    DOMAIN_URL: "https://prova-vida-api.publixelaplicativos.com"
  }
};
