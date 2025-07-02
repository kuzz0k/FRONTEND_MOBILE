import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocationService } from '../hooks/useLocationService';

export default function LocationDebugPanel() {
  const {
    isLocationServiceRunning,
    lastLocation,
    locationError,
    startLocationUpdates,
    stopLocationUpdates,
    getCurrentLocation,
  } = useLocationService();

  const formatLocation = (location: any) => {
    if (!location) return 'Нет данных';
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Геолокация</Text>
      
      <View style={styles.statusRow}>
        <View style={[
          styles.indicator,
          { backgroundColor: isLocationServiceRunning ? '#4CAF50' : '#f44336' }
        ]} />
        <Text style={styles.statusText}>
          {isLocationServiceRunning ? 'Активна' : 'Неактивна'}
        </Text>
      </View>

      {lastLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Координаты: {formatLocation(lastLocation)}
          </Text>
          <Text style={styles.timeText}>
            Время: {formatTime(lastLocation.timestamp)}
          </Text>
          {lastLocation.accuracy && (
            <Text style={styles.accuracyText}>
              Точность: {lastLocation.accuracy.toFixed(0)}м
            </Text>
          )}
        </View>
      )}

      {locationError && (
        <Text style={styles.errorText}>{locationError}</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.startButton]}
          onPress={startLocationUpdates}
          disabled={isLocationServiceRunning}
        >
          <Text style={styles.buttonText}>Запустить</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.stopButton]}
          onPress={stopLocationUpdates}
          disabled={!isLocationServiceRunning}
        >
          <Text style={styles.buttonText}>Остановить</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.getButton]}
          onPress={getCurrentLocation}
        >
          <Text style={styles.buttonText}>Получить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  locationInfo: {
    marginBottom: 10,
    paddingVertical: 5,
  },
  locationText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  accuracyText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 80,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  getButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
