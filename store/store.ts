import { configureStore } from "@reduxjs/toolkit"
import { api } from "../services/loginUser"
import apiReducer from "./reducers/apiSlice"
import appSettingsReducer from "./reducers/appSettingsSlice"
import userReducer from "./reducers/authSlice"
import coordinatesReducer from "./reducers/coordinatesSlice"
import reperDotReducer from "./reducers/reperDotSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    api: apiReducer,
    coordinates: coordinatesReducer,
    reperDot: reperDotReducer,
    appSettings: appSettingsReducer,
    [api.reducerPath]: api.reducer, // RTK Query reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware), // RTK Query middleware
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
