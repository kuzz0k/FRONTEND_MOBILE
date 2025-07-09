import { useAppSelector } from "../../../hooks/redux";
import { EquipmentMarker } from "./EquipmentMarker";


export const EquipmentLayer = () => {
  const {data, visible} = useAppSelector(state => state.equipment);

  if (!visible) return null;

  return (
    <EquipmentMarker equipments={data} />
  )
}
