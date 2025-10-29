import { mockUser } from "@/lib/mock/auth";
import { User } from "@/type";

export async function signUp(name: string, email: string, password: string) {
  throw new Error("signUp not implemented");
}

export async function signIn(
  email: string,
  password: string
): Promise<User | null> {
  return mockUser;
  throw new Error("signIn not implemented");
}

export async function getUser(): Promise<User | null> {
  return mockUser;
  throw new Error("getUser not implemented");
}

export async function signOut() {
  return true;
}
