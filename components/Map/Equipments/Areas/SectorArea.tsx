import { FC } from "react";
import { Polygon } from "react-native-maps";
import { ZoneSector } from "../../../../types/types";

interface SectorAreaProps {
  data: ZoneSector;
  color: string,
}

// Функция для перевода градусов в радианы
const degToRad = (deg: number) => (deg * Math.PI) / 180;

// Функция для вычисления координаты точки по центру, радиусу (в метрах) и азимуту (углу)
function computeOffset(
  center: { lat: number; lng: number },
  radiusMeters: number,
  bearingDegrees: number
): { latitude: number; longitude: number } {
  // Используем формулы из сферической геометрии для вычисления координат
  const R = 6378137; // радиус Земли в метрах (WGS84)
  const δ = radiusMeters / R; // angular distance в радианах
  const θ = degToRad(bearingDegrees);

  const lat1 = center.lat;
  const lng1 = center.lng;

  const φ1 = degToRad(lat1);
  const λ1 = degToRad(lng1);

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );

  return {
    latitude: (φ2 * 180) / Math.PI,
    longitude: (λ2 * 180) / Math.PI,
  };
}

export const SectorArea: FC<SectorAreaProps> = ({ data, color }) => {
  const { params } = data;

  if (
    !params.centerCoordinates ||
    !params.radiusInMeters ||
    params.startAngle === undefined ||
    params.endAngle === undefined
  ) {
    return null;
  }

  const { centerCoordinates, radiusInMeters, startAngle, endAngle } = params;

  // Чтобы построить сектор, сгенерируем точки от startAngle до endAngle с шагом, например, 5 градусов
  const step = 5;
  let angle = startAngle;
  const points: { latitude: number; longitude: number }[] = [
    { latitude: centerCoordinates.lat, longitude: centerCoordinates.lng }
  ]; // начало — центр

  // При движении от startAngle к endAngle создаём точки на дуге
  while (angle <= endAngle) {
    points.push(computeOffset(centerCoordinates, radiusInMeters, angle));
    angle += step;
  }

  // Чтобы точно дойти до endAngle, добавим точку на endAngle (если не совпало из-за шага)
  if (angle - step < endAngle) {
    points.push(computeOffset(centerCoordinates, radiusInMeters, endAngle));
  }

  // Закроем сектор, вернувшись к центру
  points.push({ latitude: centerCoordinates.lat, longitude: centerCoordinates.lng });

  return (
    <Polygon
      coordinates={points}
      strokeColor={color}
      strokeWidth={2}
      fillColor={color + '26'} // добавляем прозрачность через hex alpha (15% = 26 в hex)
    />
  );
};
