import { ExpoConfig } from '@expo/config-types';

declare module 'expo-constants' {
  interface Constants {
    expoConfig?: ExpoConfig;
  }
}