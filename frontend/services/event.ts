import api from "@/lib/api";
import { mockEvents } from "@/lib/mock/event";
import { Event, EventPayload } from "@/types/event";
import { DateOrDateTime, DateTimeType } from "@howljs/calendar-kit";

export const getEvents = async (wp_id: string): Promise<Event[]> => {
  try {
    return await api.get("/events");
  } catch (err) {
    return mockEvents
  }
};

export const getEvent = async (id: string): Promise<Event | undefined> => {
  try {
    return await api.get(`/events/${id}`);
  } catch (err) {
    return mockEvents.find((e) => e.id === id);
  }
};

export const createEvent = async (payload: EventPayload): Promise<Event> => {
  try {
    return await api.post(`/events`, payload);
  } catch (err) {
    return mockEvents[0];
  }
};

export const updateEvent = async ({
  id,
  payload,
}: {
  id: string;
  payload: EventPayload;
}): Promise<Event> => {
  try {
    return await api.put(`/events/${id}`, payload);
  } catch (err) {
    return mockEvents[0];
  }
};

export const deleteEvent = async ({
  id,
  wp_id,
}: {
  id: string;
  wp_id: string;
}): Promise<void> => {
  try {
    return await api.delete(`/events/${id}`);
  } catch (err) {
    return;
  }
};

export const assignUser = async ({
  id,
  payload,
}: {
  id: string;
  payload: {
    userIds: string[];
  };
}) => {
  try {
    return await api.post(`/events/${id}/assignees`, payload);
  } catch (err) {
    return mockEvents[0];
  }
};

export const unassignUser = async ({
  id,
  payload,
}: {
  id: string;
  payload: {
    userIds: string[];
  };
}) => {
  try {
    return await api.delete(`/events/${id}/assignees`, {
      data: payload,
    });
  } catch (err) {
    return mockEvents[0];
  }
};
