import * as Location from "expo-location"
import {
    setLocationError,
    setTrackingStatus,
    updateUserLocation,
} from "../store/reducers/userLocationSlice"
import { store } from "../store/store"
import { MogUpdated, TOPICS_MOGS } from "../types/types"
import { WebSocketService } from "./WebSocket"

export interface LocationData {
  latitude: number
  longitude: number
  timestamp: number
  accuracy?: number
  altitude?: number
  speed?: number
  heading?: number
}

class LocationService {
  private intervalId: number | null = null
  private isRunning: boolean = false
  private readonly LOCATION_INTERVAL = 5000 // 5 секунд
  private locationPermissionGranted: boolean = false
  private instanceId: number

  constructor() {
    this.instanceId = Math.random();
    console.log("LocationService: создан экземпляр с ID =", this.instanceId);
    this.checkLocationPermission()
  }

  private async checkLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      this.locationPermissionGranted = status === "granted"

      if (!this.locationPermissionGranted) {
        console.warn("Разрешение на геолокацию не предоставлено")
      }

      return this.locationPermissionGranted
    } catch (error) {
      console.error("Ошибка при запросе разрешения на геолокацию:", error)
      return false
    }
  }

  private async getCurrentLocation(): Promise<LocationData | null> {
    try {
      if (!this.locationPermissionGranted) {
        const hasPermission = await this.checkLocationPermission()
        if (!hasPermission) {
          return null
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      })

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
        accuracy: location.coords.accuracy || undefined,
        altitude: location.coords.altitude || undefined,
        speed: location.coords.speed || undefined,
        heading: location.coords.heading || undefined,
      }

      return locationData
    } catch (error) {
      console.error("Ошибка при получении местоположения:", error)
      return null
    }
  }

  private async sendLocationToServer(
    locationData: LocationData
  ): Promise<void> {
    try {
      console.log("sendLocationToServer: автоматическая отправка, isRunning =", this.isRunning);
      
      // Дополнительная проверка - не отправляем автоматические обновления если сервис остановлен
      if (!this.isRunning) {
        console.log("sendLocationToServer: отменено, сервис остановлен");
        return;
      }
      
      // Обновляем Redux store
      store.dispatch(
        updateUserLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          altitude: locationData.altitude,
          speed: locationData.speed,
          heading: locationData.heading,
          timestamp: locationData.timestamp,
        })
      )

      if (!WebSocketService.isConnected) {
        // console.warn("WebSocket не подключен, местоположение не отправлено")
        return
      }

      // Формируем payload в соответствии с типом MogUpdated
      const state = store.getState()
      const mogUpdatedPayload: MogUpdated = {
        username: state.user.username || "mobile_user", // берем из Redux состояния
        callSign: state.user.callSign || "мобильный", // берем из Redux состояния
        ready: state.user.isReady, // берем из Redux состояния
        coordinates: {
          lat: locationData.latitude,
          lng: locationData.longitude,
        },
      }

      const message = JSON.stringify({
        topic: TOPICS_MOGS.UPDATED,
        payload: mogUpdatedPayload,
      })

      WebSocketService.sendMessage(message)
    } catch (error) {
      console.error("Ошибка при отправке местоположения:", error)
      store.dispatch(setLocationError("Ошибка при отправке местоположения"))
    }
  }

  private async updateLocation(): Promise<void> {
    console.log(`updateLocation [${this.instanceId}]: автоматическое обновление, isRunning =`, this.isRunning);
    if (!this.isRunning) {
      console.log(`updateLocation [${this.instanceId}]: отменено, сервис остановлен`);
      return;
    }
    
    const locationData = await this.getCurrentLocation()
    if (locationData) {
      await this.sendLocationToServer(locationData)
    }
  }

  public async startLocationUpdates(): Promise<boolean> {
    console.log(`startLocationUpdates [${this.instanceId}]: вызван, isRunning =`, this.isRunning, "intervalId =", this.intervalId);
    
    if (this.isRunning) {
      console.warn(`startLocationUpdates [${this.instanceId}]: Отправка местоположения уже запущена`)
      return true
    }

    // Убеждаемся, что предыдущий интервал очищен
    if (this.intervalId) {
      console.log(`startLocationUpdates [${this.instanceId}]: очищаем предыдущий интервал`, this.intervalId);
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const hasPermission = await this.checkLocationPermission()
    if (!hasPermission) {
      console.error("Нет разрешения на геолокацию")
      store.dispatch(setLocationError("Нет разрешения на геолокацию"))
      return false
    }

    this.isRunning = true
    store.dispatch(setTrackingStatus(true))

    // Отправляем первое местоположение сразу
    await this.updateLocation()

    // Запускаем периодическую отправку
    this.intervalId = setInterval(async () => {
      await this.updateLocation()
    }, this.LOCATION_INTERVAL)

    console.log("Периодическая отправка местоположения запущена, isRunning =", this.isRunning, "intervalId =", this.intervalId)
    return true
  }

  public stopLocationUpdates(): void {
    console.log("stopLocationUpdates: вызван, isRunning =", this.isRunning, "intervalId =", this.intervalId);
    
    if (!this.isRunning) {
      console.warn("Отправка местоположения уже остановлена")
      return
    }

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log("stopLocationUpdates: интервал очищен");
    }

    this.isRunning = false
    store.dispatch(setTrackingStatus(false))
    console.log("Периодическая отправка местоположения остановлена, isRunning =", this.isRunning)
  }

  public isLocationServiceRunning(): boolean {
    return this.isRunning
  }

  public async getOneTimeLocation(): Promise<LocationData | null> {
    return await this.getCurrentLocation()
  }

  public async sendReadyStatusUpdate(): Promise<void> {
    try {
      console.log("sendReadyStatusUpdate: вызван");
      
      if (!WebSocketService.isConnected) {
        console.warn("WebSocket не подключен, статус готовности не отправлен")
        return
      }

      // Получаем текущее состояние из Redux
      const state = store.getState()
      
      // Используем координаты из Redux store вместо получения новых GPS координат
      // Это позволяет в режиме drag использовать ручные координаты
      const userLocation = state.userLocation
      
      // Проверяем координаты: допускаем 0 как валидное значение (экватор/Гринвич), поэтому проверяем на undefined/null
      let { latitude, longitude } = userLocation;
      if (latitude == null || longitude == null) {
        console.warn("Координаты отсутствуют в Redux, пробуем получить одноразово через GPS");
        const loc = await this.getCurrentLocation();
        if (loc) {
          latitude = loc.latitude;
          longitude = loc.longitude;
          // Обновим Redux для согласованности
          store.dispatch(updateUserLocation({
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy: loc.accuracy,
            altitude: loc.altitude,
            speed: loc.speed,
            heading: loc.heading,
            timestamp: loc.timestamp,
          }));
        } else {
          console.warn("Не удалось получить координаты для отправки статуса готовности");
          return;
        }
      }

      // Формируем payload в соответствии с типом MogUpdated
      const mogUpdatedPayload: MogUpdated = {
        username: state.user.username || "mobile_user", // берем из Redux состояния
        callSign: state.user.callSign || "мобильный", // берем из Redux состояния
        ready: state.user.isReady, // берем из Redux состояния
        coordinates: {
          lat: latitude,
          lng: longitude,
        },
      }

      const message = JSON.stringify({
        topic: TOPICS_MOGS.UPDATED,
        payload: mogUpdatedPayload,
      })

      WebSocketService.sendMessage(message)
      console.log("Статус готовности отправлен с координатами из Redux:", mogUpdatedPayload)
    } catch (error) {
      console.error("Ошибка при отправке статуса готовности:", error)
    }
  }

  public async sendManualLocationUpdate(coordinates: { latitude: number; longitude: number }): Promise<void> {
    try {
      console.log("sendManualLocationUpdate: sending coordinates =", coordinates);
      
      if (!WebSocketService.isConnected) {
        console.warn("WebSocket не подключен, местоположение не отправлено")
        return
      }

      // Обновляем Redux store с новыми координатами
      console.log("sendManualLocationUpdate: обновляем Redux store");
      store.dispatch(
        updateUserLocation({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          timestamp: Date.now(),
        })
      )

      // Проверяем, что Redux действительно обновился
      const updatedState = store.getState();
      console.log("sendManualLocationUpdate: Redux обновлен, новые координаты =", {
        lat: updatedState.userLocation.latitude,
        lng: updatedState.userLocation.longitude,
        timestamp: updatedState.userLocation.timestamp
      });

      // Формируем payload в соответствии с типом MogUpdated
      const mogUpdatedPayload: MogUpdated = {
        username: updatedState.user.username || "mobile_user",
        callSign: updatedState.user.callSign || "мобильный",
        ready: updatedState.user.isReady,
        coordinates: {
          lat: coordinates.latitude,
          lng: coordinates.longitude,
        },
      }

      const message = JSON.stringify({
        topic: TOPICS_MOGS.UPDATED,
        payload: mogUpdatedPayload,
      })

      WebSocketService.sendMessage(message)
      console.log("Ручное обновление местоположения отправлено:", mogUpdatedPayload)
    } catch (error) {
      console.error("Ошибка при отправке ручного обновления местоположения:", error)
      store.dispatch(setLocationError("Ошибка при отправке местоположения"))
    }
  }
}

export const locationService = new LocationService()
