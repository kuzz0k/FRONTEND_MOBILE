import { globalState } from "@/services/globalState"
import { tasksApi } from "@/services/tasks"
import { setStoreRef } from "@/utils/globals"
import { configureStore } from "@reduxjs/toolkit"
import { api } from "../services/auth"
import apiReducer from "./reducers/apiSlice"
import appSettingsReducer from "./reducers/appSettingsSlice"
import userReducer from "./reducers/authSlice"
import coordinatesReducer from "./reducers/coordinatesSlice"
import mapReducer from "./reducers/mapSlice"
import mogReducer from "./reducers/mogSlice"
import reperDotReducer from "./reducers/reperDotSlice"
import equipmentReducer from "./reducers/rlsSlice"
import tasksReducer from "./reducers/tasksSlice"
import userLocationReducer from "./reducers/userLocationSlice"
import airCraftsReducer from "./reducers/aircraftSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    api: apiReducer,
    coordinates: coordinatesReducer,
    reperDot: reperDotReducer,
    appSettings: appSettingsReducer,
    map: mapReducer,
    equipment: equipmentReducer,
    mog: mogReducer,
    tasks: tasksReducer,
    userLocation: userLocationReducer,
    apiQuery: api.reducer,
    airCrafts: airCraftsReducer,
    [globalState.reducerPath]: globalState.reducer,
    [tasksApi.reducerPath]: tasksApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(api.middleware)
      .concat(globalState.middleware)
      .concat(tasksApi.middleware),
});

// Set store reference for utils that need it
setStoreRef(store);

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
