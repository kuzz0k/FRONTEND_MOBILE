import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setMapType, setRegion, toggleUserLocation, setFollowUserLocation } from '../store/reducers/mapSlice';
import { MapType } from '../constants/consts';

export const useMap = () => {
  const dispatch = useDispatch();
  const mapState = useSelector((state: RootState) => state.map);

  const changeMapType = (mapType: MapType) => {
    dispatch(setMapType(mapType));
  };

  const updateRegion = (region: typeof mapState.region) => {
    dispatch(setRegion(region));
  };

  const toggleUserLocationDisplay = () => {
    dispatch(toggleUserLocation());
  };

  const setFollowUser = (follow: boolean) => {
    dispatch(setFollowUserLocation(follow));
  };

  return {
    mapState,
    changeMapType,
    updateRegion,
    toggleUserLocationDisplay,
    setFollowUser,
  };
};
