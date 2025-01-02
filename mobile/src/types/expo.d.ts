declare module 'expo-constants' {
  interface ExpoConfig {
    debuggerHost?: string;
    logUrl?: string;
    developer?: {
      tool?: string;
    };
  }

  interface Constants {
    manifest2?: {
      extra?: {
        expoGo?: {
          debuggerHost?: string;
        };
      };
    };
    manifest?: ExpoConfig | null;
  }

  const Constants: Constants;
  export default Constants;
}