import { Camera } from 'expo-camera';

export async function requestCameraPermission() {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
}

export async function getCameraPermission() {
  const { status } = await Camera.getCameraPermissionsAsync();
  return status === 'granted';
}