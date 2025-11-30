import api from "@/lib/api";
import { saveAccessToken, saveRefreshToken } from "@/store/storage";
import { User } from "@/types/auth";

export async function signUp({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    const res = await api.post("/auth/register", { name, email, password });

    const { accessToken, refreshToken, user } = res as any;

    if (accessToken && refreshToken && user) {
      await saveAccessToken(accessToken);
      await saveRefreshToken(refreshToken);
      return user;
    }

    return null; // or throw an error if missing tokens/user
  } catch (error) {
    // Handle or rethrow error so UI can catch it
    throw error;
  }
}

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<User | null> {
  try {
    const res = await api.post("/auth/login", { email, password });

    const { accessToken, refreshToken, user } = res as any;

    if (accessToken && refreshToken && user) {
      await saveAccessToken(accessToken);
      await saveRefreshToken(refreshToken);
      return user;
    }

    return null; // or throw an error if missing tokens/user
  } catch (error) {
    // Handle or rethrow error so UI can catch it
    throw error;
  }
}

export async function getUser(): Promise<User | null> {
  return await api.get(`/auth/me`);
}

export async function getToken(refreshToken: string): Promise<string> {
  return await api.post(`/auth/refresh`, { refreshToken });
}
export async function signOut() {
  return true;
}
