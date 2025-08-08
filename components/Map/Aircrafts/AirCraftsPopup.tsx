import React, { FC } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";

import { ClassificationType } from "../../../store/reducers/aircraftSlice";
import { AircraftType } from "../../../types/types";

export interface AirCraftsPopupProps {
  data: AircraftType;
  airCraftsClassification: ClassificationType[];
  onChooseMog: () => void;
  classificationData: ClassificationType;
  onChangeStatus: (data: AircraftType) => void;
}

export const AirCraftsPopup: FC<AirCraftsPopupProps> = 
  ({
    data,
    airCraftsClassification,
    classificationData,
    onChooseMog,
    onChangeStatus,
  }) => {
    const coordinates =
      data.coordinates && data.coordinates.length > 0
        ? data.coordinates[data.coordinates.length - 1]
        : { lat: "N/A", lng: "N/A" };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{classificationData.name}</Text>

        <Text>Зафиксирован: {data.detectedBy || "N/A"}</Text>
        <Text>Курс: {data.course || "N/A"}</Text>
        <Text>Высота: {data.heightInMeters || "N/A"}</Text>
        <Text>Скорость: {data.speedInMeters || "N/A"}</Text>

        <Text style={styles.subtitle}>Местоположение:</Text>
        <Text>Азимут: {data.position?.azimuth || "N/A"}</Text>
        <Text>Дистанция: {data.position?.distanceInMeters || "N/A"}</Text>

        <Text style={styles.subtitle}>Координаты:</Text>
        <Text>Долгота: {coordinates.lng}</Text>
        <Text>Широта: {coordinates.lat}</Text>

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
