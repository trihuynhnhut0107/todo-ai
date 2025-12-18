import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  MapPressEvent,
} from "react-native-maps";
import { useRef } from "react";
import { View, TouchableOpacity } from "react-native";
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
    <View className="flex-1 min-h-[400px]">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={getInitialCoordinate()}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
        toolbarEnabled={false}
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
              <View className="size-8 border-2 border-white items-center justify-center bg-primary rounded-full">
                <Ionicons name="location" size={16} color="white" />
              </View>
              {/* Pin point */}
              <View className="border-t-8 border-4 border-b-0 border-transparent size-0 bg-transparent border-t-primary" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Control buttons */}
      <View className="absolute top-2 right-2 gap-2">
        {/* Center on user location button */}
        {userLocation && (
          <TouchableOpacity
            onPress={handleCenterOnUser}
            className="bg-white rounded-lg size-8 items-center justify-center shadow"
          >
            <Ionicons name="locate" size={20} color="#1F2937" />
          </TouchableOpacity>
        )}

        {/* Clear marker button */}
        {coord?.lat && coord?.lng && coord.lat !== 0 && coord.lng !== 0 && (
          <TouchableOpacity
            onPress={handleClearMarker}
            className="bg-[#EF4444] rounded-lg size-8 items-center justify-center shadow"
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CustomMapInput;
