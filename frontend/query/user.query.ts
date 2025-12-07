import { getUserById, getUsers, updateProfile } from "@/services/user";
import useAuthStore from "@/store/auth.store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showMessage } from "react-native-flash-message";

export const useUsers = () =>
  useQuery({
    placeholderData: { limit: 0, page: 0, total: 0, totalPage: 0, users: [] },
    queryKey: ["users"],
    queryFn: () => getUsers(),
  });

export const useUserById = (id: string) =>
  useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });

export const useUpdateProfile = () => {
  const { fetchAuthenticatedUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["user", id],
      });
      showMessage({
        message: "Profile Updated!",
        type: "success",
      });
      fetchAuthenticatedUser();
    },
  });
};
