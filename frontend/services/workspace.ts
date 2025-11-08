import api from "@/lib/api";
import { mockWorkspaces } from "@/lib/mock/workspace";
import { Workspace } from "@/types/workspace";

import { DateTimeType } from "@howljs/calendar-kit";

export const getWorkspaces = async (): Promise<Workspace[]> => {
  try {
    return await api.get(`api/workspaces`);
  } catch (error) {
    return mockWorkspaces;
  }
};

export const getWorkspace = async (
  id: string
): Promise<Workspace | undefined> => {
  try {
    return await api.get(`api/workspaces/${id}`);
  } catch (error) {
    return mockWorkspaces.find((wp) => wp.id === id);
  }
};

// export const createEvent = async (
//   start: DateTimeType,
//   end: DateTimeType
// ): Promise<Event> => {
//   return new Promise(() => {
//     return {
//       id: Date.now().toString(),
//       name: "New Event",
//       description: "",
//       start: start,
//       end: end,
//       status: "pending",
//       location: "",
//       color: "orange",
//       isAllDay: false,
//       recurrenceRule: "",
//       tags: [],
//       metadata: {},
//       workspaceId: "workspace_1",
//       createdById: "user_1",
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       assignees: [],
//     };
//   });
// };
