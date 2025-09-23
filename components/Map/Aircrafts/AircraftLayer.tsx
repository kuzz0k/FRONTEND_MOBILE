import React from "react";
import { useAppSelector } from "../../../hooks/redux";
import { AirCraftsMarker } from "./AircraftsMarker";
import { AircraftType } from "@/types/types";

export const AirCraftsLayer = () => {
  const airCraftsData = useAppSelector((state) => state.airCrafts.data);
  const tasks = useAppSelector((state) => state.tasks.tasks);

  // Получаем id дронов, на которые назначены таски
  const assignedAircraftIds = tasks
    ? tasks.map((task: any) => task.aircraftId).filter(Boolean)
    : [];

  // Фильтруем только те дроны, на которые есть таска
  const filteredAirCrafts = airCraftsData
    ? airCraftsData.filter((item: AircraftType) => assignedAircraftIds.includes(item.aircraftId))
    : [];

  if (!filteredAirCrafts || filteredAirCrafts.length === 0) return null;

  return (
    <>
      {filteredAirCrafts.map((item: AircraftType) => (
        <AirCraftsMarker key={item.aircraftId} data={item} />
      ))}
    </>
  );
};
