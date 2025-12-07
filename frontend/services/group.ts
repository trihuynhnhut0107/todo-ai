import api from "@/lib/api";
import { mockWorkspaces } from "@/lib/mock/workspace";
import { Group, GroupMember, GroupPayload } from "@/types/group";

import { DateTimeType } from "@howljs/calendar-kit";

export const getGroups = async (): Promise<Group[]> => {
  try {
    return await api.get(`/workspaces`);
  } catch (error) {
    return mockWorkspaces;
  }
};

export const getGroup = async (id: string): Promise<Group | undefined> => {
  return await api.get(`/workspaces/${id}`);
};

export const getGroupMember = async (id: string): Promise<GroupMember[]> => {
  return await api.get(`/workspaces/${id}/members`);
};

export const addGroupMember = async ({
  id,
  payload,
}: {
  id: string;
  payload: {
    userIds: string[];
  };
}) => {
  return await api.post(`/workspaces/${id}/members`, payload);
};

export const deleteGroupMember = async ({
  id,
  payload,
}: {
  id: string;
  payload: {
    userId: string;
  };
}) => {
  return await api.delete(`/workspaces/${id}/members`, { data: payload });
};

export const createGroup = async (payload: GroupPayload) => {
  return await api.post(`/workspaces`, payload);
};

export const updateGroup = async ({
  id,
  payload,
}: {
  id: string;
  payload: GroupPayload;
}) => {
  return await api.put(`/workspaces/${id}`, payload);
};

export const deleteGroup = async (id: string): Promise<void> => {
  return await api.delete(`/workspaces/${id}`);
};

export const leaveGroup = async (id: string): Promise<void> => {
  return await api.post(`/workspaces/${id}/leave`);
};
