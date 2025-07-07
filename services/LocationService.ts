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

  constructor() {
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
        console.warn("WebSocket не подключен, местоположение не отправлено")
        return
      }

      // Формируем payload в соответствии с типом MogUpdated
      const state = store.getState();
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
      console.log("Местоположение отправлено:", mogUpdatedPayload)
    } catch (error) {
      console.error("Ошибка при отправке местоположения:", error)
      store.dispatch(setLocationError("Ошибка при отправке местоположения"))
    }
  }

  private async updateLocation(): Promise<void> {
    const locationData = await this.getCurrentLocation()
    if (locationData) {
      await this.sendLocationToServer(locationData)
    }
  }

  public async startLocationUpdates(): Promise<boolean> {
    if (this.isRunning) {
      console.warn("Отправка местоположения уже запущена")
      return true
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

    console.log("Периодическая отправка местоположения запущена")
    return true
  }

  public stopLocationUpdates(): void {
    if (!this.isRunning) {
      console.warn("Отправка местоположения уже остановлена")
      return
    }

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    this.isRunning = false
    store.dispatch(setTrackingStatus(false))
    console.log("Периодическая отправка местоположения остановлена")
  }

  public isLocationServiceRunning(): boolean {
    return this.isRunning
  }

  public async getOneTimeLocation(): Promise<LocationData | null> {
    return await this.getCurrentLocation()
  }

  public async sendReadyStatusUpdate(): Promise<void> {
    try {
      if (!WebSocketService.isConnected) {
        console.warn("WebSocket не подключен, статус готовности не отправлен")
        return
      }

      // Получаем текущее местоположение
      const locationData = await this.getCurrentLocation()
      if (!locationData) {
        console.warn("Не удалось получить текущее местоположение для отправки статуса готовности")
        return
      }

      // Формируем payload в соответствии с типом MogUpdated
      const state = store.getState();
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
      console.log("Статус готовности отправлен:", mogUpdatedPayload)
    } catch (error) {
      console.error("Ошибка при отправке статуса готовности:", error)
    }
  }
}

export const locationService = new LocationService()
