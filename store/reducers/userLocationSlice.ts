import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserLocationState {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
  isTracking: boolean;
  lastError?: string | null;
}

const initialState: UserLocationState = {
  latitude: 55.7558, // Москва по умолчанию
  longitude: 37.6173,
  timestamp: Date.now(),
  isTracking: false,
  lastError: null,
};

export interface LocationPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

export const userLocationSlice = createSlice({
  name: "userLocation",
  initialState,
  reducers: {
    updateUserLocation: (state, action: PayloadAction<LocationPayload>) => {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.accuracy = action.payload.accuracy;
      state.altitude = action.payload.altitude;
      state.speed = action.payload.speed;
      state.heading = action.payload.heading;
      state.timestamp = action.payload.timestamp;
      state.lastError = null;
    },
    setTrackingStatus: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
      if (!action.payload) {
        state.lastError = null;
      }
    },
    setLocationError: (state, action: PayloadAction<string>) => {
      state.lastError = action.payload;
      state.isTracking = false;
    },
    clearLocationError: (state) => {
      state.lastError = null;
    },
  },
});

export const { 
  updateUserLocation, 
  setTrackingStatus, 
  setLocationError, 
  clearLocationError 
} = userLocationSlice.actions;

export default userLocationSlice.reducer;
