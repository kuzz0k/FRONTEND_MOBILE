import { useAppDispatch, useAppSelector } from "@/hooks/redux"
import { api, useLogoutMutation } from "@/services/auth"
import { useGetGlobalStateQuery } from "@/services/globalState"
import { tasksApi, useAcceptTaskMutation, useCompleteTaskMutation, useGetTasksQuery, useRejectTaskMutation } from "@/services/tasks"
import { WebSocketService } from "@/services/WebSocket"
import { deleteAirCraft, setAirCraftLost, setAirCraftsState, updateAircraftType } from "@/store/reducers/aircraftSlice"
import { addMog, deleteMog, disconnectMog, setMogs, updateMog } from "@/store/reducers/mogSlice"
import { setReperDot } from "@/store/reducers/reperDotSlice"
import { setEquipments } from "@/store/reducers/rlsSlice"
import { addTask, removeTask, setTasks, updateTask, updateTaskStatus } from "@/store/reducers/tasksSlice"
import { ALL_TOPICS, STATUS, TASK_DOT } from "@/types/types"
import { Audio } from 'expo-av'
import React, { useCallback, useEffect, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import MapView, { Region } from "react-native-maps"
import HeaderModal from "../components/HeaderModal"
import CustomMapView from "../components/Map/CustomMapView"
import { WebFallbackHandle } from "../components/Map/WebFallbackMapView"
import ZoomControls from "../components/ui/ZoomControls"
import { useLocationService } from "../hooks/useLocationService"
import { useMap } from "../hooks/useMap"
import { locationService } from "../services/LocationService"
import { logout, toggleReady } from "../store/reducers/authSlice"
import { updateCoordinates } from "../store/reducers/coordinatesSlice"

// Dimensions no longer needed; map uses flex:1

export default function MainPage() {
  const tokenState = useAppSelector((state) => state.user.accessToken)
  const isReady = useAppSelector((state) => state.user.isReady) // Берем из Redux
  const userCallSign = useAppSelector((state) => state.user.callSign) // Берем позывной из Redux
  const userLocation = useAppSelector((state) => state.userLocation) // Координаты пользователя
  const tasksFromState = useAppSelector((state) => state.tasks.tasks) // Задачи из Redux стейта
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
    console.log(tasksFromState)
    console.log(data)
    // Ждем пока загрузятся и data, и tasks, чтобы правильно отфильтровать aircrafts
    if (data && tasksFromState.length > 0) {
      dispatch(setMogs(data.mogs))
      dispatch(setEquipments(data.equipment))
      
      // Фильтруем aircrafts - оставляем только те, которые есть в задачах
      const filteredAircrafts = data.aircrafts.filter((aircraft) => 
        tasksFromState.some((task: any) => task.aircraftId === aircraft.aircraftId)
      );
      console.log('[MainPage] Initial aircrafts filter:', {
        totalAircrafts: data.aircrafts.length,
        filteredAircrafts: filteredAircrafts.length,
        totalTasks: tasksFromState.length
      });
      dispatch(setAirCraftsState(filteredAircrafts))
      
      // Инициализируем реперную точку из global-state
      if (data.refpoint?.coordinates) {
        dispatch(setReperDot({
          lat: data.refpoint.coordinates.lat,
          lng: data.refpoint.coordinates.lng,
        }))
      }
    } else if (data && tasksFromState.length === 0) {
      // Если задач нет, все равно инициализируем остальные данные, но без aircrafts
      dispatch(setMogs(data.mogs))
      dispatch(setEquipments(data.equipment))
      dispatch(setAirCraftsState([]))
      if (data.refpoint?.coordinates) {
        dispatch(setReperDot({
          lat: data.refpoint.coordinates.lat,
          lng: data.refpoint.coordinates.lng,
        }))
      }
    }
  }, [isSuccess, data, dispatch, tasksFromState])

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

  const handleAirCraftUpdated = useCallback((airCraftData: any) => {
    // Проверяем, есть ли aircraftId в задачах
    console.log('[MainPage] Aircraft update received:', {
      aircraftId: airCraftData.aircraftId,
      totalTasks: tasksFromState,
      tasksWithAircraftId: tasksFromState.filter((t: any) => t.aircraftId).length
    });
    const hasTaskWithAircraft = tasksFromState.some(
      (task: any) => task.aircraftId === airCraftData.aircraftId
    );
    
    console.log('[MainPage] hasTaskWithAircraft:', hasTaskWithAircraft, 'for aircraftId:', airCraftData.aircraftId);
    // Добавляем/обновляем дрон только если он есть в задачах
    if (hasTaskWithAircraft) {
      dispatch(updateAircraftType(airCraftData));
    }
  }, [dispatch, tasksFromState]);

  const handleAirCraftDelete = useCallback((airCraftData: any) => {
    dispatch(deleteAirCraft(airCraftData))
  }, [dispatch]);

  const handleAirCraftLost = useCallback((airCraftData: any) => {
    dispatch(setAirCraftLost(airCraftData))
  }, [dispatch]);

  // Мемоизированные callback для обработки обновлений задач через WEBSOCKET
  const handleTaskCreated = useCallback((taskData: any) => {
    dispatch(addTask(taskData));
    // Воспроизводим звук уведомления
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/notification.mp3')
        );
        await sound.playAsync();
      } catch (e) {
        // Ошибку можно залогировать, если нужно
      }
    })();
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
    const id = typeof taskData === 'string' ? taskData : taskData?.id;
    if (id) {
      // Находим удаляемую задачу и если у неё есть aircraftId, удаляем дрон
      const taskToRemove = tasksFromState.find((t: any) => t.id === id);
      if (taskToRemove && 'aircraftId' in taskToRemove && taskToRemove.aircraftId) {
        dispatch(deleteAirCraft({ aircraftId: taskToRemove.aircraftId } as any));
      }
      dispatch(removeTask(id));
    }
  }, [dispatch, tasksFromState]);

  const handleTaskDeleted = useCallback((taskData: any) => {
    const id = typeof taskData === 'string' ? taskData : taskData?.id;
    if (id) {
      // Находим удаляемую задачу и если у неё есть aircraftId, удаляем дрон
      const taskToRemove = tasksFromState.find((t: any) => t.id === id);
      if (taskToRemove && 'aircraftId' in taskToRemove && taskToRemove.aircraftId) {
        dispatch(deleteAirCraft({ aircraftId: taskToRemove.aircraftId } as any));
      }
      dispatch(removeTask(id));
    }
  }, [dispatch, tasksFromState]);

  // REFPOINT handlers
  const handleRefPointCreated = useCallback((refPointData: any) => {
    const coords = refPointData?.coordinates || refPointData;
    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
      dispatch(setReperDot({ lat: coords.lat, lng: coords.lng }))
    }
  }, [dispatch])

  const handleRefPointUpdated = useCallback((refPointData: any) => {
    const coords = refPointData?.coordinates || refPointData;
    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
      dispatch(setReperDot({ lat: coords.lat, lng: coords.lng }))
    }
  }, [dispatch])

  const handleRefPointDeleted = useCallback(() => {
    dispatch(setReperDot({ lat: null, lng: null }))
  }, [dispatch])

  //   const handleAirCraftExtrapolation = useCallback((airCraftData) => {
  //   dispatch(updateAircraftType(airCraftData))
  // }, [dispatch]);

  // const handleAirCraftExtrapolationDelete =useCallback((airCraftData) => {
  //   dispatch(deleteAirCraft(airCraftData))
  // }, [dispatch])

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
    // REFPOINT
    [ALL_TOPICS.REFPOINT_CREATED]: handleRefPointCreated,
    [ALL_TOPICS.REFPOINT_UPDATED]: handleRefPointUpdated,
    [ALL_TOPICS.REFPOINT_DELETED]: handleRefPointDeleted,
    // TASKS
    [ALL_TOPICS.TASK_CREATED]: handleTaskCreated,
    [ALL_TOPICS.TASK_EDITED]: handleTaskEdited,
    [ALL_TOPICS.TASK_IMPACTED]: handleTaskImpacted,
    [ALL_TOPICS.TASK_ACCEPTED]: handleTaskAccepted,
    [ALL_TOPICS.TASK_REJECTED]: handleTaskRejected,
    [ALL_TOPICS.TASK_COMPLETED]: handleTaskCompleted,
    [ALL_TOPICS.TASK_REMOVED]: handleTaskRemoved,
    [ALL_TOPICS.TASK_DELETED]: handleTaskDeleted,
    // EXTAPOLATION
    [ALL_TOPICS.AIRCRAFT_EXTRAPOLATION]: handleAirCraftUpdated,
    [ALL_TOPICS.AIRCRAFT_EXTRAPOLATION_DELETE]: handleAirCraftDelete,
    // [ALL_TOPICS.MOG_CONNECTED]:
  }), [handleMogQuit, handleMogUpdate, handleMogDisconnected, handleMogEntered, handleAirCraftUpdated, handleAirCraftDelete, handleAirCraftLost, handleRefPointCreated, handleRefPointUpdated, handleRefPointDeleted, handleTaskCreated, handleTaskEdited, handleTaskImpacted, handleTaskAccepted, handleTaskRejected, handleTaskCompleted, handleTaskRemoved, handleTaskDeleted]);

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
  const webMapRef = useRef<WebFallbackHandle | null>(null)
  // Флаг для игнорирования "проскальзывающего" нажатия по карте после закрытия окна задач
  const ignoreNextMapPressRef = useRef(false)

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
  const [, setShowMoveConfirmation] = useState(false)
  const [targetCoordinates, setTargetCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const isGpsInitialized = useRef(false)

  // Инициализация GPS только при первом запуске
  useEffect(() => {
    const initializeGPS = async () => {
      if (!isGpsInitialized.current) {
        isGpsInitialized.current = true;
        // console.log("MainPage: инициализация GPS");
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

    // Игнорируем первое нажатие, которое может "проскочить" сразу после закрытия модалки задач
    if (ignoreNextMapPressRef.current) {
      ignoreNextMapPressRef.current = false
      return
    }

    // Дополнительная проверка - если открыто любое модальное окно, игнорируем клики по карте
    if (isMapSettingsOpen || isTasksModalOpen || isUserMenuOpen) {
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
    if (!isOpen) {
      // На короткое время игнорируем следующее нажатие по карте (закрывающий тап)
      ignoreNextMapPressRef.current = true
      setTimeout(() => { ignoreNextMapPressRef.current = false }, 300)
    }
  }

  const handleUserMenuToggle = (isOpen: boolean) => {
    setIsUserMenuOpen(isOpen)
  }

  const handleLogout = async () => {
    try {
      WebSocketService.disconnect()
      if (tokenState) {
        await logoutMutation().unwrap()
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
    // console.log("Нажата задача:", task)
    
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
    if (webMapRef.current) {
      webMapRef.current.zoomIn()
      return
    }
    const newRegion = {
      ...currentRegion,
      latitudeDelta: currentRegion.latitudeDelta / 2,
      longitudeDelta: currentRegion.longitudeDelta / 2,
    }
    mapRef.current?.animateToRegion(newRegion, 300)
  }

  const zoomOut = () => {
    if (webMapRef.current) {
      webMapRef.current.zoomOut()
      return
    }
    const newRegion = {
      ...currentRegion,
      latitudeDelta: currentRegion.latitudeDelta * 2,
      longitudeDelta: currentRegion.longitudeDelta * 2,
    }
    mapRef.current?.animateToRegion(newRegion, 300)
  }

  // const centerOnUser = () => {
  //   if (userLocation.latitude && userLocation.longitude) {
  //     const newRegion = {
  //       latitude: userLocation.latitude,
  //       longitude: userLocation.longitude,
  //       latitudeDelta: 0.01, // Приближенный зум
  //       longitudeDelta: 0.01,
  //     }
  //     mapRef.current?.animateToRegion(newRegion, 500)
  //   }
  // }

  const handleGpsToggle = async () => {
    // console.log("handleGpsToggle: isDragMode =", isDragMode, "isLocationServiceRunning =", isLocationServiceRunning);
    
    if (isDragMode) {
      // Если в режиме перетаскивания, переключаемся на автоматическое отслеживание
      // console.log("Переключение из DRAG режима в GPS режим");
      setIsDragMode(false)
      await startLocationUpdates()
    } else if (isLocationServiceRunning) {
      // Если GPS включен, переключаемся в режим перетаскивания
      // console.log("Переключение из GPS режима в DRAG режим");
      setIsDragMode(true)
      stopLocationUpdates()
    } else {
      // Если GPS выключен, включаем автоматическое отслеживание
      // console.log("Включение GPS режима");
      setIsDragMode(false)
      await startLocationUpdates()
    }
  }

  const handleUserMarkerDrag = async (coordinate: { latitude: number; longitude: number }) => {
    // console.log("handleUserMarkerDrag: isDragMode =", isDragMode, "coordinate =", coordinate);
    if (isDragMode) {
      // Отправляем новые координаты на сервер только в режиме перетаскивания
      await sendManualLocationUpdate(coordinate)
    }
  }

  const handleConfirmMove = async () => {
    if (targetCoordinates && isDragMode) {
      // console.log("handleConfirmMove: sending coordinates =", targetCoordinates);
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
        webMapRef={webMapRef}
        onTaskPress={handleTaskPress}
        onUserMarkerDrag={handleUserMarkerDrag}
        enableUserMarkerDrag={isDragMode}
        targetCoordinates={targetCoordinates}
        onConfirmMove={handleConfirmMove}
        onCancelMove={handleCancelMove}
      ></CustomMapView>

      {/* Кнопки зума */}
      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} />

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
  centerOnUserContainer: {
    position: "absolute",
    right: 20,
    bottom: 200,
  },
})
