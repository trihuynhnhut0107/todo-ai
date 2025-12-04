import {
  addGroupMember,
  createGroup,
  deleteGroup,
  deleteGroupMember,
  getGroup,
  getGroupMember,
  getGroups,
  updateGroup,
} from "@/services/group";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showMessage } from "react-native-flash-message";

export const useGroup = () =>
  useQuery({
    placeholderData: [],
    queryKey: ["groups"],
    queryFn: getGroups,
  });

export const useGroupById = (id: string) =>
  useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroup(id),
    enabled: !!id && id !== "create",
  });

export const useGroupMember = (id: string) =>
  useQuery({
    placeholderData: [],
    queryKey: ["group_members", id],
    queryFn: () => getGroupMember(id),
    enabled: !!id,
  });


export const useAddGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addGroupMember,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["group_members", id],
      });
      showMessage({
        message: "New Member Added!",
        type: "success",
      });
    },
  });
};

export const useRemoveGroupMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGroupMember,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["group_members", id],
      });
      showMessage({
        message: "Member Removed!",
        type: "success",
      });
    },
  });
};
export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["groups"],
      });
      showMessage({
        message: "group created!",
        type: "success",
      });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGroup,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["groups"],
      });
      queryClient.invalidateQueries({
        queryKey: ["group", id],
      });
      showMessage({
        message: "group updated!",
        type: "success",
      });
    },
  });
};

export const useDeleteGroup = (callback?: any) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGroup,

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: ["groups"],
      });
      queryClient.invalidateQueries({
        queryKey: ["group", id],
      });
      showMessage({
        message: "group deleted!",
        type: "success",
      });
      callback?.();
    },
  });
};
