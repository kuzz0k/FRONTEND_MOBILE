import React from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { MapType } from '../../constants/consts';

interface CustomMapViewProps {
  style?: any;
  onRegionChange?: (region: any) => void;
  showsUserLocation?: boolean;
  followsUserLocation?: boolean;
  children?: React.ReactNode;
  onPress?: (event: any) => void;
  onPanDrag?: (event: any) => void;
  mapRef?: React.RefObject<MapView | null>;
}

export default function CustomMapView({
  style,
  onRegionChange,
  showsUserLocation = true,
  followsUserLocation = false,
  children,
  onPress,
  onPanDrag,
  mapRef,
}: CustomMapViewProps) {
  const { mapType, region } = useSelector((state: RootState) => state.map);

  // Для react-native-maps мы можем использовать кастомные тайлы только с UrlTile
  // Но это работает только на Android, для iOS нужно использовать встроенные типы
  const getMapTypeForNativeMaps = (type: MapType) => {
    switch (type) {
      case 'satellite':
        return 'satellite';
      case 'hybrid':
        return 'hybrid';
      case 'standard':
      default:
        return 'standard';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation={showsUserLocation}
        followsUserLocation={followsUserLocation}
        mapType={getMapTypeForNativeMaps(mapType)}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        zoomControlEnabled={false}
        zoomEnabled={true}
        scrollEnabled={true}
        onPress={onPress}
        onPanDrag={onPanDrag}
      >
        {/* Если нужны кастомные тайлы (только Android), можно добавить: */}
        {/* 
        {Platform.OS === 'android' && (
          <UrlTile
            urlTemplate={mapLayers[mapType]}
            shouldReplaceMapContent={true}
            maximumZ={19}
            flipY={false}
          />
        )}
        */}
        {children}
      </MapView>
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
