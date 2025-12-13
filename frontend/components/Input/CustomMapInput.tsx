import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  MapPressEvent,
} from "react-native-maps";
import { useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useLocation } from "@/hooks/useLocation";
import { Ionicons } from "@expo/vector-icons";

export interface CustomMapInputProps {
  coord: { lat: number; lng: number } | undefined;
  onChange: (coord: { lat: number; lng: number } | undefined) => void;
}

const CustomMapInput = ({ coord, onChange }: CustomMapInputProps) => {
  const { userLocation } = useLocation();
  const mapRef = useRef<MapView>(null);
  const getInitialCoordinate = () => {
    // If coord exists, center on it
    if (coord?.lat && coord?.lng) {
      return {
        latitude: coord.lat,
        longitude: coord.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    // Otherwise use user location or default
    if (userLocation) {
      return {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    return {
      latitude: 10.8231,
      longitude: 106.6297,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };
  // Convert from Mapbox format [lng, lat] to react-native-maps format

  const handleMapPress = (event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;

    // Convert back to Mapbox format [lng, lat] for your onChange
    onChange({ lat: coordinate.latitude, lng: coordinate.longitude });
  };

  const handleCenterOnUser = () => {
    if (userLocation) {
      mapRef.current?.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const handleClearMarker = () => {
    onChange(undefined); // Or pass undefined if you prefer
  };
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getInitialCoordinate()}
        onPress={handleMapPress}
        showsUserLocation={true}
      >
        {coord?.lat && coord?.lng && (
          <Marker
            coordinate={{
              latitude: coord?.lat,
              longitude: coord?.lng,
            }}
          >
            <View style={{ alignItems: "center" }}>
              {/* Pin head */}
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "blue", // Your hex color works here!
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
                  borderTopColor: "blue", // Hex color for the point
                }}
              />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Control buttons */}
      <View style={styles.controls}>
        {/* Center on user location button */}
        {userLocation && (
          <TouchableOpacity
            onPress={handleCenterOnUser}
            style={styles.controlButton}
          >
            <Ionicons name="locate" size={20} color="#1F2937" />
          </TouchableOpacity>
        )}

        {/* Clear marker button */}
        {coord?.lat && coord?.lng && coord.lat !== 0 && coord.lng !== 0 && (
          <TouchableOpacity
            onPress={handleClearMarker}
            style={[styles.controlButton, { backgroundColor: "#EF4444" }]}
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: "absolute",
    top: 10,
    right: 10,
    gap: 8,
  },
  controlButton: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default CustomMapInput;
