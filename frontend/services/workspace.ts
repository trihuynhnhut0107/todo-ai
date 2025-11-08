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
  try {
    return await api.get(`/workspaces/${id}`);
  } catch (error) {
    return mockWorkspaces.find((wp) => wp.id === id);
  }
};

export const createWorkspace = async (payload: WorkspacePayload) => {
  try {
    return await api.post(`/workspaces`, payload);
  } catch (err) {
    return mockWorkspaces[0];
  }
};
