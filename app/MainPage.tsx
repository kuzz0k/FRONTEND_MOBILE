import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { api, useLogoutMutation } from "@/services/auth"
import { useGetGlobalStateQuery } from "@/services/globalState"
import { tasksApi, useAcceptTaskMutation, useCompleteTaskMutation, useGetTasksQuery, useRejectTaskMutation } from "@/services/tasks"
import { WebSocketService } from "@/services/WebSocket"
import { addMog, deleteMog, disconnectMog, setMogs, updateMog } from "@/store/reducers/mogSlice"
import { setEquipments } from "@/store/reducers/rlsSlice"
import { addTask, removeTask, setTasks, updateTask, updateTaskStatus } from "@/store/reducers/tasksSlice"
import { ALL_TOPICS, STATUS, TASK_DOT } from "@/types/types"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
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
import { deleteAirCraft, setAirCraftLost, setAirCraftsState, updateAircraftType } from "@/store/reducers/aircraftSlice"

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
  const [completeTask] = useCompleteTaskMutation()
  const { data: tasks, isLoading: isTasksLoading } = useGetTasksQuery(undefined, {
    skip: !tokenState, // Пропускаем запрос если нет токена
  })
  const { data, isSuccess } = useGetGlobalStateQuery()

  useEffect(() => {
    if (data) {
      dispatch(setMogs(data.mogs))
      dispatch(setEquipments(data.equipment))
      dispatch(setAirCraftsState(data.aircrafts))
    }
  }, [isSuccess, data, dispatch])

  useEffect(() => {
    if (tasks) {
      dispatch(setTasks(tasks))
    }
  }, [tasks, isTasksLoading, dispatch])

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

  const handleAirCraftUpdated = useCallback((airCraftData) => {
    dispatch(updateAircraftType(airCraftData))
  }, [dispatch]);

  const handleAirCraftDelete = useCallback((airCraftData) => {
    dispatch(deleteAirCraft(airCraftData))
  }, [dispatch]);

  const handleAirCraftLost = useCallback((airCraftData) => {
    dispatch(setAirCraftLost(airCraftData))
  }, [dispatch]);

  // Мемоизированные callback для обработки обновлений задач через WEBSOCKET
  const handleTaskCreated = useCallback((taskData: any) => {
    dispatch(addTask(taskData));
  }, [dispatch]);

  const handleTaskEdited = useCallback((taskData: any) => {
    // Обновляем всю задачу при редактировании
    dispatch(updateTask(taskData));
  }, [dispatch]);

  const handleTaskImpacted = useCallback((taskData: any) => {
    // При воздействии на задачу можем обновить её статус или другие поля
    dispatch(updateTask(taskData));
  }, [dispatch]);

  const handleTaskAccepted = useCallback((taskData: any) => {
    dispatch(updateTaskStatus({ taskId: taskData.id, status: STATUS.ACCEPTED }));
  }, [dispatch]);

  const handleTaskRejected = useCallback((taskData: any) => {
    dispatch(updateTaskStatus({ taskId: taskData.id, status: STATUS.REJECTED }));
  }, [dispatch]);

  const handleTaskCompleted = useCallback((taskData: any) => {
    dispatch(updateTaskStatus({ taskId: taskData.id, status: STATUS.COMPLETED }));
  }, [dispatch]);

  const handleTaskRemoved = useCallback((taskData: any) => {
    dispatch(removeTask(taskData.id));
  }, [dispatch]);

  const handleTaskDeleted = useCallback((taskData: any) => {
    dispatch(removeTask(taskData.id));
  }, [dispatch]);

  // const handleMogConnected = useCallback((mogConnectedData) => {
  //   dispatch(updateMog())
  // })


  // ТОПИКИ ДЛЯ ПОДПИСКИ
  const eventHandlers = useCallback(() => ({
    // MOGS
    [ALL_TOPICS.MOG_QUIT]: handleMogQuit,
    [ALL_TOPICS.MOG_UPDATED]: handleMogUpdate,
    [ALL_TOPICS.MOG_DISCONNECTED]: handleMogDisconnected,
    [ALL_TOPICS.MOG_ENTERED]: handleMogEntered,
        // AIRCRAFTS
    [ALL_TOPICS.AIRCRAFT_UPDATED]: handleAirCraftUpdated,
    [ALL_TOPICS.AIRCRAFT_DELETED]: handleAirCraftDelete,
    [ALL_TOPICS.AIRCRAFT_LOST]: handleAirCraftLost,
    // TASKS
    [ALL_TOPICS.TASK_CREATED]: handleTaskCreated,
    [ALL_TOPICS.TASK_EDITED]: handleTaskEdited,
    [ALL_TOPICS.TASK_IMPACTED]: handleTaskImpacted,
    [ALL_TOPICS.TASK_ACCEPTED]: handleTaskAccepted,
    [ALL_TOPICS.TASK_REJECTED]: handleTaskRejected,
    [ALL_TOPICS.TASK_COMPLETED]: handleTaskCompleted,
    [ALL_TOPICS.TASK_REMOVED]: handleTaskRemoved,
    [ALL_TOPICS.TASK_DELETED]: handleTaskDeleted,
    // [ALL_TOPICS.MOG_CONNECTED]:
  }), [handleMogQuit, handleMogUpdate, handleMogDisconnected, handleMogEntered, handleTaskCreated, handleTaskEdited, handleTaskImpacted, handleTaskAccepted, handleTaskRejected, handleTaskCompleted, handleTaskRemoved, handleTaskDeleted]);

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
  const { 
    isLocationServiceRunning, 
    locationError, 
    startLocationUpdates, 
    stopLocationUpdates,
    sendManualLocationUpdate 
  } = useLocationService(false) // Отключаем автоматический запуск

  const mapRef = useRef<MapView>(null)

  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: 0, // Москва
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })

  const [notifications] = useState(3)
  const [isMapSettingsOpen, setIsMapSettingsOpen] = useState(false)
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isDragMode, setIsDragMode] = useState(false) // Режим перетаскивания
  const [showMoveConfirmation, setShowMoveConfirmation] = useState(false)
  const [targetCoordinates, setTargetCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const isGpsInitialized = useRef(false)

  // Инициализация GPS только при первом запуске
  useEffect(() => {
    const initializeGPS = async () => {
      if (!isGpsInitialized.current) {
        isGpsInitialized.current = true;
        console.log("MainPage: инициализация GPS");
        await startLocationUpdates();
      }
    };
    
    initializeGPS();
  }, [startLocationUpdates]); // Запускаем только при изменении функции

  const handleMapPress = (event: any) => {
    // Проверяем, что событие действительно произошло на карте, а не на модальных компонентах
    if (!event.nativeEvent || !event.nativeEvent.coordinate) {
      return
    }

    // Дополнительная проверка - если открыто любое модальное окно, игнорируем клики по карте
    if (showMoveConfirmation || isMapSettingsOpen || isTasksModalOpen || isUserMenuOpen) {
      return
    }

    const { latitude, longitude } = event.nativeEvent.coordinate
    
    if (isDragMode) {
      // В режиме перетаскивания показываем попап подтверждения
      setTargetCoordinates({ latitude, longitude })
      setShowMoveConfirmation(true)
    } else {
      // Обычное поведение - обновляем координаты точки на экране
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

  const handleTasksModalToggle = (isOpen: boolean) => {
    setIsTasksModalOpen(isOpen)
  }

  const handleUserMenuToggle = (isOpen: boolean) => {
    setIsUserMenuOpen(isOpen)
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

  const handleTaskComplete = async (taskId: string) => {
    try {
      await completeTask(taskId).unwrap()
    } catch (error) {
      console.error("Ошибка при завершении задачи:", error)
    }
  }

  // Обработчик нажатия на маркер задачи
  const handleTaskPress = useCallback((task: TASK_DOT) => {
    console.log("Нажата задача:", task)
    
    // Центрируем карту на задаче
    const newRegion = {
      latitude: task.coordinates.lat,
      longitude: task.coordinates.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }
    mapRef.current?.animateToRegion(newRegion, 500)
    
    // Обновляем координаты в Redux (для отображения в интерфейсе)
    dispatch(
      updateCoordinates({
        lat: task.coordinates.lat,
        lng: task.coordinates.lng,
      })
    )
  }, [dispatch])

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

  const handleGpsToggle = async () => {
    console.log("handleGpsToggle: isDragMode =", isDragMode, "isLocationServiceRunning =", isLocationServiceRunning);
    
    if (isDragMode) {
      // Если в режиме перетаскивания, переключаемся на автоматическое отслеживание
      console.log("Переключение из DRAG режима в GPS режим");
      setIsDragMode(false)
      await startLocationUpdates()
    } else if (isLocationServiceRunning) {
      // Если GPS включен, переключаемся в режим перетаскивания
      console.log("Переключение из GPS режима в DRAG режим");
      setIsDragMode(true)
      stopLocationUpdates()
    } else {
      // Если GPS выключен, включаем автоматическое отслеживание
      console.log("Включение GPS режима");
      setIsDragMode(false)
      await startLocationUpdates()
    }
  }

  const handleUserMarkerDrag = async (coordinate: { latitude: number; longitude: number }) => {
    console.log("handleUserMarkerDrag: isDragMode =", isDragMode, "coordinate =", coordinate);
    if (isDragMode) {
      // Отправляем новые координаты на сервер только в режиме перетаскивания
      await sendManualLocationUpdate(coordinate)
    }
  }

  const handleConfirmMove = async () => {
    if (targetCoordinates && isDragMode) {
      console.log("handleConfirmMove: sending coordinates =", targetCoordinates);
      await sendManualLocationUpdate(targetCoordinates)
      setShowMoveConfirmation(false)
      setTargetCoordinates(null)
    }
  }

  const handleCancelMove = () => {
    setShowMoveConfirmation(false)
    setTargetCoordinates(null)
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
        onTaskAccept={handleTaskAccept}
        onTaskReject={handleTaskReject}
        onTaskComplete={handleTaskComplete}
        isTasksLoading={isTasksLoading}
        onGpsToggle={handleGpsToggle}
        isDragMode={isDragMode}
        onTasksModalToggle={handleTasksModalToggle}
        onUserMenuToggle={handleUserMenuToggle}
      />

      <CustomMapView
        style={styles.map}
        onRegionChange={handleRegionChange}
        showsUserLocation={true}
        followsUserLocation={false}
        onPress={handleMapPress}
        mapRef={mapRef}
        onTaskPress={handleTaskPress}
        onUserMarkerDrag={handleUserMarkerDrag}
        enableUserMarkerDrag={isDragMode}
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

      {/* Модальное окно подтверждения перемещения */}
      <Modal
        transparent={true}
        visible={showMoveConfirmation}
        animationType="fade"
        onRequestClose={handleCancelMove}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Переместить сюда?</Text>
            <Text style={styles.modalSubtitle}>
              Ваше местоположение будет обновлено на выбранной точке
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelMove}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmMove}
              >
                <Text style={styles.confirmButtonText}>Переместить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    margin: 20,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
})
