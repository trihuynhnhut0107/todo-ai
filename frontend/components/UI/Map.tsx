import React from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken('YOUR_MAPBOX_ACCESS_TOKEN');

export default function Map() {
  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera
          zoomLevel={12}
          centerCoordinate={[-122.4324, 37.7821]} // [longitude, latitude]
        />
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});