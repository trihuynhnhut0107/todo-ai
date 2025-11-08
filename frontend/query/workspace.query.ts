import { getWorkspace, getWorkspaces } from "@/services/workspace";
import { useQuery } from "@tanstack/react-query";

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
