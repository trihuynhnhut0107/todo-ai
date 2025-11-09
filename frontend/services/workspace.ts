import api from "@/lib/api";
import { mockWorkspaces } from "@/lib/mock/workspace";
import { Workspace, WorkspacePayload } from "@/types/workspace";

import { DateTimeType } from "@howljs/calendar-kit";

export const getWorkspaces = async (): Promise<Workspace[]> => {
  try {
    return await api.get(`/workspaces`);
  } catch (error) {
    return mockWorkspaces;
  }
};

export const getWorkspace = async (
  id: string
): Promise<Workspace | undefined> => {
  return await api.get(`/workspaces/${id}`);
};

export const getWorkspaceMember = async (
  id: string
): Promise<Workspace | undefined> => {
  return await api.get(`/workspaces/${id}/members`);
};

export const addWorkspaceMember = async ({
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

export const deleteWorkspaceMember = async ({
  id,
  payload,
}: {
  id: string;
  payload: {
    userIds: string[];
  };
}) => {
  return await api.delete(`/workspaces/${id}/members`, { data: payload });
};

export const createWorkspace = async (payload: WorkspacePayload) => {
  return await api.post(`/workspaces`, payload);
};

export const updateWorkspace = async ({
  id,
  payload,
}: {
  id: string;
  payload: WorkspacePayload;
}) => {
  return await api.put(`/workspaces/${id}`, payload);
};

export const deleteWorkspace = async (id: string): Promise<void> => {
  return await api.delete(`/workspaces/${id}`);
};
