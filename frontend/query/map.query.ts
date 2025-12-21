import { useLocation } from "@/hooks/useLocation";
import {
  getAddressFromCoord,
  getCoordFromAddress,
  getDistanceFromCoord,
  getTravelTimeFromCoord,
} from "@/services/map";
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

export const useDistanceFromDestination = (coord: {
  lng: number;
  lat: number;
}) => {
  const { userLocation } = useLocation();
  return useQuery({
    queryFn: () =>
      getDistanceFromCoord({
        originLat: userLocation?.latitude!,
        originLng: userLocation?.longitude!,
        destLat: coord.lat,
        destLng: coord.lng,
      }),
    queryKey: [userLocation?.latitude, userLocation?.longitude, "distance from", coord.lat, coord.lng],
    enabled: Boolean(
      coord.lng &&
        coord.lat &&
        userLocation?.latitude &&
        userLocation?.longitude
    ),
  });
};

export const useTravelTimeFromDestination = (coord: {
  lng: number;
  lat: number;
}) => {
  const { userLocation } = useLocation();
  return useQuery({
    queryFn: () =>
      getTravelTimeFromCoord({
        destination: {
          latitude: coord.lat,
          longitude: coord.lng,
        },
        origin: {
          latitude: userLocation?.latitude!,
          longitude: userLocation?.longitude!,
        },
        profile: "driving",
      }),
    queryKey: [userLocation?.latitude, userLocation?.longitude,"travel time from", coord.lat, coord.lng],
    enabled: Boolean(
      coord.lng &&
        coord.lat &&
        userLocation?.latitude &&
        userLocation?.longitude
    ),
  });
};
