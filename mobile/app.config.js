const { getDefaultConfig } = require("@expo/config");

module.exports = {
  name: "Prova de Vida",
  slug: "provavida",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./src/assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./src/assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    bundleIdentifier: "com.provavida.app",
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription: "Este aplicativo precisa de acesso à câmera para tirar fotos para prova de vida.",
      NSPhotoLibraryUsageDescription: "Este aplicativo precisa de acesso às suas fotos para salvar as imagens da prova de vida.",
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
        NSAllowsLocalNetworking: true
      }
    }
  },
  android: {
    package: "com.provavida.app",
    adaptiveIcon: {
      foregroundImage: "./src/assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE"
    ],
    softwareKeyboardLayoutMode: "resize",
    compileSdkVersion: 33,
    targetSdkVersion: 33,
    minSdkVersion: 21,
    versionCode: 1
  },
  plugins: [
    "expo-font",
    [
      "expo-image-picker",
      {
        photosPermission: "A aplicação precisa de acesso à galeria de fotos para a prova de vida.",
        cameraPermission: "A aplicação precisa de acesso à câmera para a prova de vida."
      }
    ],
    [
      "expo-camera",
      {
        cameraPermission: "O aplicativo precisa de acesso à câmera para realizar a prova de vida."
      }
    ]
  ],
  experiments: {
    tsconfigPaths: true
  },
  extra: {
    eas: {
      projectId: "6baf8832-3784-4d07-9f75-937761157167"
    }
  }
};
