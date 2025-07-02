import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { locationService, LocationData } from '../services/LocationService';

export const useLocationService = () => {
  const userLocation = useSelector((state: RootState) => state.userLocation);
  const [localError, setLocalError] = useState<string | null>(null);

  // Автоматический запуск сервиса при монтировании компонента
  useEffect(() => {
    const startService = async () => {
      try {
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
      locationService.stopLocationUpdates();
    };
  }, []);

  const startLocationUpdates = async (): Promise<boolean> => {
    try {
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
  };
};
