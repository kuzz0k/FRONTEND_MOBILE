import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MapType } from "../../constants/consts";

export interface MapState {
  mapType: MapType;
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showUserLocation: boolean;
  followUserLocation: boolean;
}

const initialState: MapState = {
  mapType: 'standard', // По умолчанию схема
  region: {
    latitude: 55.751244, // Москва по умолчанию
    longitude: 37.618423,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  showUserLocation: true,
  followUserLocation: false,
};

export const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setMapType: (state, action: PayloadAction<MapType>) => {
      state.mapType = action.payload;
    },
    setRegion: (state, action: PayloadAction<MapState['region']>) => {
      state.region = action.payload;
    },
    toggleUserLocation: (state) => {
      state.showUserLocation = !state.showUserLocation;
    },
    setFollowUserLocation: (state, action: PayloadAction<boolean>) => {
      state.followUserLocation = action.payload;
    },
  },
});

export const { 
  setMapType, 
  setRegion, 
  toggleUserLocation, 
  setFollowUserLocation 
} = mapSlice.actions;

export default mapSlice.reducer;
