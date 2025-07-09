import { FC } from "react";
import { Polygon } from "react-native-maps";
import { ZonePolygon } from "../../../../types/types";

interface PolygonAreaProps {
  data: ZonePolygon;
  color: string,
}

export const PolygonArea: FC<PolygonAreaProps> = ({ data, color }) => {
  const { params } = data;

  if (!params?.pointsCoordinates || params.pointsCoordinates.length === 0) {
    return null;
  }

  // Преобразуем координаты из формата {lat, lng} в формат {latitude, longitude}
  const coordinates = params.pointsCoordinates.map(coord => ({
    latitude: coord.lat,
    longitude: coord.lng
  }));

  return (
    <Polygon
      coordinates={coordinates}
      strokeColor={color}
      strokeWidth={2}
      fillColor={color + '26'} // добавляем прозрачность через hex alpha (15% = 26 в hex)
    />
  );
};
