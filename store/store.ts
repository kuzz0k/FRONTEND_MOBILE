import { configureStore } from "@reduxjs/toolkit"
import { api } from "../services/auth"
import apiReducer from "./reducers/apiSlice"
import appSettingsReducer from "./reducers/appSettingsSlice"
import userReducer from "./reducers/authSlice"
import coordinatesReducer from "./reducers/coordinatesSlice"
import reperDotReducer from "./reducers/reperDotSlice"
import mapReducer from "./reducers/mapSlice"
import userLocationReducer from "./reducers/userLocationSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    api: apiReducer,
    coordinates: coordinatesReducer,
    reperDot: reperDotReducer,
    appSettings: appSettingsReducer,
    map: mapReducer,
    userLocation: userLocationReducer,
    apiQuery: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
