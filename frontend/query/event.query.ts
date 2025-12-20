import {
  assignMember,
  createEvent,
  deleteEvent,
  getEvent,
  getEvents,
  unassignMember,
  updateEvent,
  updateEventStatus,
} from "@/services/event";
import useAuthStore from "@/store/auth.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showMessage } from "react-native-flash-message";

export const useEvents = (wp_id: string) =>
  useQuery({
    placeholderData: [],
    queryKey: ["workspace", wp_id, "events"],
    queryFn: () => getEvents({ wp_id }),
    enabled: !!wp_id,
  });

export const useUserEvents = (assigneeId: string) =>
  useQuery({
    placeholderData: [],
    queryKey: ["user", assigneeId, "events"],
    queryFn: () => getEvents({ assigneeId }),
    enabled: !!assigneeId,
  });

export const useEventById = (id: string) =>
  useQuery({
    queryKey: ["event", id],
    queryFn: () => getEvent(id),
    enabled: !!id && id !== "create",
  });

export const useCreateEvent = (callback: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "events"],
      });
      callback()
      showMessage({
        message: "Event created!",
        type: "success",
      });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: updateEvent,

    onSuccess: (_, { id, workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "events"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", user?.id, "events"],
      });
      showMessage({
        message: "Event updated!",
        type: "success",
      });
    },
  });
};

export const useUpdateEventStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: updateEventStatus,

    onSuccess: (_, { id, workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "events"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", user?.id, "events"],
      });
      showMessage({
        message: "Event status updated!",
        type: "success",
      });
    },
  });
};

export const useDeleteEvent = (callback?: any) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: deleteEvent,

    onSuccess: (_, { id, wp_id }) => {
      queryClient.removeQueries({
        queryKey: ["event", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", wp_id, "events"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", user?.id, "events"],
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
    onSuccess: (_, { id, wp_id, payload }) => {
      queryClient.invalidateQueries({
        queryKey: ["event", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", wp_id, "events"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", payload.userIds.at(0), "events"],
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
    onSuccess: (_, { id, wp_id, payload }) => {
      queryClient.invalidateQueries({
        queryKey: ["event", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", wp_id, "events"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", payload.userId, "events"],
      });
      showMessage({
        message: "Member Unassigned!",
        type: "success",
      });
    },
  });
};
