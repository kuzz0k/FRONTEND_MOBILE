import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type MapType = "hybrid" | "scheme" | "satellite"


export interface AppSettingsState {
  mapType: MapType;
}


const initialState: AppSettingsState = {
  mapType: "hybrid"
};


export const appSettingsSlice = createSlice({
  name: "appSettings",
  initialState,
  reducers: {
    setMapType: (state, action: PayloadAction<MapType>) => {
      state.mapType = action.payload;
    }
  }
});

export const {
  setMapType,
} = appSettingsSlice.actions;


export default appSettingsSlice.reducer;
