import { useState, useCallback } from "react";
import * as Location from "expo-location";
import { sendUserLocation } from "@/services/user";

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Permission to access location was denied");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const latitude = location.coords.latitude;
      const longitude = location.coords.longitude;

      setUserLocation({
        latitude: latitude,
        longitude: longitude,
      });
      setError(null);

      return {
        latitude,
        longitude,
      };
    } catch (err) {
      setError("Could not get location");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    userLocation,
    loading,
    error,
    refetch: fetchLocation, // Manual refresh
  };
};
