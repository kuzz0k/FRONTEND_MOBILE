import React, { useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

interface MarkerData {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
}

export default function MainPage() {
  const mapRef = useRef<MapView>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([
    {
      id: '1',
      coordinate: {
        latitude: 55.7558,
        longitude: 37.6173,
      },
      title: 'Москва',
    },
  ]);

  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: 55.7558, // Москва
    longitude: 37.6173,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [dragCoord, setDragCoord] = useState<{ latitude: number; longitude: number } | null>(null);

  const initialRegion: Region = {
    latitude: 55.7558, // Москва
    longitude: 37.6173,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    const newMarker: MarkerData = {
      id: Date.now().toString(),
      coordinate: { latitude, longitude },
      title: `Маркер ${markers.length + 1}`,
    };
    
    setMarkers([...markers, newMarker]);
  };

  const handleMarkerPress = (marker: MarkerData) => {
    Alert.alert(
      'Маркер',
      `${marker.title}\nLat: ${marker.coordinate.latitude.toFixed(4)}\nLng: ${marker.coordinate.longitude.toFixed(4)}`,
      [
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            setMarkers(markers.filter(m => m.id !== marker.id));
          },
        },
        {
          text: 'Закрыть',
          style: 'cancel',
        },
      ]
    );
  };

  const handleRegionChange = (region: Region) => {
    setCurrentRegion(region);
  };

  const zoomIn = () => {
    const newRegion = {
      ...currentRegion,
      latitudeDelta: currentRegion.latitudeDelta / 2,
      longitudeDelta: currentRegion.longitudeDelta / 2,
    };
    mapRef.current?.animateToRegion(newRegion, 300);
  };

  const zoomOut = () => {
    const newRegion = {
      ...currentRegion,
      latitudeDelta: currentRegion.latitudeDelta * 2,
      longitudeDelta: currentRegion.longitudeDelta * 2,
    };
    mapRef.current?.animateToRegion(newRegion, 300);
  };

  // Этот метод вызывается при любом движении пальца по карте
  const handlePanDrag = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setDragCoord(coordinate);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        zoomControlEnabled={false}
        zoomEnabled={true}
        scrollEnabled={true}
        onPress={handleMapPress}
        onRegionChangeComplete={handleRegionChange}
        onPanDrag={handlePanDrag}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            onPress={() => handleMarkerPress(marker)}
          />
        ))}
      </MapView>

      {/* Кнопки зума по центру справа */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
          <Text style={styles.zoomButtonText}>-</Text>
        </TouchableOpacity>
      </View>

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
    width: width,
    height: height,
  },
  zoomControls: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -50 }],
    flexDirection: 'column',
  },
  zoomButton: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  zoomButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  bottomModal: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    maxWidth: '70%',
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