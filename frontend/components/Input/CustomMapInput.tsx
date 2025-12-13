import MapView, { Marker, PROVIDER_GOOGLE, MapPressEvent } from "react-native-maps";
import { useState } from "react";
import { View, StyleSheet } from "react-native";

export interface CustomMapInputProps {
  coord: number[] | undefined;
  onChange: (coord: number[]) => void;
}

const CustomMapInput = ({ coord, onChange }: CustomMapInputProps) => {
  // Convert from Mapbox format [lng, lat] to react-native-maps format
  const initialCoord = coord 
    ? { latitude: coord[1], longitude: coord[0] }
    : { latitude: 10.8231, longitude: 106.6297 };
    
  const [markerCoord, setMarkerCoord] = useState(initialCoord);

  const handleMapPress = (event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    setMarkerCoord(coordinate);
    // Convert back to Mapbox format [lng, lat] for your onChange
    onChange([coordinate.longitude, coordinate.latitude]);
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 10.8231,
          longitude: 106.6297,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handleMapPress}
      >
        <Marker coordinate={markerCoord}>
          <View style={styles.marker} />
        </Marker>
      </MapView>
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

export default CustomMapInput;