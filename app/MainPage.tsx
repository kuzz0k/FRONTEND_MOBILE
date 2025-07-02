import { useAppSelector, useAppDispatch } from "@/hooks/redux"
import { WebSocketService } from "@/services/WebSocket"
import React, { useEffect, useRef, useState } from "react"
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import MapView, { Region } from "react-native-maps"
import HeaderModal from "../components/HeaderModal"
import { useMap } from "../hooks/useMap"
import { useLocationService } from "../hooks/useLocationService"
import { updateCoordinates } from "../store/reducers/coordinatesSlice"
import CustomMapView from "../components/Map/CustomMapView"
import LocationDebugPanel from "../components/LocationDebugPanel"
import WebSocketDebugPanel from "../components/WebSocketDebugPanel"

const { width, height } = Dimensions.get("window")

export default function MainPage() {
  const tokenState = useAppSelector(state => state.user.accessToken)
  const coordinates = useAppSelector(state => state.coordinates) // Координаты точки на экране
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

  const [isReady, setIsReady] = useState(false)
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

  const handleReadyToggle = () => {
    setIsReady(!isReady)
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

      {/* Кнопки зума по центру справа */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
          <Text style={styles.zoomButtonText}>-</Text>
        </TouchableOpacity>
      </View>

      {/* Панель отладки геолокации */}
      <LocationDebugPanel />

      {/* Панель отладки WebSocket */}
      <WebSocketDebugPanel />
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
  zoomControls: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: [{ translateY: -50 }],
    flexDirection: "column",
  },
  zoomButton: {
    width: 50,
    height: 50,
    backgroundColor: "white",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
    shadowColor: "#000",
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
    fontWeight: "bold",
    color: "#333",
  },
})
