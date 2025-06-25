import React, { useState } from 'react';
import { Alert, Dimensions, StyleSheet, View } from 'react-native';
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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        onPress={handleMapPress}
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
});