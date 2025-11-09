import api from "@/lib/api";
import { mockEvents } from "@/lib/mock/event";
import { Event, EventPayload } from "@/types/event";
import { DateOrDateTime, DateTimeType } from "@howljs/calendar-kit";

export const getEvents = async (wp_id?: string): Promise<Event[]> => {
  const params = wp_id ? { workspaceId: wp_id } : {};
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
  payload,
}: {
  id: string;
  payload: EventPayload;
}): Promise<Event> => {
  console.log(payload)
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
  payload,
}: {
  id: string;
  payload: {
    userIds: string[];
  };
}) => {
  return await api.post(`/events/${id}/assignees`, payload);
};

export const unassignMember = async ({
  id,
  payload,
}: {
  id: string;
  payload: {
    userIds: string[];
  };
}) => {
  return await api.delete(`/events/${id}/assignees`, {
    data: payload,
  });
};
