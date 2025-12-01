import axios from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from "@/store/storage";
import { navigate } from "expo-router/build/global-state/routing";
import { showMessage } from "react-native-flash-message";
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });

    const newAccessToken = res.data?.data?.accessToken;
    if (!newAccessToken) throw new Error("No access token returned");

    saveAccessToken(newAccessToken);

    return newAccessToken;
  } catch {
    clearTokens();
    navigate("/(auth)/sign-in");
    return null;
  }
}

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

api.interceptors.response.use(
  (response) => response.data.data,
  async (error) => {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();

      if (newToken) {
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api.request(error.config); // ✅ retry original request
      }
    }
    showMessage({
      message: error.message,
      type: "danger",
    });
    return Promise.reject(error);
    // return Promise.reject(error);
  }
);

export default api;
