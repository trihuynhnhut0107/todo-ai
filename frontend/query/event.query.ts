import {
  createEvent,
  deleteEvent,
  getEvent,
  getEvents,
  updateEvent,
} from "@/services/event";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useEvents = (wp_id: string) =>
  useQuery({
    placeholderData: [],
    queryKey: ["workspace", wp_id, "events"],
    queryFn: () => getEvents(wp_id),
    enabled: !!wp_id,
  });

export const useEventById = (id: string) =>
  useQuery({
    queryKey: ["event", id],
    queryFn: () => getEvent(id),
    enabled: !!id && id !== "create",
  });

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "events"],
      });
    },
    onError: (error: any) => {
      console.error(error);
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEvent,

    onSuccess: (_, { id, payload }) => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({
        queryKey: ["workspace", payload.workspaceId, "events"],
      });
    },
    onError: (error: any) => {
      console.log(error);
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,

    onSuccess: (_, { id, wp_id }) => {
      queryClient.invalidateQueries({
        queryKey: ["event", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", wp_id, "events"],
      });
    },
    onError: (error: any) => {
      console.log(error);
    },
  });
};
