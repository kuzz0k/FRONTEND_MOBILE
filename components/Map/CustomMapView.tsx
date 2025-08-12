import React from "react"
import { StyleSheet, View } from "react-native"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import { useSelector } from "react-redux"
import { MapType } from "../../constants/consts"
import { RootState } from "../../store/store"
import ConfirmLocationMarker from "./ConfirmLocationMarker"
import ConfirmLocationOverlayComp from "./ConfirmLocationOverlay"
// import { EquipmentLayer } from "./Equipments/EquipmentLayer"
import { MogsLayer } from "./Mogs/MogsLayer"
import TasksLayer from "./Tasks/TasksLayer"
import UserLocationMarker from "./UserLocationMarker"

import { TASK_DOT } from "../../types/types"
import { AirCraftsLayer } from "./Aircrafts/AircraftLayer"

interface CustomMapViewProps {
  style?: any
  onRegionChange?: (region: any) => void
  showsUserLocation?: boolean
  followsUserLocation?: boolean
  children?: React.ReactNode
  onPress?: (event: any) => void
  onPanDrag?: (event: any) => void
  mapRef?: React.RefObject<MapView | null>
  onTaskPress?: (task: TASK_DOT) => void
  onUserMarkerDrag?: (coordinate: {
    latitude: number
    longitude: number
  }) => void
  enableUserMarkerDrag?: boolean
  targetCoordinates?: { latitude: number; longitude: number } | null
  onConfirmMove?: () => void
  onCancelMove?: () => void
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
  onTaskPress,
  onUserMarkerDrag,
  enableUserMarkerDrag = false,
  targetCoordinates,
  onConfirmMove,
  onCancelMove,
}: CustomMapViewProps) {
  const { mapType, region } = useSelector((state: RootState) => state.map)
  const userLocation = useSelector((state: RootState) => state.userLocation)

  // Для react-native-maps мы можем использовать кастомные тайлы только с UrlTile
  // Но это работает только на Android, для iOS нужно использовать встроенные типы
  const getMapTypeForNativeMaps = (type: MapType) => {
    switch (type) {
      case "satellite":
        return "satellite"
      case "hybrid":
        return "hybrid"
      case "standard":
      default:
        return "standard"
    }
  }

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

        {/* Маркер текущего местоположения пользователя */}
        {userLocation.latitude && userLocation.longitude && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Мое местоположение"
            description={`Обновлено: ${new Date(
              userLocation.timestamp
            ).toLocaleTimeString()}`}
            identifier="user-location"
            anchor={{ x: 0.5, y: 0.5 }}
            draggable={enableUserMarkerDrag}
            onDragEnd={(e) => {
              if (onUserMarkerDrag) {
                onUserMarkerDrag(e.nativeEvent.coordinate)
              }
            }}
          >
            <UserLocationMarker size={15} isActive={userLocation.isTracking} />
          </Marker>
        )}

        {/* Маркер подтверждения перемещения */}
        {targetCoordinates && (
          <Marker
            coordinate={targetCoordinates}
            identifier="confirm-location"
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={false}
          >
            <ConfirmLocationMarker />
          </Marker>
        )}

        {/* Слой с мобильными операторами (Mogs) */}
        <MogsLayer />

        {/* Слой с дронами */}
        <AirCraftsLayer />

        {/* Слой с оборудованием */}
        {/* <EquipmentLayer /> */}

        {/* Слой с задачами */}
        <TasksLayer onTaskPress={onTaskPress} />

        {children}
      </MapView>
      {targetCoordinates && onConfirmMove && onCancelMove && mapRef && (
        <ConfirmLocationOverlayComp
          mapRef={mapRef}
          coordinate={targetCoordinates}
          onConfirm={onConfirmMove}
          onCancel={onCancelMove}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
})
