import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Web fallback using localStorage (less secure, but works on web)
const webStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    }
  },
  async deleteItemAsync(key: string): Promise<void> {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
  },
};

// Use SecureStore on native, localStorage on web
const storage = Platform.OS === "web" ? webStorage : SecureStore;

export async function saveRefreshToken(refreshToken: string) {
  await storage.setItemAsync("refreshToken", refreshToken);
}

export async function saveAccessToken(accessToken: string) {
  await storage.setItemAsync("accessToken", accessToken);
}

export async function getRefreshToken() {
  return await storage.getItemAsync("refreshToken");
}

export async function getAccessToken() {
  return await storage.getItemAsync("accessToken");
}

export async function clearTokens() {
  await storage.deleteItemAsync("accessToken");
  await storage.deleteItemAsync("refreshToken");
}
