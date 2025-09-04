import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { LocationData, locationService } from '../services/LocationService';
import { RootState } from '../store/store';

export const useLocationService = (autoStart: boolean = true) => {
  const userLocation = useSelector((state: RootState) => state.userLocation);
  const [localError, setLocalError] = useState<string | null>(null);

  // Автоматический запуск сервиса при монтировании компонента
  useEffect(() => {
    // console.log("useLocationService useEffect: autoStart =", autoStart);
    if (!autoStart) return;

    const startService = async () => {
      try {
        // console.log("useLocationService: автоматический запуск GPS");
        const started = await locationService.startLocationUpdates();
        if (!started) {
          setLocalError('Не удалось запустить службу геолокации');
        }
      } catch (error) {
        console.error('Ошибка при запуске службы геолокации:', error);
        setLocalError('Ошибка при запуске службы геолокации');
      }
    };

    startService();

    // Очистка при размонтировании компонента
    return () => {
      // console.log("useLocationService: очистка при размонтировании");
      locationService.stopLocationUpdates();
    };
  }, [autoStart]);

  const startLocationUpdates = async (): Promise<boolean> => {
    try {
      // console.log("useLocationService.startLocationUpdates: вызван вручную");
      setLocalError(null);
      const started = await locationService.startLocationUpdates();
      if (!started) {
        setLocalError('Не удалось запустить службу геолокации');
      }
      return started;
    } catch (error) {
      console.error('Ошибка при запуске отправки местоположения:', error);
      setLocalError('Ошибка при запуске отправки местоположения');
      return false;
    }
  };

  const stopLocationUpdates = (): void => {
    try {
      // console.log("useLocationService.stopLocationUpdates: вызван");
      locationService.stopLocationUpdates();
      setLocalError(null);
    } catch (error) {
      console.error('Ошибка при остановке отправки местоположения:', error);
      setLocalError('Ошибка при остановке отправки местоположения');
    }
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      setLocalError(null);
      const location = await locationService.getOneTimeLocation();
      if (!location) {
        setLocalError('Не удалось получить текущее местоположение');
      }
      return location;
    } catch (error) {
      console.error('Ошибка при получении местоположения:', error);
      setLocalError('Ошибка при получении местоположения');
      return null;
    }
  };

  const sendManualLocationUpdate = async (coordinates: { latitude: number; longitude: number }): Promise<void> => {
    try {
      setLocalError(null);
      await locationService.sendManualLocationUpdate(coordinates);
    } catch (error) {
      console.error('Ошибка при отправке ручного обновления местоположения:', error);
      setLocalError('Ошибка при отправке местоположения');
    }
  };

  const currentLocation = userLocation.timestamp > 0 ? {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    accuracy: userLocation.accuracy,
    altitude: userLocation.altitude,
    speed: userLocation.speed,
    heading: userLocation.heading,
    timestamp: userLocation.timestamp,
  } : null;

  return {
    isLocationServiceRunning: userLocation.isTracking,
    lastLocation: currentLocation,
    locationError: userLocation.lastError || localError,
    startLocationUpdates,
    stopLocationUpdates,
    getCurrentLocation,
    sendManualLocationUpdate,
  };
};
