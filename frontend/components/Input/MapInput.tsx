import Mapbox from "@rnmapbox/maps";
import { useState } from "react";
import { View, StyleSheet } from "react-native";

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!;

Mapbox.setAccessToken(MAPBOX_TOKEN);

export interface MapInputProps {
  coord: number[];
  onChange: (coord: number[]) => void;
}

const MapInput = ({ coord, onChange }: MapInputProps) => {
  const [markerCoord, setMarkerCoord] = useState(coord);
  const handleMapPress = (feature: any) => {
    const { geometry } = feature;
    if (geometry && geometry.coordinates) {
      const newCoord = geometry.coordinates;
      setMarkerCoord(newCoord);
      onChange(newCoord);
    }
  };
  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL="mapbox://styles/mapbox/streets-v12"
        onPress={handleMapPress}
      >
        <Mapbox.Camera
          zoomLevel={12}
          centerCoordinate={coord}
          animationDuration={1000}
        />

        <Mapbox.PointAnnotation id="location-marker" coordinate={markerCoord}>
          <View style={styles.marker} />
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>
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
  marker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF0000",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
export default MapInput;
