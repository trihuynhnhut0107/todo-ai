import { useLocation } from "@/hooks/useLocation";
import useThemeColor from "@/hooks/useThemeColor";
import { openInGoogleMap } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import Loader from "./Loader";

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  location?: string;
  start?: string | Date;
  end?: string | Date;
  color?: string;
}

export interface MapProps {
  coordinates: MapMarker[];
  displayUser?: boolean;
  loading?: boolean;
}

export default function Map({
  coordinates,
  displayUser = false,
  loading = false,
}: MapProps) {
  const { userLocation, refetch } = useLocation();
  const colors = useThemeColor();
  const mapRef = useRef<MapView>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [mapLayout, setMapLayout] = useState({ width: 0, height: 0 });
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (selectedMarkerId) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedMarkerId]);

  const getInitialRegion = () => {
    // snap to nearest upcoming event (by time)
    if (coordinates.length > 0) {
      console.log("using event location");
      console.log("coords:", coordinates);
      const nearestByTime = coordinates.sort(
        (a, b) =>
          new Date(a.start ?? "").getTime() - new Date(b.start ?? "").getTime()
      )[0];
      setSelectedMarkerId(nearestByTime.id);
      return {
        latitude: nearestByTime.latitude,
        longitude: nearestByTime.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    // If displayUser and userLocation exists, center on user
    if (displayUser && userLocation) {
      console.log("using user location");
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    console.log("using default");
    // Absolute fallback
    return {
      latitude: 10.8231,
      longitude: 106.6297,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  useEffect(() => {
    if (!loading) {
      const init = getInitialRegion();
      snapToCoord(init.longitude, init.latitude);
    }
  }, [loading]);

  const snapToCoord = (lng: number, lat: number) => {
    console.log(`snapping to: lng:${lng},lat:${lat}`);
    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      500
    );
  };

  // Calculate edge indicators for off-screen markers
  const getEdgeIndicators = () => {
    if (!mapRegion || !mapLayout.width) return [];

    const indicators: Array<{
      marker: MapMarker;
      position: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
      };
    }> = [];

    const { latitude, longitude, latitudeDelta, longitudeDelta } = mapRegion;
    const northBound = latitude + latitudeDelta / 2;
    const southBound = latitude - latitudeDelta / 2;
    const eastBound = longitude + longitudeDelta / 2;
    const westBound = longitude - longitudeDelta / 2;

    coordinates.forEach((marker) => {
      const isOutOfView =
        marker.latitude > northBound ||
        marker.latitude < southBound ||
        marker.longitude > eastBound ||
        marker.longitude < westBound;

      if (isOutOfView) {
        // Calculate position on edge
        const dx = marker.longitude - longitude;
        const dy = marker.latitude - latitude;
        const angle = Math.atan2(dy, dx);

        // Map dimensions
        const halfWidth = mapLayout.width / 2;
        const halfHeight = mapLayout.height / 2;

        // Calculate intersection with map edges
        let edgeX = halfWidth * Math.cos(angle);
        let edgeY = halfHeight * Math.sin(angle);

        // Constrain to actual edge
        const ratio = Math.min(
          Math.abs(halfWidth / edgeX),
          Math.abs(halfHeight / edgeY)
        );

        edgeX *= ratio * 0.9; // 0.9 to add padding from edge
        edgeY *= ratio * 0.9;

        // Convert to position from center
        const left = halfWidth + edgeX - 20; // 20 = half of indicator size
        const top = halfHeight - edgeY - 20;

        indicators.push({
          marker,
          position: { left, top },
        });
      }
    });

    return indicators;
  };

  const edgeIndicators = getEdgeIndicators();
  const selectedMarker = useMemo(
    () => coordinates.find((c) => c.id === selectedMarkerId),
    [selectedMarkerId]
  );

  if (loading) return <Loader />;
  return (
    <View className="min-h-[400px] flex-1">
      <View
        className="flex-1"
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setMapLayout({ width, height });
        }}
      >
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          className="flex-1"
          style={{ flex: 1 }}
          showsUserLocation
          onRegionChange={setMapRegion}
          onRegionChangeComplete={setMapRegion}
          // scrollEnabled={false}
        >
          {coordinates.map((coord) => (
            <Marker
              key={coord.id}
              coordinate={{
                latitude: coord.latitude,
                longitude: coord.longitude,
              }}
              // title={coord.title}
              // description={coord.description}
              tracksViewChanges={false}
              onPress={() => {
                setSelectedMarkerId(coord.id);
              }}
            >
              <View style={{ alignItems: "center" }}>
                {/* Pin head */}
                <View
                  className="size-8 items-center justify-center rounded-full border-2 border-white"
                  style={{
                    backgroundColor: coord.color,
                    transform: [
                      { scale: selectedMarkerId === coord.id ? 1.2 : 1 },
                    ],
                  }}
                >
                  <Ionicons name="location" size={16} color="white" />
                </View>
                {/* Pin point */}
                <View
                  className="border-t-8 border-4 border-b-0 border-transparent size-0 bg-transparent "
                  style={{ borderTopColor: coord.color }}
                />
              </View>
            </Marker>
          ))}
        </MapView>
        {edgeIndicators.map(({ marker, position }) => (
          <TouchableOpacity
            key={`indicator-${marker.id}`}
            className="absolute size-8 items-center justify-center rounded-full border-2 border-white"
            style={[position, { backgroundColor: marker.color || "#007AFF" }]}
            onPress={() => snapToCoord(marker.longitude, marker.latitude)}
          >
            <Ionicons name="location" size={16} color="white" />
          </TouchableOpacity>
        ))}
      </View>
      <View className="absolute top-4 right-4 flex-col gap-2">
        {userLocation && (
          <TouchableOpacity
            className="bg-white rounded-lg size-8 items-center justify-center shadow"
            onPress={() =>
              userLocation &&
              snapToCoord(userLocation.longitude, userLocation.latitude)
            }
          >
            <Ionicons name="locate" size={20} color="#1F2937" />
          </TouchableOpacity>
        )}
      </View>
      {/* Bottom-right modal */}
      {selectedMarker && (
        <Animated.View
          className="flex-row gap-2  w-full p-4"
          style={[
            {
              backgroundColor: colors.surface,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View
            className="h-full w-1 rounded-full"
            style={[
              {
                backgroundColor: selectedMarker.color,
              },
            ]}
          />
          <View className="flex-1 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-text text-lg">
                {selectedMarker.title}
              </Text>
              <TouchableOpacity onPress={() => setSelectedMarkerId(null)}>
                <Ionicons
                  name="close"
                  size={20}
                  color={colors["text-secondary"]}
                />
              </TouchableOpacity>
            </View>
            {(selectedMarker?.start || selectedMarker?.end) && (
              <View className="flex-row flex-wrap items-center gap-x-2 justify-between">
                {selectedMarker?.start && (
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-text-tertiary text-xs font-medium">
                      Start:
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      {format(selectedMarker.start, "dd/MM (hh:mm a)")}
                    </Text>
                  </View>
                )}

                {selectedMarker?.end && (
                  <View className="flex-row items-center gap-1.5">
                    <Text className="text-text-tertiary text-xs font-medium">
                      End:
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      {format(selectedMarker.end, "dd/MM (hh:mm a)")}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {selectedMarker?.location && (
              <View>
                <View className="flex-row items-center gap-1">
                  <Ionicons
                    name="location"
                    size={12}
                    color={colors["text-tertiary"]}
                  />
                  <Text className="text-text-secondary text-sm">Location:</Text>
                </View>

                <Text className="text-xs text-text-tertiary">
                  {selectedMarker.location}
                </Text>
              </View>
            )}

            <View>
              <TouchableOpacity
                className="rounded-lg p-2 bg-primary"
                onPress={() =>
                  openInGoogleMap(
                    selectedMarker.longitude,
                    selectedMarker.latitude
                  )
                }
              >
                <Text className="text-white text-center">
                  Open in Google Map
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
