import React, { FC, useCallback, useMemo } from "react"
import { LatLng, Marker, Polyline } from "react-native-maps"
import { useAppDispatch, useAppSelector } from "../../../hooks/redux"
import {
  setSelectedAirCraft,
} from "../../../store/reducers/aircraftSlice"
import { AircraftType } from "../../../types/types"

interface AirCraftsMarkerProps {
  data: AircraftType
}

export const AirCraftsMarker: FC<AirCraftsMarkerProps> = ({ data }) => {
  const dispatch = useAppDispatch()
  const airCraftsClassification = useAppSelector(
    (state) => state.airCrafts.airCraftClassification
  )


  const classificationData = useMemo(
    () =>
      airCraftsClassification.find((item) => item.type === data.type) ?? {
        color: "red",
        name: "Отсутствуют данные",
        type: "ERROR",
      },
    [airCraftsClassification, data.type]
  )

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
          pinColor={classificationData.color}
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
