import { EventStatus } from "@/enum/event";
import api from "@/lib/api";
import { Event, EventPayload } from "@/types/event";


export const getEvents = async ({
  wp_id,
  user_id,
}: {
  wp_id?: string;
  user_id?: string;
}): Promise<Event[]> => {
  const params: Record<string, string> = {};
  if (wp_id) params.workspaceId = wp_id;
  if (user_id) params.userId = user_id;
  return await api.get("/events", { params });
};

export const getEvent = async (id: string): Promise<Event | undefined> => {
  return await api.get(`/events/${id}`);
};

export const createEvent = async (payload: EventPayload): Promise<Event> => {
  return await api.post(`/events`, payload);
};

export const updateEvent = async ({
  id,
  workspaceId,
  payload,
}: {
  id: string;
  workspaceId: string;
  payload: EventPayload;
}): Promise<Event> => {
  return await api.put(`/events/${id}`, payload);
};
export const updateEventStatus = async ({
  id,
  workspaceId,
  payload,
}: {
  id: string;
  workspaceId: string;
  payload: { status: EventStatus };
}): Promise<Event> => {
  return await api.put(`/events/${id}`, payload);
};

export const deleteEvent = async ({
  id,
  wp_id,
}: {
  id: string;
  wp_id: string;
}): Promise<void> => {
  return await api.delete(`/events/${id}`);
};

export const assignMember = async ({
  id,
  wp_id,
  payload,
}: {
  id: string;
   wp_id: string;
  payload: {
    userIds: string[];
  };
}) => {
  return await api.post(`/events/${id}/assignees`, payload);
};

export const unassignMember = async ({
  id,
  wp_id,
  payload,
}: {
  id: string;
  wp_id: string;
  payload: {
    userId: string;
  };
}) => {
  return await api.delete(`/events/${id}/assignees`, {
    data: payload,
  });
};
