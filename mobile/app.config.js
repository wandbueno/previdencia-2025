export default {
  "name": "E-Prev",
  "slug": "prova-vida",
  "version": "1.0.0",
  "orientation": "portrait",
  "icon": "./assets/icon.png",
  "userInterfaceStyle": "light",
  "jsEngine": "hermes",
  "splash": {
    "backgroundColor": "#0284C7"
  },
  "assetBundlePatterns": [
    "**/*"
  ],
  "ios": {
    "supportsTablet": true,
    "bundleIdentifier": "com.publixelaplicativos.provavida"
  },
  "android": {
    "package": "com.publixelaplicativos.provavida",
    "versionCode": 2,
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#ffffff"
    }
  },
  "web": {
    "favicon": "./assets/favicon.png"
  },
  "extra": {
    "eas": {
      "projectId": "6baf8832-3784-4d07-9f75-937761157167"
    },
    "DOMAIN_URL": "https://prova-vida-api.publixelaplicativos.com"
  }
};
