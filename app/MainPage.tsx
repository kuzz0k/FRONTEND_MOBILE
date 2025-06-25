import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';


export default function MainPage() {
  const [dragCoord, setDragCoord] = useState<{ latitude: number; longitude: number } | null>(null);

  const initialRegion: Region = {
    latitude: 55.7558,
    longitude: 37.6173,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Этот метод вызывается при любом движении пальца по карте
  const handlePanDrag = (event: MapEvent<{}>) => {
    const { coordinate } = event.nativeEvent;
    setDragCoord(coordinate);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onPanDrag={handlePanDrag}
      />

      {dragCoord && (
        <View style={styles.bottomModal}>
          <Text style={styles.coordText}>
            Текущие координаты: {dragCoord.latitude.toFixed(4)}, {dragCoord.longitude.toFixed(4)}
          </Text>
        </View>
      )}
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
  bottomModal: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
  },
  coordText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
