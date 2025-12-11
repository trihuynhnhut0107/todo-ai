import { getAddressFromCoord, getCoordFromAddress } from "@/services/map";
import { useMutation } from "@tanstack/react-query";

export const useAddressFromCoord = () => {
  return useMutation({
    mutationFn: getAddressFromCoord,
  });
};

export const useCoordFromAddress = () => {
  return useMutation({
    mutationFn: getCoordFromAddress,
    onSuccess: (data) => {
        console.log(data)
    }
  });
};
