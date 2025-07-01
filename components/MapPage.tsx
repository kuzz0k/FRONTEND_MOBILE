import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useMap } from '../hooks/useMap';
import CustomMapView from '../components/Map/CustomMapView';
import HeaderModal from '../components/HeaderModal';

export default function MapPage() {
  const { mapState, changeMapType, updateRegion } = useMap();

  const handleGetRoute = () => {
    console.log('Получить маршрут');
    // Здесь будет логика получения маршрута
  };

  const handleReadyToggle = () => {
    console.log('Переключение готовности');
    // Здесь будет логика переключения статуса готовности
  };

  const handleRegionChange = (region: any) => {
    updateRegion(region);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <CustomMapView
          style={styles.map}
          onRegionChange={handleRegionChange}
          showsUserLocation={mapState.showUserLocation}
          followsUserLocation={mapState.followUserLocation}
        />
        
        <HeaderModal
          isVisible={true}
          coords={{
            latitude: mapState.region.latitude,
            longitude: mapState.region.longitude,
          }}
          timestamp={new Date()}
          onGetRoute={handleGetRoute}
          onReadyToggle={handleReadyToggle}
          isReady={false}
          notifications={3}
          userName="Пользователь"
          mapType={mapState.mapType}
          onMapTypeChange={changeMapType}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
});
