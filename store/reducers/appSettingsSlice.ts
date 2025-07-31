import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type MapType = "hybrid" | "scheme" | "satellite"


export interface AppSettingsState {
  mapType: MapType;
  network: {
    ip: string;
    port: string;
  }
}


const initialState: AppSettingsState = {
  mapType: "hybrid",
  network: {
    ip: "192.168.31.50",
    port: "8000"
  }
};


export const appSettingsSlice = createSlice({
  name: "appSettings",
  initialState,
  reducers: {
    setMapType: (state, action: PayloadAction<MapType>) => {
      state.mapType = action.payload;
    },
    setNetworkSettings: (state, action: PayloadAction<{ ip: string; port: string }>) => {
      const { ip, port } = action.payload;
      state.network.ip = ip;
      state.network.port = port;
    }
  }
});

export const {
  setMapType,
  setNetworkSettings
} = appSettingsSlice.actions;

// Селектор для получения baseUrl
export const selectBaseUrl = (state: { appSettings: AppSettingsState }) => 
  `http://${state.appSettings.network.ip}:${state.appSettings.network.port}`;

export default appSettingsSlice.reducer;
