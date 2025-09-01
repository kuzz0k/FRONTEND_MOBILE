import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useAppSelector } from '../../hooks/redux';
import { selectPointTasks } from '../../store/reducers/tasksSlice';
import { TASK_DOT } from '../../types/types';

/**
 * Phase 1 Web fallback map implementation (Leaflet via WebView).
 * Features implemented:
 *  - Показывает текущее местоположение пользователя (если есть)
 *  - Показывает задачи (точки)
 *  - Клик по карте -> onPress
 *  - Клик по маркеру задачи -> onTaskPress
 * TODO (фазы последующие):
 *  - Mogs / Aircrafts / Polylines (истории) / Полигоны / Drag user marker / Confirm overlay
 *  - Синхронизация region (масштаб, центр) при зуме и перетаскивании
 */

export interface WebFallbackMapViewProps {
  style?: any;
  onPress?: (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => void;
  onTaskPress?: (task: TASK_DOT) => void;
  userDraggable?: boolean; // зарезервировано
  targetCoordinates?: { latitude: number; longitude: number } | null;
  onConfirmMove?: () => void;
  onCancelMove?: () => void;
  isDragMode?: boolean;
}

export interface WebFallbackHandle {
  zoomIn: () => void;
  zoomOut: () => void;
}

// Простая HTML страница с Leaflet. Грузим тайлы OSM (бесплатно).
// Используем data-init JSON для начальной инициализации.
const leafletHtml = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
  <style>
    html, body, #map { height:100%; margin:0; padding:0; background:#000; }
    .task-marker { color:#fff; font:12px/30px sans-serif; text-align:center; width:30px; height:30px; border-radius:15px; border:2px solid #fff; box-shadow:0 2px 5px rgba(0,0,0,.4); }
    .user-marker { width:18px; height:18px; margin:-9px 0 0 -9px; border-radius:9px; background:#1976D2; border:2px solid #fff; box-shadow:0 0 0 4px rgba(25,118,210,0.3); }
  </style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script>
  const RN = window.ReactNativeWebView; // eslint-disable-line
  let map; let tasksLayer = L.layerGroup(); let userMarker; let tasksIndex = {}; let targetMarker; // id -> data

  function init(initial) {
    const center = initial.center || { lat:0, lng:0 };
    map = L.map('map', { zoomControl: false, attributionControl: false }).setView([center.lat, center.lng], initial.zoom || 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19}).addTo(map);
    tasksLayer.addTo(map);
    map.on('click', (e) => {
      RN && RN.postMessage(JSON.stringify({ type: 'map-press', payload: { lat: e.latlng.lat, lng: e.latlng.lng } }));
    });
  }

  function syncUserLocation(user) {
    if (!user || !user.latitude || !user.longitude) return;
    const lat = user.latitude, lng = user.longitude;
    if (!userMarker) {
      userMarker = L.marker([lat, lng], { icon: L.divIcon({ className: '', html: '<div class="user-marker"></div>' }) }).addTo(map);
    } else {
      userMarker.setLatLng([lat, lng]);
    }
  }

  function markerColor(status) {
    switch(status) {
      case 'PENDING': return '#FFA726';
      case 'ACCEPTED': return '#42A5F5';
      case 'COMPLETED': return '#66BB6A';
      case 'REJECTED': return '#EF5350';
      default: return '#757575';
    }
  }
  function markerLabel(status) {
    switch(status) {
      case 'PENDING': return 'О';
      case 'ACCEPTED': return 'П';
      case 'COMPLETED': return 'З';
      case 'REJECTED': return 'О';
      default: return '?';
    }
  }
  function syncTasks(tasks) {
    tasksLayer.clearLayers();
    tasksIndex = {};
    (tasks||[]).forEach(t => {
      const html = '<div class="task-marker" style="background:' + markerColor(t.status) + '\">' + markerLabel(t.status) + '</div>';
      const m = L.marker([t.coordinates.lat, t.coordinates.lng], { icon: L.divIcon({ className: '', html }) });
      m.on('click', (e)=> { L.DomEvent.stopPropagation(e); RN && RN.postMessage(JSON.stringify({ type:'task-press', id: t.id })); });
      m.addTo(tasksLayer);
      tasksIndex[t.id] = t;
    });
  }

  function syncTarget(target) {
    if (!map) return;
    if (target && typeof target.latitude === 'number' && typeof target.longitude === 'number') {
      const lat = target.latitude, lng = target.longitude;
      if (!targetMarker) {
        targetMarker = L.marker([lat, lng], { icon: L.divIcon({className:'', html:'<div style="width:28px;height:28px;border-radius:14px;background:#FF9800;border:2px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font:12px sans-serif;color:#fff;">★</div>'}) });
        targetMarker.addTo(map);
      } else {
        targetMarker.setLatLng([lat, lng]);
      }
    } else if (targetMarker) {
      map.removeLayer(targetMarker); targetMarker = null;
    }
  }

  function applyZoom(delta) { if(map){ map.setZoom(map.getZoom()+delta); } }

  function handleMessage(msg) {
    const { type, payload } = msg;
    switch(type) {
      case 'init': init(payload); break;
      case 'state':
        syncUserLocation(payload.userLocation);
        syncTasks(payload.tasks);
        syncTarget(payload.targetCoordinates);
        break;
      case 'focus':
        if (map && payload.center) { map.setView([payload.center.lat, payload.center.lng], payload.zoom || map.getZoom(), { animate:true }); }
        break;
      case 'zoom':
        applyZoom(payload.delta || 0);
        break;
    }
  }

  window.addEventListener('message', (event) => {
    try { const data = JSON.parse(event.data); handleMessage(data); } catch(e) {}
  });
  document.addEventListener('message', (event) => { // Android
    try { const data = JSON.parse(event.data); handleMessage(data); } catch(e) {}
  });

  RN && RN.postMessage(JSON.stringify({ type: 'ready' }));
</script>
</body>
</html>`;

export const WebFallbackMapView = forwardRef<WebFallbackHandle, WebFallbackMapViewProps>(({ style, onPress, onTaskPress, targetCoordinates, onConfirmMove, onCancelMove, isDragMode }, ref) => {
  const webRef = useRef<WebView>(null);

  const userLocation = useAppSelector((s) => s.userLocation);
  const tasks = useAppSelector(selectPointTasks) as TASK_DOT[] | undefined;
  const mapRegion = useAppSelector((s) => s.map.region);

  // Подготовка состояния для отправки внутрь WebView
  const statePayload = useMemo(() => ({
    center: { lat: mapRegion.latitude, lng: mapRegion.longitude },
    zoom: 5, // TODO: хранить зум в redux при необходимости
    userLocation,
    tasks: tasks || [],
    targetCoordinates,
  }), [mapRegion, userLocation, tasks]);

  const postMessage = useCallback((obj: any) => {
    const json = JSON.stringify(obj);
    try {
      webRef.current?.postMessage(json);
    } catch {}
  }, []);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ready') {
        // Инициализируем карту и отправляем состояние
        postMessage({ type: 'init', payload: { center: statePayload.center, zoom: statePayload.zoom } });
        postMessage({ type: 'state', payload: statePayload });
      } else if (data.type === 'map-press') {
        const { lat, lng } = data.payload;
        onPress?.({ nativeEvent: { coordinate: { latitude: lat, longitude: lng } } });
      } else if (data.type === 'task-press') {
        const task = (tasks || []).find(t => t.id === data.id);
        if (task && onTaskPress) onTaskPress(task);
      }
    } catch {
      // silent
    }
  };

  // При изменении состояния посылаем обновление
  useEffect(() => {
    postMessage({ type: 'state', payload: statePayload });
  }, [statePayload, postMessage]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => postMessage({ type: 'zoom', payload: { delta: 1 } }),
    zoomOut: () => postMessage({ type: 'zoom', payload: { delta: -1 } }),
  }), [postMessage]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html: leafletHtml }}
        style={styles.webview}
        onMessage={handleMessage}
        allowFileAccess
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        bounces={false}
        scrollEnabled={false}
      />
      {targetCoordinates && isDragMode && (onConfirmMove || onCancelMove) && (
        <View style={styles.confirmOverlay} pointerEvents="box-none">
          <View style={styles.confirmBox} pointerEvents="auto">
            <View style={styles.confirmHeader}>
              <View style={styles.targetDot} />
            </View>
            <View style={styles.coordsRowBox}>
              <View>
                <View><Text style={styles.coordsLabel}>Новая позиция</Text></View>
                <Text style={styles.coordsVal}>{targetCoordinates.latitude.toFixed(6)}, {targetCoordinates.longitude.toFixed(6)}</Text>
              </View>
            </View>
            <View style={styles.confirmButtons}>
              {onCancelMove && (
                <Text onPress={onCancelMove} style={[styles.confirmBtn, styles.cancelBtn]}>Отмена</Text>
              )}
              {onConfirmMove && (
                <Text onPress={onConfirmMove} style={[styles.confirmBtn, styles.okBtn]}>ОК</Text>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
});

WebFallbackMapView.displayName = 'WebFallbackMapView'

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1, backgroundColor: '#000' },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  confirmBox: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 12,
    width: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  confirmHeader: { alignItems: 'center', marginBottom: 6 },
  targetDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF9800',
    borderWidth: 2,
    borderColor: '#fff',
  },
  coordsRowBox: { marginBottom: 8 },
  coordsLabel: { fontSize: 12, color: '#555' },
  coordsVal: { fontSize: 12, fontWeight: '600', color: '#222', marginTop: 2 },
  confirmButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  confirmBtn: { fontSize: 13, fontWeight: '600', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6 },
  cancelBtn: { backgroundColor: '#eee', color: '#555' },
  okBtn: { backgroundColor: '#4CAF50', color: '#fff' },
});

export default WebFallbackMapView;
