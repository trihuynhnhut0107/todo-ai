import * as SecureStore from "expo-secure-store";

export async function saveRefreshToken(refreshToken: string) {
  await SecureStore.setItemAsync("refreshToken", refreshToken);
}

export async function saveAccessToken(accessToken: string) {
  await SecureStore.setItemAsync("accessToken", accessToken);
}

export async function getRefreshToken() {
  return await SecureStore.getItemAsync("refreshToken");
}

export async function getAccessToken() {
  return await SecureStore.getItemAsync("accessToken");
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
}
