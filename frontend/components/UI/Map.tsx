import { useLocation } from "@/hooks/useLocation";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  color?: string;
}

export interface MapProps {
  coordinates: MapMarker[];
  displayUser?: boolean;
}

export default function Map({ coordinates, displayUser = false }: MapProps) {
  const { userLocation } = useLocation();
  const getInitialRegion = () => {
    // If displayUser and userLocation exists, center on user
    if (displayUser && userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    // If no coordinates, use default or user location
    if (coordinates.length === 0) {
      return userLocation
        ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }
        : {
            latitude: 10.8231,
            longitude: 106.6297,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
    }

    // Find center and bounds of coordinates
    const latitudes = coordinates.map((c) => c.latitude);
    const longitudes = coordinates.map((c) => c.longitude);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = (maxLat - minLat) * 1.5; // Add padding
    const lngDelta = (maxLng - minLng) * 1.5;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.2), // Minimum zoom
      longitudeDelta: Math.max(lngDelta, 0.2),
    };
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getInitialRegion()}
        showsUserLocation
      >
        {coordinates.map((coord) => (
          <Marker
            key={coord.id}
            coordinate={{
              latitude: coord.latitude,
              longitude: coord.longitude,
            }}
            title={coord.title}
            description={coord.description}
          >
            <View style={{ alignItems: "center" }}>
              {/* Pin head */}
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: coord.color, // Your hex color works here!
                  borderWidth: 3,
                  borderColor: "white",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                  elevation: 5,
                }}
              >
                <Ionicons name="location" size={16} color="white" />
              </View>
              {/* Pin point */}
              <View
                style={{
                  width: 0,
                  height: 0,
                  backgroundColor: "transparent",
                  borderStyle: "solid",
                  borderLeftWidth: 3,
                  borderRightWidth: 3,
                  borderTopWidth: 10,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderTopColor: coord.color, // Hex color for the point
                }}
              />
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 300,
  },
  map: {
    flex: 1,
  },
});
