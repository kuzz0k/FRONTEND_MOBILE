import React, { FC, useCallback, useMemo } from "react"
import { LatLng, Marker, Polyline } from "react-native-maps"
import { useAppDispatch, useAppSelector } from "../../../hooks/redux"
import {
    setSelectedAirCraft,
} from "../../../store/reducers/aircraftSlice"
import { selectAircraftTasks } from "../../../store/reducers/tasksSlice"
import { AircraftType, STATUS } from "../../../types/types"

interface AirCraftsMarkerProps {
  data: AircraftType
}

export const AirCraftsMarker: FC<AirCraftsMarkerProps> = ({ data }) => {
  const dispatch = useAppDispatch()
  const airCraftsClassification = useAppSelector(
    (state) => state.airCrafts.airCraftClassification
  )
  const aircraftTasks = useAppSelector(selectAircraftTasks)


  const classificationData = useMemo(
    () =>
      airCraftsClassification.find((item) => item.type === data.type) ?? {
        color: "red",
        name: "Отсутствуют данные",
        type: "ERROR",
      },
    [airCraftsClassification, data.type]
  )

  // Если у дрона есть назначенная задача TO_AIRCRAFT, меняем цвет маркера в зависимости от статуса
  const markerColor = useMemo(() => {
    const related = aircraftTasks.find(t => t.aircraftId === data.aircraftId)
    if (!related) return classificationData.color
    switch (related.status) {
      case STATUS.PENDING: return '#FFA726' // оранжевый
      case STATUS.ACCEPTED: return '#42A5F5' // синий
      case STATUS.COMPLETED: return '#66BB6A' // зелёный
      case STATUS.REJECTED: return '#EF5350' // красный
      default: return classificationData.color
    }
  }, [aircraftTasks, data.aircraftId, classificationData.color])

  const currentPosition: LatLng = useMemo(
    () =>
      data.coordinates.length > 0
        ? {
            latitude: data.coordinates[data.coordinates.length - 1].lat,
            longitude: data.coordinates[data.coordinates.length - 1].lng,
          }
        : { latitude: 0, longitude: 0 },
    [data.coordinates]
  )

  const pathCoordinates: LatLng[] = useMemo(
    () =>
      data.coordinates.map((coord) => ({
        latitude: coord.lat,
        longitude: coord.lng,
      })),
    [data.coordinates]
  )

  const handleClick = useCallback(() => {
    console.log('Aircraft marker pressed:', data.aircraftId)
    console.log('Classification data:', classificationData)
    console.log('Aircraft data:', JSON.stringify(data, null, 2))
    dispatch(setSelectedAirCraft(data))
  }, [dispatch, data, classificationData])

  // Проверяем валидность координат
  const isValidPosition = currentPosition.latitude !== 0 && currentPosition.longitude !== 0


  return (
    <>
      {isValidPosition && (
        <Marker
          coordinate={currentPosition}
          pinColor={markerColor}
          onPress={handleClick}
          title={`✈️ ${classificationData.name}`}
          description={
            `${data.aircraftId} | ` +
            `Курс: ${data.course ?? 'N/A'}° | ` +
            `Высота: ${data.heightInMeters ?? 'N/A'}м | ` +
            `Скорость: ${data.speedInMeters ?? 'N/A'}м/с | ` +
            // Добавляем последние координаты с веб-сокета
            `Коорд: ${currentPosition.latitude.toFixed(5)}, ${currentPosition.longitude.toFixed(5)}`
          }
        />
      )}

      {pathCoordinates.length > 1 && (
        <Polyline
          coordinates={pathCoordinates}
          strokeColor={classificationData.color}
          strokeWidth={2}
          lineDashPattern={[5, 5]}
        />
      )}
    </>
  )
}
