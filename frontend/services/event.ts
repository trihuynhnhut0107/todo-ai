
import { mockEvents } from "@/lib/mock/event";
import { Event } from "@/type";
import { DateTimeType } from "@howljs/calendar-kit";

export const getEvents = async (wp_id: string): Promise<Event[]> => {
  return new Promise((resolve) => {
     resolve(mockEvents);
   });
};

export const createEvent = async (
  start: DateTimeType,
  end: DateTimeType
): Promise<Event> => {
  return new Promise(() => {
    return {
      id: Date.now().toString(),
      name: "New Event",
      description: "",
      start: start,
      end: end,
      status: "pending",
      location: "",
      color: "orange",
      isAllDay: false,
      recurrenceRule: "",
      tags: [],
      metadata: {},
      workspaceId: "workspace_1",
      createdById: "user_1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignees: [],
    };
  });
};
