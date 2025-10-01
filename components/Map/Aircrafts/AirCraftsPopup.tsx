import React, { FC, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ClassificationType } from "../../../store/reducers/aircraftSlice";
import { CoordState } from "../../../store/reducers/reperDotSlice";
import { AircraftType } from "../../../types/types";

export interface AirCraftsPopupProps {
  data: AircraftType;
  airCraftsClassification: ClassificationType[];
  onChooseMog: () => void;
  classificationData: ClassificationType;
  onChangeStatus: (data: AircraftType) => void;
  // Reference point to compute distance/azimuth from. Pass from reperDotSlice via props.
  reperDot: CoordState;
}

export const AirCraftsPopup: FC<AirCraftsPopupProps> = 
  ({
    data,
    airCraftsClassification,
    classificationData,
    onChooseMog,
    onChangeStatus,
    reperDot,
  }) => {
    // Last known coordinates of the aircraft
    const last = useMemo(() => {
      if (data.coordinates && data.coordinates.length > 0) {
        return data.coordinates[data.coordinates.length - 1];
      }
      return null;
    }, [data.coordinates]);

    const computed = useMemo(() => {
      if (!last) return { distance: null as number | null, azimuth: null as number | null };
      const rpLat = reperDot.lat;
      const rpLng = reperDot.lng;
      if (rpLat == null || rpLng == null) return { distance: null as number | null, azimuth: null as number | null };
      // Inline helpers to avoid external deps in hook
      const toRad = (d: number) => (d * Math.PI) / 180;
      const toDeg = (r: number) => (r * 180) / Math.PI;
      const R = 6371000; // meters
      const dLat = toRad(last.lat - rpLat);
      const dLng = toRad(last.lng - rpLng);
      const lat1 = toRad(rpLat);
      const lat2 = toRad(last.lat);
      const sinDLat = Math.sin(dLat / 2);
      const sinDLng = Math.sin(dLng / 2);
      const a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = Math.round(R * c);
      // Bearing
      const φ1 = lat1;
      const φ2 = lat2;
      const λ1 = toRad(rpLng);
      const λ2 = toRad(last.lng);
      const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
      const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
      const θ = Math.atan2(y, x);
      const az = Math.round(((toDeg(θ) + 360) % 360));
      return { distance: dist, azimuth: az };
    }, [last, reperDot.lat, reperDot.lng]);

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{classificationData.name}</Text>

        <Text>Зафиксирован: {data.detectedBy || "N/A"}</Text>
        <Text>Курс: {typeof data.course === 'number' ? `${data.course}°` : "N/A"}</Text>
        <Text>Высота: {typeof data.heightInMeters === 'number' ? `${data.heightInMeters} м` : "N/A"}</Text>
        <Text>Скорость: {typeof data.speedInMeters === 'number' ? `${data.speedInMeters} м/с` : "N/A"}</Text>

  <Text style={styles.subtitle}>Местоположение (от репера):</Text>
        <Text>Азимут: {computed.azimuth != null ? `${computed.azimuth}°` : "N/A"}</Text>
        <Text>Дистанция: {computed.distance != null ? `${computed.distance} м` : "N/A"}</Text>

        <Text style={styles.subtitle}>Координаты:</Text>
        <Text>Долгота: {last ? last.lng.toFixed(5) : "N/A"}</Text>
        <Text>Широта: {last ? last.lat.toFixed(5) : "N/A"}</Text>

      </View>
    );
  }

const styles = StyleSheet.create({
  container: {
    width: 250,
    padding: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
  },
  subtitle: {
    marginTop: 8,
    fontWeight: "bold",
  },
});
