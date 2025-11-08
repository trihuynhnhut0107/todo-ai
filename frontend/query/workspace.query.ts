import { createWorkspace, getWorkspace, getWorkspaces } from "@/services/workspace";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    enabled: !!id,
  });

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces"],
      });
    },
    onError: (error: any) => {
      console.error(error);
    },
  });
};

export const useUpdateWorkspace = () => {};
