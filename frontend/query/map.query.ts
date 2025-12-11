import { getAddressFromCoord, getCoordFromAddress } from "@/services/map";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useAddressFromCoord = (coord: {
  longitude: number;
  latitude: number;
}) =>
  useQuery({
    queryFn: () => getAddressFromCoord(coord),
    queryKey: ["address from", coord],
    enabled:
      typeof coord.longitude === "number" &&
      !isNaN(coord.longitude) &&
      typeof coord.latitude === "number" &&
      !isNaN(coord.latitude),
  });

export const useCoordFromAddress = (address: string) =>
  useQuery({
    queryFn: () => getCoordFromAddress(address),
    queryKey: ["coordinate from", address],
    enabled: address !== "",
  });
