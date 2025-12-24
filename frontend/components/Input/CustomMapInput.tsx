import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  MapPressEvent,
} from "react-native-maps";
import { useCallback, useEffect, useRef, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { useLocation } from "@/hooks/useLocation";
import { Ionicons } from "@expo/vector-icons";

export interface CustomMapInputProps {
  coord: { lat: number; lng: number } | undefined;
  onChange: (coord: { lat: number; lng: number } | undefined) => void;
}

const CustomMapInput = ({ coord, onChange }: CustomMapInputProps) => {
  const { userLocation } = useLocation();
  const [loaded, setLoaded] = useState(false);
  const mapRef = useRef<MapView>(null);

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

  const getInitialCoordinate = () => {
    let reg = {
      latitude: 10.8231,
      longitude: 106.6297,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };

    // Otherwise use user location or default
    if (userLocation?.latitude && userLocation?.longitude) {
      reg = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    // If coord exists, center on it
    if (coord?.lat && coord?.lng) {
      reg = {
        latitude: coord.lat,
        longitude: coord.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    return reg;
  };

  const snapToCoord = (lng: number, lat: number) => {
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

  useEffect(() => {
    if (loaded) {
      const reg = getInitialCoordinate();
      snapToCoord(reg.longitude, reg.latitude);
    }
  }, [loaded]);

  return (
    <View className="flex-1 min-h-[400px]">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        onPress={handleMapPress}
        initialRegion={getInitialCoordinate()}
        showsUserLocation={true}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        onMapLoaded={() => setLoaded(true)}
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
