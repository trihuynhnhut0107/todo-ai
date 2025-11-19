import {
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  getWorkspaces,
  updateWorkspace,
} from "@/services/workspace";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showMessage } from "react-native-flash-message";

export const useWorkSpace = () =>
  useQuery({
    placeholderData: [],
    queryKey: ["workspaces"],
    queryFn: getWorkspaces,
  });

export const useWorkSpaceById = (id: string) =>
  useQuery({
    queryKey: ["workspace", id],
    queryFn: () => getWorkspace(id),
    enabled: !!id && id !== "create",
  });

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
      showMessage({
        message: "Workspace created!",
        type: "success",
      });
    },
  });
};

export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWorkspace,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", id],
      });
      showMessage({
        message: "Workspace updated!",
        type: "success",
      });
    },
  });
};

export const useDeleteWorkspace = (callback?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWorkspace,

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: ["workspaces"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", id],
      });
      showMessage({
        message: "Workspace deleted!",
        type: "success",
      });
      callback?.();
    },
  });
};
