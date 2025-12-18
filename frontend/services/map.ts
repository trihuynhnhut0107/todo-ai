import api from "@/lib/api";
import {
  MapboxDistanceResponse,
  MapboxGeocodingResponse,
  MapboxTravelTimeResponse,
  TravelTimePayload,
} from "@/types/map";

export const getAddressFromCoord = async (coord: {
  longitude: number;
  latitude: number;
}): Promise<MapboxGeocodingResponse> => {
  return api.post("/mapbox/geocode/reverse", coord);
};

export const getCoordFromAddress = async (
  searchText: string
): Promise<MapboxGeocodingResponse> => {
  return api.post("/mapbox/geocode/forward", {
    searchText,
  });
};

export const getTravelTimeFromCoord = async (
  payload: TravelTimePayload
): Promise<MapboxTravelTimeResponse> => {
  return api.post("/mapbox/travel-time", payload);
};

export const getDistanceFromCoord = async ({
  destLat,
  destLng,
  originLat,
  originLng,
}: {
  destLng: number;
  destLat: number;
  originLng: number;
  originLat: number;
}): Promise<MapboxDistanceResponse> => {
  const params: Record<string, number> = {};
  params.originLng = originLng;
  params.originLat = originLat;
  params.destLat = destLat;
  params.destLng = destLng;
  return api.get("/mapbox/distance", { params });
};
