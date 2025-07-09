import { useAppSelector } from "../../../hooks/redux";
import { MogsMarker } from "./MogsMarker";

export const MogsLayer = () => {
  const data = useAppSelector(state => state.mog);
  const currentUsername = useAppSelector(state => state.user.username);
  
  if (!data || data.length <= 0) return null;

  // Фильтруем могов, исключая текущего пользователя
  const filteredMogs = data.filter(mog => mog.username !== currentUsername);
  
  if (filteredMogs.length <= 0) return null;

  return (
    <MogsMarker mogs={filteredMogs} />
  )
}
