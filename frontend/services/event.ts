import { mockEvents } from "@/lib/mock/event";
import { Event } from "@/types/event";
import { DateOrDateTime, DateTimeType } from "@howljs/calendar-kit";

export const getEvents = async (wp_id: string): Promise<Event[]> => {
  return new Promise((resolve) => {
    resolve(mockEvents);
  });
};

export const getEvent = async (id: string): Promise<Event[]> => {
  return new Promise((resolve) => {
    resolve(mockEvents);
  });
};

export const createEvent = async ({
  wp_id,
  start,
  end,
}: {
  wp_id: string;
  start: DateOrDateTime;
  end: DateOrDateTime;
}): Promise<Event> => {
  // Later you’ll replace this mock with your real API call
  return new Promise((resolve) => {
    resolve(mockEvents[0]);
  });
};

export const updateEvent = async ({
  wp_id,
  id,
  start,
  end,
}: {
  wp_id: string;
  id: string;
  start: DateOrDateTime;
  end: DateOrDateTime;
}): Promise<Event> => {
  return new Promise((resolve) => {
    resolve(mockEvents[0]);
  });
};

export const deleteEvent = async ({
  wp_id,
  id,
}: {
  wp_id: string;
  id: string;
}): Promise<void> => {
  return new Promise((resolve) => {
    resolve();
  });
};
