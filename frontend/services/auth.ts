import api from "@/lib/api";
import { mockUser } from "@/lib/mock/auth";
import { User } from "@/types/auth";

export async function signUp(name: string, email: string, password: string) {
  try {
    return await api.post(`api/auth/register`, { name, email, password });
  } catch (error) {
    throw new Error("signUp not implemented");
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<User | null> {
  try {
    return await api.post(`api/auth/login`, { email, password });
  } catch (error) {
    return mockUser;
  }
}

export async function getUser(): Promise<User | null> {
  try {
    return await api.get(`/api/auth/me`);
  } catch (error) {
    return mockUser;
  }
}

export async function getToken(refreshToken: string): Promise<string> {
  try {
    return await api.post(`api/auth/refresh`, { refreshToken });
  } catch (error) {
    return "legit-token";
  }
}
export async function signOut() {
  return true;
}
