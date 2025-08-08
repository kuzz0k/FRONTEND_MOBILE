import React from "react";
import { useAppSelector } from "../../../hooks/redux";
import { AirCraftsMarker } from "./AircraftsMarker";

export const AirCraftsLayer = () => {
  const airCraftsData = useAppSelector((state) => state.airCrafts.data);

  if (!airCraftsData || airCraftsData.length === 0) return null;

  return (
    <>
      {airCraftsData.map((item) => (
        <AirCraftsMarker key={item.aircraftId} data={item} />
      ))}
    </>
  );
};
