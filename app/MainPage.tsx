import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { WebSocketService } from "@/services/WebSocket"
import React, { useEffect, useRef, useState } from "react"
import {
  Dimensions,
  StyleSheet,
  View,
} from "react-native"
import MapView, { Region } from "react-native-maps"
import CenterOnUserButton from "../components/CenterOnUserButton"
import HeaderModal from "../components/HeaderModal"
import CustomMapView from "../components/Map/CustomMapView"
import ZoomControls from "../components/ui/ZoomControls"
import { useLocationService } from "../hooks/useLocationService"
import { useMap } from "../hooks/useMap"
import { locationService } from "../services/LocationService"
import { toggleReady } from "../store/reducers/authSlice"
import { updateCoordinates } from "../store/reducers/coordinatesSlice"

const { width, height } = Dimensions.get("window")

export default function MainPage() {
  const tokenState = useAppSelector(state => state.user.accessToken)
  const isReady = useAppSelector(state => state.user.isReady) // Берем из Redux
  const coordinates = useAppSelector(state => state.coordinates) // Координаты точки на экране
  const userLocation = useAppSelector(state => state.userLocation) // Координаты пользователя
  const dispatch = useAppDispatch()
  
  const { mapState, changeMapType } = useMap();
  const { 
    isLocationServiceRunning, 
    locationError
  } = useLocationService();
  
  useEffect(() => {
    if (tokenState) {
      WebSocketService.updateToken(tokenState);
      WebSocketService.connect();
    }
  }, [tokenState])

  const mapRef = useRef<MapView>(null)

  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: 55.7558, // Москва
    longitude: 37.6173,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })

  const [notifications] = useState(3)
  const [userName] = useState("Пользователь")
  const [isMapSettingsOpen, setIsMapSettingsOpen] = useState(false)

  const handleMapPress = (event: any) => {
    // Обновляем координаты точки на экране при нажатии на карту
    if (event.nativeEvent && event.nativeEvent.coordinate) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      dispatch(updateCoordinates({
        lat: latitude,
        lng: longitude
      }));
    }
    
    // Закрываем меню настроек карты при нажатии на карту
    if (isMapSettingsOpen) {
      setIsMapSettingsOpen(false);
    }
  }

  const handleRegionChange = (region: Region) => {
    setCurrentRegion(region)
  }

  const handleGetRoute = () => {
    console.log("Получить маршрут")
  }

  const handleReadyToggle = async () => {
    dispatch(toggleReady())
    // Отправляем обновление статуса готовности в WebSocket
    await locationService.sendReadyStatusUpdate()
  }

  const handleMapSettingsToggle = (isOpen: boolean) => {
    setIsMapSettingsOpen(isOpen)
  }

  const zoomIn = () => {
    const newRegion = {
      ...currentRegion,
      latitudeDelta: currentRegion.latitudeDelta / 2,
      longitudeDelta: currentRegion.longitudeDelta / 2,
    }
    mapRef.current?.animateToRegion(newRegion, 300)
  }

  const zoomOut = () => {
    const newRegion = {
      ...currentRegion,
      latitudeDelta: currentRegion.latitudeDelta * 2,
      longitudeDelta: currentRegion.longitudeDelta * 2,
    }
    mapRef.current?.animateToRegion(newRegion, 300)
  }

  const centerOnUser = () => {
    if (userLocation.latitude && userLocation.longitude) {
      const newRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01, // Приближенный зум
        longitudeDelta: 0.01,
      }
      mapRef.current?.animateToRegion(newRegion, 500)
    }
  }

  return (
    <View style={styles.container}>
      <HeaderModal
        isVisible={true}
        coords={{
          latitude: coordinates.lat,
          longitude: coordinates.lng
        }}
        timestamp={new Date()}
        onGetRoute={handleGetRoute}
        onReadyToggle={handleReadyToggle}
        isReady={isReady}
        notifications={notifications}
        userName={userName}
        mapType={mapState.mapType}
        onMapTypeChange={changeMapType}
        onMapSettingsToggle={handleMapSettingsToggle}
        isLocationServiceRunning={isLocationServiceRunning}
        locationError={locationError}
      />

      <CustomMapView
        style={styles.map}
        onRegionChange={handleRegionChange}
        showsUserLocation={true}
        followsUserLocation={false}
        onPress={handleMapPress}
        mapRef={mapRef}
      >
      </CustomMapView>

      {/* Кнопки зума */}
      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} />

      {/* Кнопка центрирования на пользователе */}
      <View style={styles.centerOnUserContainer}>
        <CenterOnUserButton 
          onPress={centerOnUser}
          isLocationAvailable={userLocation.isTracking && !!userLocation.latitude}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  centerOnUserContainer: {
    position: "absolute",
    right: 20,
    bottom: 200,
  },
})
