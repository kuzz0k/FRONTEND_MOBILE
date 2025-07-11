import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { api, useLogoutMutation } from "@/services/auth"
import { useGetGlobalStateQuery } from "@/services/globalState"
import { tasksApi, useAcceptTaskMutation, useGetTasksQuery, useRejectTaskMutation } from "@/services/tasks"
import { WebSocketService } from "@/services/WebSocket"
import { addMog, deleteMog, disconnectMog, setMogs, updateMog } from "@/store/reducers/mogSlice"
import { setEquipments } from "@/store/reducers/rlsSlice"
import { ALL_TOPICS } from "@/types/types"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Dimensions, StyleSheet, View } from "react-native"
import MapView, { Region } from "react-native-maps"
import CenterOnUserButton from "../components/CenterOnUserButton"
import HeaderModal from "../components/HeaderModal"
import CustomMapView from "../components/Map/CustomMapView"
import ZoomControls from "../components/ui/ZoomControls"
import { useLocationService } from "../hooks/useLocationService"
import { useMap } from "../hooks/useMap"
import { locationService } from "../services/LocationService"
import { logout, toggleReady } from "../store/reducers/authSlice"
import { updateCoordinates } from "../store/reducers/coordinatesSlice"

const { width, height } = Dimensions.get("window")

export default function MainPage() {
  const tokenState = useAppSelector((state) => state.user.accessToken)
  const isReady = useAppSelector((state) => state.user.isReady) // Берем из Redux
  const userCallSign = useAppSelector((state) => state.user.callSign) // Берем позывной из Redux
  const userLocation = useAppSelector((state) => state.userLocation) // Координаты пользователя
  const dispatch = useAppDispatch()
  const [logoutMutation] = useLogoutMutation()
  const [acceptTask] = useAcceptTaskMutation()
  const [rejectTask] = useRejectTaskMutation()
  const { data: tasks, isLoading: isTasksLoading } = useGetTasksQuery(undefined, {
    skip: !tokenState, // Пропускаем запрос если нет токена
  })
  const { data, isSuccess } = useGetGlobalStateQuery()

  useEffect(() => {
    if (data) {
      dispatch(setMogs(data.mogs))
      dispatch(setEquipments(data.equipment))
    }
  }, [isSuccess, data, dispatch])

  // Мемоизированный callback для обработки обновлений WEBSOCKET
  const handleMogUpdate = useCallback((mogUpdateData: any) => {
    dispatch(updateMog(mogUpdateData));
  }, [dispatch]);

  const handleMogEntered = useCallback((mogEnteredData: any) => {
    dispatch(addMog(mogEnteredData))
  }, [dispatch]);

  const handleMogDisconnected = useCallback((mogDisconnectedData: any) => {
    dispatch(disconnectMog(mogDisconnectedData))
  }, [dispatch])

  const handleMogQuit = useCallback((mogQuitData: any) => {
    dispatch(deleteMog(mogQuitData))
  }, [dispatch]);

  // const handleMogConnected = useCallback((mogConnectedData) => {
  //   dispatch(updateMog())
  // })


  // ТОПИКИ ДЛЯ ПОДПИСКИ
  const eventHandlers = useCallback(() => ({
    [ALL_TOPICS.MOG_QUIT]: handleMogQuit,
    [ALL_TOPICS.MOG_UPDATED]: handleMogUpdate,
    [ALL_TOPICS.MOG_DISCONNECTED]: handleMogDisconnected,
    [ALL_TOPICS.MOG_ENTERED]: handleMogEntered,
    // [ALL_TOPICS.MOG_CONNECTED]:
  }), [handleMogQuit, handleMogUpdate, handleMogDisconnected, handleMogEntered]);

  useEffect(() => {
    if (!tokenState) return;

    WebSocketService.updateToken(tokenState);
    WebSocketService.connect();

    const handlers = eventHandlers();

    // Подписываемся на WEBSOCKET.
    Object.entries(handlers).forEach(([topic, callback]) => {
      WebSocketService.subscribe(topic as ALL_TOPICS, callback);
    })

    return () => {
      // Отписываемся от websocket
      Object.entries(handlers).forEach(([topic, callback]) => {
        WebSocketService.unsubscribe(topic as ALL_TOPICS, callback);
      })
      WebSocketService.disconnect();
    };
  }, [tokenState, eventHandlers]);

  const { mapState, changeMapType } = useMap()
  const { isLocationServiceRunning, locationError } = useLocationService()

  useEffect(() => {
    if (tokenState) {
      WebSocketService.updateToken(tokenState)
      WebSocketService.connect()
    }
  }, [tokenState])

  const mapRef = useRef<MapView>(null)

  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: 0, // Москва
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })

  const [notifications] = useState(3)
  const [isMapSettingsOpen, setIsMapSettingsOpen] = useState(false)

  const handleMapPress = (event: any) => {
    // Обновляем координаты точки на экране при нажатии на карту
    if (event.nativeEvent && event.nativeEvent.coordinate) {
      const { latitude, longitude } = event.nativeEvent.coordinate
      dispatch(
        updateCoordinates({
          lat: latitude,
          lng: longitude,
        })
      )
    }

    // Закрываем меню настроек карты при нажатии на карту
    if (isMapSettingsOpen) {
      setIsMapSettingsOpen(false)
    }
  }

  const handleRegionChange = (region: Region) => {
    setCurrentRegion(region)
  }

  const handleReadyToggle = async () => {
    dispatch(toggleReady())
    // Отправляем обновление статуса готовности в WebSocket
    await locationService.sendReadyStatusUpdate()
  }

  const handleMapSettingsToggle = (isOpen: boolean) => {
    setIsMapSettingsOpen(isOpen)
  }

  const handleLogout = async () => {
    try {
      WebSocketService.disconnect()
      if (tokenState) {
        await logoutMutation(tokenState).unwrap()
      }
      dispatch(logout())
      dispatch(api.util.resetApiState())
      dispatch(tasksApi.util.resetApiState())
      locationService.stopLocationUpdates()
    } catch (error) {
      console.error("Ошибка при выходе:", error)
      dispatch(logout())
      dispatch(api.util.resetApiState())
      dispatch(tasksApi.util.resetApiState())
      WebSocketService.disconnect()
      locationService.stopLocationUpdates()
    }
  }

  // Обработчики для задач
  const handleTaskAccept = async (taskId: string) => {
    try {
      await acceptTask(taskId).unwrap()
    } catch (error) {
      console.error("Ошибка при принятии задачи:", error)
    }
  }

  const handleTaskReject = async (taskId: string) => {
    try {
      await rejectTask(taskId).unwrap()
    } catch (error) {
      console.error("Ошибка при отклонении задачи:", error)
    }
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
          latitude: userLocation.latitude || 0,
          longitude: userLocation.longitude || 0,
        }}
        timestamp={userLocation.timestamp ? new Date(userLocation.timestamp) : new Date()}
        onReadyToggle={handleReadyToggle}
        isReady={isReady}
        notifications={notifications}
        userName={userCallSign || "Позывной"}
        mapType={mapState.mapType}
        onMapTypeChange={changeMapType}
        onMapSettingsToggle={handleMapSettingsToggle}
        onLogout={handleLogout}
        isLocationServiceRunning={isLocationServiceRunning}
        locationError={locationError}
        tasks={tasks}
        onTaskAccept={handleTaskAccept}
        onTaskReject={handleTaskReject}
        isTasksLoading={isTasksLoading}
      />

      <CustomMapView
        style={styles.map}
        onRegionChange={handleRegionChange}
        showsUserLocation={true}
        followsUserLocation={false}
        onPress={handleMapPress}
        mapRef={mapRef}
      ></CustomMapView>

      {/* Кнопки зума */}
      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} />

      {/* Кнопка центрирования на пользователе */}
      <View style={styles.centerOnUserContainer}>
        <CenterOnUserButton
          onPress={centerOnUser}
          isLocationAvailable={
            userLocation.isTracking && !!userLocation.latitude
          }
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
