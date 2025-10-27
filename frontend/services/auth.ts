export async function signUp(name: string, email: string, password: string) {
  return { name: "user", email: "user@gmail.com", avatar: "" };
}

export async function signIn(email: string, password: string) {
  return { name: "user", email: "user@gmail.com", avatar: "" };
}

export async function getUser() {
  return { name: "user", email: "user@gmail.com", avatar: "" };
}

export async function signOut() {
  return true;
}
