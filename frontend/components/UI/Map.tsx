import { StyleSheet, View } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { useCoordFromAddress } from "@/query/map.query";
import { useEffect, useState } from "react";

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN!;

Mapbox.setAccessToken(MAPBOX_TOKEN);

export interface MapProps {
  address?: string;
  coordinate?: number[];
}

export default function Map({ address, coordinate }: MapProps) {
  const { mutate: getCoordFromAddress } = useCoordFromAddress();
  const [coord, setCoord] = useState([106.6297, 10.8231]);

  useEffect(() => {
    if (coordinate && coordinate.length === 2) {
      // If coordinate is provided directly, use it
      setCoord(coordinate as [number, number]);
    } else if (address) {
      // If address is provided, geocode it
      getCoordFromAddress(address, {
        onSuccess: (data) => {
          if (data.features && data.features.length > 0) {
            const firstResult = data.features[0];
            const { longitude, latitude } = firstResult.properties.coordinates;
            setCoord([longitude, latitude]);
          }
        },
        onError: (error) => {
          console.error("Failed to geocode address:", error);
        },
      });
    }
  }, [address, coordinate]);
  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL="mapbox://styles/mapbox/streets-v12"
      >
        <Mapbox.Camera
          zoomLevel={12}
          centerCoordinate={coord}
          animationDuration={1000}
        />

        <Mapbox.PointAnnotation id="location-marker" coordinate={coord}>
          <View style={styles.marker} />
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF0000",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
