import { useAppSelector } from "../../../hooks/redux";
import { MogsMarker } from "./MogsMarker";

export const MogsLayer = () => {
  const data = useAppSelector(state => state.mog);
  if (!data || data.length <= 0) return null;

  return (
    <MogsMarker mogs={data} />
  )
}
