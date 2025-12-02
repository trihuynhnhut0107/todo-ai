import {
  assignMember,
  createEvent,
  deleteEvent,
  getEvent,
  getEvents,
  unassignMember,
  updateEvent,
} from "@/services/event";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showMessage } from "react-native-flash-message";

export const useEvents = (wp_id: string) =>
  useQuery({
    initialData: [],
    queryKey: ["workspace", wp_id, "events"],
    queryFn: () => getEvents({ wp_id }),
    enabled: !!wp_id,
  });

export const useUserEvents = (user_id: string) =>
  useQuery({
    initialData: [],
    queryKey: ["user", user_id, "events"],
    queryFn: () => getEvents({ user_id }),
    enabled: !!user_id,
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
      showMessage({
        message: "Event created!",
        type: "success",
      });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEvent,

    onSuccess: (_, { id, workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "events"],
      });
      showMessage({
        message: "Event updated!",
        type: "success",
      });
    },
  });
};

export const useDeleteEvent = (callback?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,

    onSuccess: (_, { id, wp_id }) => {
      queryClient.removeQueries({
        queryKey: ["event", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", wp_id, "events"],
      });
      showMessage({
        message: "Event deleted!",
        type: "success",
      });
      callback?.();
    },
  });
};

export const useAssignMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignMember,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["event", id],
      });
      showMessage({
        message: "Member Assigned!",
        type: "success",
      });
    },
  });
};

export const useUnassignMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unassignMember,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["event", id],
      });
      showMessage({
        message: "Member Unassigned!",
        type: "success",
      });
    },
  });
};
