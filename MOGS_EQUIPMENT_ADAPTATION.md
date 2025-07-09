# Адаптация компонентов для React Native Maps

## Обзор изменений

Компоненты `Mogs` и `Equipments` были успешно адаптированы с Leaflet на React Native Maps.

## Основные изменения

### 1. MogsLayer и MogsMarker
- **Файлы**: `components/Map/Mogs/MogsLayer.tsx`, `components/Map/Mogs/MogsMarker.tsx`
- **Изменения**:
  - Заменен импорт с `@renderer/hooks/redux` на `../../../hooks/redux`
  - Заменен leaflet `Marker` на `react-native-maps` `Marker` и `Callout`
  - Создан кастомный маркер с помощью React Native `View` и `Text`
  - Добавлены стили с помощью `StyleSheet`
  - Координаты преобразованы из формата `[lat, lng]` в `{latitude, longitude}`

### 2. EquipmentLayer и EquipmentMarker
- **Файлы**: `components/Map/Equipments/EquipmentLayer.tsx`, `components/Map/Equipments/EquipmentMarker.tsx`
- **Изменения**:
  - Аналогичные изменения импортов и компонентов
  - Создан кастомный маркер оборудования
  - Добавлен `Callout` с детальной информацией об оборудовании

### 3. Areas (PolygonArea и SectorArea)
- **Файлы**: `components/Map/Equipments/Areas/PolygonArea.tsx`, `components/Map/Equipments/Areas/SectorArea.tsx`
- **Изменения**:
  - Заменен leaflet `Polygon` на `react-native-maps` `Polygon`
  - Координаты преобразованы в формат `{latitude, longitude}`
  - Удален `useMap` hook (не нужен в react-native-maps)
  - Добавлена прозрачность через hex alpha вместо `fillOpacity`

### 4. CustomMapView
- **Файл**: `components/Map/CustomMapView.tsx`
- **Изменения**:
  - Добавлены импорты для `MogsLayer` и `EquipmentLayer`
  - Интегрированы новые слои внутри `MapView`

## Использование

Компоненты автоматически отображаются на карте, если:

1. **Для Mogs**: Redux состояние `state.mog` содержит массив объектов типа `Mog`
2. **Для Equipment**: Redux состояние `state.equipment.data` содержит массив объектов типа `EquipmentType` и `state.equipment.visible` равен `true`

## Структура данных

### Mog
```typescript
type Mog = {
  username: string,
  callSign: string,
  ready: boolean,
  connected: boolean,
  coordinates: Coordinates
}
```

### EquipmentType
```typescript
type EquipmentType = {
  id: string,
  model: string,
  name: string,
  type: EquipmentVariaties,
  connected: boolean,
  coordinates: Coordinates,
}
```

### Coordinates
```typescript
type Coordinates = {
  lat: number,
  lng: number,
}
```

## Интеграция с Redux

Компоненты автоматически получают данные из Redux store:
- `useAppSelector(state => state.mog)` - для данных Mogs
- `useAppSelector(state => state.equipment)` - для данных Equipment

## Особенности React Native Maps

1. **Маркеры**: Используют кастомные React Native компоненты вместо HTML/CSS
2. **Callouts**: Заменяют leaflet Popups
3. **Координаты**: Формат `{latitude, longitude}` вместо `[lat, lng]`
4. **Стили**: React Native StyleSheet вместо CSS/SCSS
5. **Полигоны**: Поддерживаются с небольшими изменениями API

## Готовность к использованию

Все компоненты готовы к использованию и автоматически интегрированы в `CustomMapView`. Данные должны поступать через WebSocket и сохраняться в Redux store, как это уже реализовано в `MainPage.tsx`.
