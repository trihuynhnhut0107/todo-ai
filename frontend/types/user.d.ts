export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface UserProfilePayload {
  name?: string;
  email?: string;
  role?: string;
}
