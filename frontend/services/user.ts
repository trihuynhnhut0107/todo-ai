import api from "@/lib/api";
import { UserProfile, UserProfilePayload } from "@/types/user";

export const updateProfile = async ({
  id,
  payload,
}: {
  id: string;
  payload: UserProfilePayload;
}) => {
  return await api.put(`/users/${id}`, payload);
};

export const getUsers = async (): Promise<{
  limit: number;
  page: number;
  total: number;
  totalPage: number;
  users: UserProfile[];
}> => {
  return await api.get("/users");
};

export const getUserById = async (
  id: string
): Promise<UserProfile | undefined> => {
  return await api.get(`/events/${id}`);
};
