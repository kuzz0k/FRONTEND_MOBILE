import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // or appropriate icon library
import { MAP_LABELS } from '../constants/consts';

const { width } = Dimensions.get('window');

interface HeaderModalProps {
  isVisible: boolean;
  coords: { latitude: number; longitude: number };
  timestamp: Date | string;
  onGetRoute: () => void;
  onReadyToggle: () => void;
  isReady: boolean;
  notifications: number;
  userName: string;
  mapType: 'hybrid' | 'standard' | 'satellite';
  onMapTypeChange: (mapType: 'hybrid' | 'standard' | 'satellite') => void;
  onMapSettingsToggle?: (isOpen: boolean) => void;
}

/**
 * HeaderModal overlay component
 * Props:
 *  - isVisible: boolean
 *  - coords: { latitude: number, longitude: number }
 *  - timestamp: Date or string
 *  - onGetRoute: () => void
 *  - onReadyToggle: () => void
 *  - isReady: boolean
 *  - notifications: number
 *  - userName: string
 *  - mapType: 'hybrid' | 'standard' | 'satellite'
 *  - onMapTypeChange: (mapType: 'hybrid' | 'standard' | 'satellite') => void
 */
export default function HeaderModal({
  isVisible,
  coords,
  timestamp,
  onGetRoute,
  onReadyToggle,
  isReady,
  notifications,
  userName,
  mapType,
  onMapTypeChange,
  onMapSettingsToggle,
}: HeaderModalProps) {
  const [isMapSettingsOpen, setIsMapSettingsOpen] = useState(false);
  
  const formatCoords = (lat: number, lon: number) => `Ш: ${lat.toFixed(6)}  Д: ${lon.toFixed(6)}`;
  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear().toString().slice(-2)}`;
  };

  const mapTypeLabels = MAP_LABELS;

  const handleMapTypeSelect = (selectedMapType: 'hybrid' | 'standard' | 'satellite') => {
    onMapTypeChange(selectedMapType);
    setIsMapSettingsOpen(false);
    onMapSettingsToggle?.(false);
  };

  const toggleMapSettings = () => {
    const newState = !isMapSettingsOpen;
    setIsMapSettingsOpen(newState);
    onMapSettingsToggle?.(newState);
  };

  return isVisible ? (
    <View style={styles.modalContainer} pointerEvents="box-none">
      <View style={styles.container}>
        <View style={styles.coordsBlock}>
          <Text style={styles.coordsText}>{formatCoords(coords.latitude, coords.longitude)}</Text>
          <Text style={styles.timeText}>{formatTime(timestamp)}</Text>
        </View>

        <TouchableOpacity style={styles.routeButton} onPress={onGetRoute}>
          <Text style={styles.routeText}>Получить маршрут</Text>
        </TouchableOpacity>

        <View style={styles.statusBlock}>
          <TouchableOpacity onPress={onReadyToggle} style={styles.statusButton}>
            <Icon
              name={isReady ? 'check-circle' : 'circle'}
              size={20}
              color={isReady ? '#4CAF50' : '#999'}
            />
            <Text style={styles.statusText}>{isReady ? 'Готов' : 'Не готов'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.mapSettingsButton} 
            onPress={toggleMapSettings}
          >
            <Icon name="map" size={20} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="message-circle" size={20} color="#333" />
            {notifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifications}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.userButton}>
            <Icon name="user" size={20} color="#333" />
            <Text style={styles.userText}>{userName}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Выпадающее меню настроек карты */}
      {isMapSettingsOpen && (
        <View 
          style={styles.mapSettingsDropdown}
        >
          {Object.entries(mapTypeLabels).map(([type, label]) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.mapTypeOption,
                mapType === type && styles.mapTypeOptionSelected
              ]}
              onPress={() => handleMapTypeSelect(type as 'hybrid' | 'standard' | 'satellite')}
            >
              <Text style={[
                styles.mapTypeText,
                mapType === type && styles.mapTypeTextSelected
              ]}>
                {label}
              </Text>
              {mapType === type && (
                <Icon name="check" size={16} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  ) : null;
}

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    margin: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 4,
    width: width - 24,
  },
  coordsBlock: {
    flex: 2,
  },
  coordsText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  routeButton: {
    backgroundColor: '#555',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  routeText: {
    color: '#fff',
    fontSize: 12,
  },
  statusBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#333',
  },
  mapSettingsButton: {
    marginRight: 12,
  },
  notificationButton: {
    marginRight: 12,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#F00',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#333',
  },
  mapSettingsDropdown: {
    position: 'absolute',
    top: 60,
    right: 80,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    paddingVertical: 8,
    minWidth: 120,
  },
  mapTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  mapTypeOptionSelected: {
    backgroundColor: '#f0f0f0',
  },
  mapTypeText: {
    fontSize: 14,
    color: '#333',
  },
  mapTypeTextSelected: {
    color: '#4CAF50',
    fontWeight: '500',
  },
});
