import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { ClassificationType, setSelectedAirCraft } from '../../store/reducers/aircraftSlice';
import { selectAircraftTasks, selectPointTasks } from '../../store/reducers/tasksSlice';
import { AircraftType, TASK_DOT } from '../../types/types';

export interface WebFallbackMapViewProps {
  style?: any;
  onPress?: (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => void;
  onTaskPress?: (task: TASK_DOT) => void;
  onAircraftPress?: (aircraftId: string) => void;
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

// HTML с поддержкой popup для дронов
const leafletHtml = `<!doctype html><html><head><meta charset=\"utf-8\"/><meta name=\"viewport\" content=\"width=device-width,initial-scale=1,maximum-scale=1\"/><link rel=\"stylesheet\" href=\"https://unpkg.com/leaflet@1.9.4/dist/leaflet.css\"/><style>html,body,#map{height:100%;margin:0;padding:0;background:#000}.task-marker{color:#fff;font:12px/30px sans-serif;text-align:center;width:30px;height:30px;border-radius:15px;border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,.4)}.user-marker{width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:9px;background:#1976D2;border:2px solid #fff;box-shadow:0 0 0 4px rgba(25,118,210,.3)}.refpoint-marker{width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:9px;background:#9C27B0;border:2px solid #fff;box-shadow:0 0 0 4px rgba(156,39,176,.25)}.aircraft-marker{width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:11px;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#fff;box-shadow:0 2px 4px rgba(0,0,0,.45)}.aircraft-marker.selected{box-shadow:0 0 6px 3px rgba(255,255,255,.8),0 2px 4px rgba(0,0,0,.45)}.aircraft-popup-wrapper{background:rgba(0,0,0,.85);color:#fff;border-radius:10px;padding:0}.aircraft-popup-wrapper .leaflet-popup-content{margin:0;padding:0}.aircraft-popup{padding:8px 10px;font:12px/1.3 sans-serif}.aircraft-popup .ap-title{font-weight:600;margin:0 0 4px;color:#FFEB3B;font-size:13px}.aircraft-popup .row{margin:2px 0}</style></head><body><div id=\"map\"></div><script src=\"https://unpkg.com/leaflet@1.9.4/dist/leaflet.js\"></script><script>const RN=window.ReactNativeWebView;let map,tasksLayer=L.layerGroup(),aircraftsLayer=L.layerGroup(),userMarker,refPointMarker,targetMarker,selectedAircraftId=null;const aircraftMarkers={};const aircraftPolylines={};function init(i){const c=i.center||{lat:0,lng:0};map=L.map('map',{zoomControl:false,attributionControl:false}).setView([c.lat,c.lng],i.zoom||5);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);tasksLayer.addTo(map);aircraftsLayer.addTo(map);map.on('click',e=>{RN&&RN.postMessage(JSON.stringify({type:'map-press',payload:{lat:e.latlng.lat,lng:e.latlng.lng}}))})}function syncUserLocation(u){if(!u||!u.latitude||!u.longitude)return;const{latitude:lat,longitude:lng}=u;if(!userMarker){userMarker=L.marker([lat,lng],{icon:L.divIcon({className:'',html:'<div class=\\"user-marker\\"></div>'})}).addTo(map)}else userMarker.setLatLng([lat,lng])}function syncRefPoint(p){if(!map)return; if(p&&typeof p.lat==='number'&&typeof p.lng==='number'){if(!refPointMarker){refPointMarker=L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:'<div class=\\"refpoint-marker\\"></div>'})}).addTo(map)}else refPointMarker.setLatLng([p.lat,p.lng])}else if(refPointMarker){map.removeLayer(refPointMarker);refPointMarker=null}}function markerColor(s){switch(s){case'PENDING':return'#FFA726';case'ACCEPTED':return'#42A5F5';case'COMPLETED':return'#66BB6A';case'REJECTED':return'#EF5350';default:return'#757575'}}function markerLabel(s){switch(s){case'PENDING':return'О';case'ACCEPTED':return'П';case'COMPLETED':return'З';case'REJECTED':return'О';default:return'?' }}function popupHtml(a){function v(x,suf){return (x===0||x)?x+(suf||''):'N/A'}return '<div class=\\"aircraft-popup\\">'+ '<div class=\\"ap-title\\">'+(a.name||'Дрон')+'</div>' + '<div class=\\"row\\"><b>ID:</b> '+a.aircraftId+'</div>' + '<div class=\\"row\\"><b>Зафиксирован:</b> '+(a.detectedBy||'N/A')+'</div>' + '<div class=\\"row\\"><b>Курс:</b> '+v(a.course,'°')+'</div>' + '<div class=\\"row\\"><b>Высота:</b> '+v(a.heightInMeters,'м')+'</div>' + '<div class=\\"row\\"><b>Скорость:</b> '+v(a.speedInMeters,'м/с')+'</div>' + '<div class=\\"row\\"><b>Дистанция:</b> '+(a.position&&a.position.distanceInMeters!=null?a.position.distanceInMeters+'м':'N/A')+'</div>' + '<div class=\\"row\\"><b>Азимут:</b> '+(a.position&&a.position.azimuth!=null?a.position.azimuth+'°':'N/A')+'</div>' + '<div class=\\"row\\"><b>Коорд:</b> '+(a.last?(a.last.lat.toFixed(5)+', '+a.last.lng.toFixed(5)):'N/A')+'</div>' + '</div>'}function syncTasks(list){tasksLayer.clearLayers();(list||[]).forEach(t=>{const html='<div class=\\"task-marker\\" style=\\"background:'+markerColor(t.status)+'\\">'+markerLabel(t.status)+'</div>';const m=L.marker([t.coordinates.lat,t.coordinates.lng],{icon:L.divIcon({className:'',html})});m.on('click',e=>{L.DomEvent.stopPropagation(e);RN&&RN.postMessage(JSON.stringify({type:'task-press',id:t.id}))});m.addTo(tasksLayer)})}function markerHtmlFor(a){const rot=typeof a.course==='number'?a.course:0;return '<div class=\\"aircraft-marker'+(a.aircraftId===selectedAircraftId?' selected':'')+'\\" style=\\"background:'+(a.color||'#F11D36')+';transform:rotate('+rot+'deg);\\">✈</div>'}function syncAircrafts(arr){const nextIds={};(arr||[]).forEach(a=>{if(!a.last)return;nextIds[a.aircraftId]=true;const existing=aircraftMarkers[a.aircraftId];if(existing){const wasOpen=existing.isPopupOpen&&existing.isPopupOpen();existing.setLatLng([a.last.lat,a.last.lng]);existing.setIcon(L.divIcon({className:'',html:markerHtmlFor(a)}));const p=existing.getPopup&&existing.getPopup();if(p){p.setContent(popupHtml(a));}if(wasOpen){existing.openPopup();}const poly=aircraftPolylines[a.aircraftId];if(Array.isArray(a.path)&&a.path.length>1){const latlngs=a.path.map(p=>[p.lat,p.lng]);if(poly){poly.setLatLngs(latlngs);}else{aircraftPolylines[a.aircraftId]=L.polyline(latlngs,{color:a.color||'red',weight:2,dashArray:'5,5'}).addTo(aircraftsLayer)}}else if(poly){aircraftsLayer.removeLayer(poly);delete aircraftPolylines[a.aircraftId];}}else{if(Array.isArray(a.path)&&a.path.length>1){aircraftPolylines[a.aircraftId]=L.polyline(a.path.map(p=>[p.lat,p.lng]),{color:a.color||'red',weight:2,dashArray:'5,5'}).addTo(aircraftsLayer)}const m=L.marker([a.last.lat,a.last.lng],{icon:L.divIcon({className:'',html:markerHtmlFor(a)})});m.bindPopup(popupHtml(a),{className:'aircraft-popup-wrapper',autoPan:false,closeButton:false});m.on('click',e=>{L.DomEvent.stopPropagation(e);m.openPopup();RN&&RN.postMessage(JSON.stringify({type:'aircraft-press',id:a.aircraftId}))});m.addTo(aircraftsLayer);aircraftMarkers[a.aircraftId]=m;}});Object.keys(aircraftMarkers).forEach(id=>{if(!nextIds[id]){const m=aircraftMarkers[id];aircraftsLayer.removeLayer(m);delete aircraftMarkers[id];} });Object.keys(aircraftPolylines).forEach(id=>{if(!nextIds[id]){const pl=aircraftPolylines[id];aircraftsLayer.removeLayer(pl);delete aircraftPolylines[id];}})}function syncTarget(t){if(!map)return;if(t&&typeof t.latitude==='number'&&typeof t.longitude==='number'){const{latitude:lat,longitude:lng}=t;if(!targetMarker){targetMarker=L.marker([lat,lng],{icon:L.divIcon({className:'',html:'<div style=\\"width:28px;height:28px;border-radius:14px;background:#FF9800;border:2px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font:12px sans-serif;color:#fff;\\">★</div>'})}).addTo(map)}else targetMarker.setLatLng([lat,lng])}else if(targetMarker){map.removeLayer(targetMarker);targetMarker=null}}function applyZoom(d){if(map)map.setZoom(map.getZoom()+d)}function handleMessage(m){const{type,payload}=m;switch(type){case'init':init(payload);break;case'state':selectedAircraftId=payload.selectedAircraftId||null;syncUserLocation(payload.userLocation);syncTasks(payload.tasks);syncAircrafts(payload.aircrafts);syncTarget(payload.targetCoordinates);syncRefPoint(payload.refpoint);break;case'focus':if(map&&payload.center)map.setView([payload.center.lat,payload.center.lng],payload.zoom||map.getZoom(),{animate:true});break;case'zoom':applyZoom(payload.delta||0);break}}window.addEventListener('message',ev=>{try{handleMessage(JSON.parse(ev.data))}catch(e){}});document.addEventListener('message',ev=>{try{handleMessage(JSON.parse(ev.data))}catch(e){}});RN&&RN.postMessage(JSON.stringify({type:'ready'}));</script></body></html>`;

export const WebFallbackMapView = forwardRef<WebFallbackHandle, WebFallbackMapViewProps>(({
  style,
  onPress,
  onTaskPress,
  onAircraftPress,
  targetCoordinates,
  onConfirmMove,
  onCancelMove,
  isDragMode,
}, ref) => {
  const dispatch = useAppDispatch();
  const webRef = useRef<WebView>(null);

  const userLocation = useAppSelector(s => s.userLocation);
  const refpoint = useAppSelector(s => s.reperDot);
  const tasks = useAppSelector(selectPointTasks) as TASK_DOT[] | undefined;
  const aircraftTasks = useAppSelector(selectAircraftTasks);
  const mapRegion = useAppSelector(s => s.map.region);
  const aircrafts = useAppSelector(s => s.airCrafts.data) as AircraftType[];
  const classification = useAppSelector(s => s.airCrafts.airCraftClassification);
  const selectedAircraft = useAppSelector(s => s.airCrafts.selectedAirCraft);

  const preparedAircrafts = useMemo(() => (aircrafts || []).map((a: AircraftType) => {
  const cls = classification.find((c: ClassificationType) => c.type === a.type);
    const last = a.coordinates?.length ? a.coordinates[a.coordinates.length - 1] : undefined;
    if (!last) return null;
    // override color if there is a TO_AIRCRAFT task for this aircraft
    const related = aircraftTasks.find(t => t.aircraftId === a.aircraftId);
    const colorByTask = related ? ((): string => {
      switch (related.status) {
        case 'PENDING': return '#FFA726';
        case 'ACCEPTED': return '#42A5F5';
        case 'COMPLETED': return '#66BB6A';
        case 'REJECTED': return '#EF5350';
        default: return cls?.color || '#F11D36';
      }
    })() : (cls?.color || '#F11D36');
    return {
      aircraftId: a.aircraftId,
      color: colorByTask,
      name: cls?.name || '—',
      course: a.course,
      heightInMeters: a.heightInMeters,
      speedInMeters: a.speedInMeters,
      detectedBy: a.detectedBy,
      position: a.position,
      last,
      path: a.coordinates || [],
    };
  }).filter(Boolean), [aircrafts, classification, aircraftTasks]) as any[];

  const statePayload = useMemo(() => ({
    center: { lat: mapRegion.latitude, lng: mapRegion.longitude },
    zoom: 5,
    userLocation,
    tasks: tasks || [],
    aircrafts: preparedAircrafts,
    selectedAircraftId: selectedAircraft?.aircraftId || null,
    targetCoordinates,
    refpoint: (refpoint.lat != null && refpoint.lng != null) ? { lat: refpoint.lat, lng: refpoint.lng } : null,
  }), [mapRegion, userLocation, tasks, preparedAircrafts, selectedAircraft, targetCoordinates, refpoint]);

  const postMessage = useCallback((obj: any) => { try { webRef.current?.postMessage(JSON.stringify(obj)); } catch {} }, []);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case 'ready':
          postMessage({ type: 'init', payload: { center: statePayload.center, zoom: statePayload.zoom } });
          postMessage({ type: 'state', payload: statePayload });
          break;
        case 'map-press':
          onPress?.({ nativeEvent: { coordinate: { latitude: data.payload.lat, longitude: data.payload.lng } } });
          break;
        case 'task-press': {
          const t = (tasks || []).find(x => x.id === data.id);
          if (t && onTaskPress) onTaskPress(t);
          break; }
        case 'aircraft-press': {
          const a = aircrafts.find((x: AircraftType) => x.aircraftId === data.id);
          if (a) { dispatch(setSelectedAirCraft(a)); onAircraftPress?.(a.aircraftId); }
          break; }
      }
    } catch { /* silent */ }
  };

  useEffect(() => { postMessage({ type: 'state', payload: statePayload }); }, [statePayload, postMessage]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => postMessage({ type: 'zoom', payload: { delta: 1 } }),
    zoomOut: () => postMessage({ type: 'zoom', payload: { delta: -1 } }),
  }), [postMessage]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
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
            <View style={styles.confirmHeader}><View style={styles.targetDot} /></View>
            <View style={styles.coordsRowBox}>
              <View>
                <View><Text style={styles.coordsLabel}>Новая позиция</Text></View>
                <Text style={styles.coordsVal}>{targetCoordinates.latitude.toFixed(6)}, {targetCoordinates.longitude.toFixed(6)}</Text>
              </View>
            </View>
            <View style={styles.confirmButtons}>
              {onCancelMove && (<Text onPress={onCancelMove} style={[styles.confirmBtn, styles.cancelBtn]}>Отмена</Text>)}
              {onConfirmMove && (<Text onPress={onConfirmMove} style={[styles.confirmBtn, styles.okBtn]}>ОК</Text>)}
            </View>
          </View>
        </View>
      )}
    </View>
  );
});

WebFallbackMapView.displayName = 'WebFallbackMapView';

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
