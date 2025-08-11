import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, LayoutChangeEvent, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';

interface ConfirmLocationOverlayProps {
  mapRef: React.RefObject<MapView | null>;
  coordinate: { latitude: number; longitude: number };
  markerPixelYShift?: number; // смещение вверх от центра маркера
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmLocationOverlay: React.FC<ConfirmLocationOverlayProps> = ({
  mapRef,
  coordinate,
  markerPixelYShift = 28,
  onConfirm,
  onCancel,
}) => {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [popupSize, setPopupSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const dimensions = Dimensions.get('window');
  const updatingRef = useRef(false);

  const updatePoint = useCallback(async () => {
    if (!mapRef.current || !coordinate || updatingRef.current) return;
    try {
      updatingRef.current = true;
      // @ts-ignore exists at runtime
      const p = await mapRef.current.pointForCoordinate(coordinate);
      if (p && typeof p.x === 'number' && typeof p.y === 'number') {
        setPoint(p);
      }
  } catch {
      // silent
    } finally {
      updatingRef.current = false;
    }
  }, [mapRef, coordinate]);

  useEffect(() => {
    updatePoint();
  }, [coordinate, updatePoint]);

  useEffect(() => {
    const id = setInterval(updatePoint, 500);
    return () => clearInterval(id);
  }, [updatePoint]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== popupSize.w || height !== popupSize.h) {
      setPopupSize({ w: width, h: height });
    }
  };

  if (!point) return null;

  let left = point.x - popupSize.w / 2;
  const top = point.y - markerPixelYShift - popupSize.h;
  const margin = 8;
  if (left < margin) left = margin;
  if (left + popupSize.w > dimensions.width - margin) {
    left = dimensions.width - margin - popupSize.w;
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View
        style={[styles.popup, { left, top: Math.max(top, margin) }]}
        onLayout={onLayout}
      >
        <Text style={styles.title}>Переместить сюда?</Text>
        <Text style={styles.coordinates}>
          {coordinate.latitude.toFixed(6)}, {coordinate.longitude.toFixed(6)}
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={onConfirm}
          >
            <Text style={styles.confirmButtonText}>ОК</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.arrowContainer}>
          <View style={styles.arrow} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  popup: {
    position: 'absolute',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#333',
  },
  coordinates: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 12,
    color: '#666',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
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
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  arrowContainer: {
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'white',
    elevation: 4,
  },
});

export default ConfirmLocationOverlay;
