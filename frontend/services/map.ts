import api from "@/lib/api";

export const getAddressFromCoord = async (coord: {
  longitude: number;
  latitude: number;
}) => {
  return api.post("/mapbox/geocode/reverse", coord);
};

export const getCoordFromAddress = async (searchText: string) => {
  return api.post("/mapbox/geocode/forward", {
    searchText,
  });
};
