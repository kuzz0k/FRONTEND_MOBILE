import { configureStore } from "@reduxjs/toolkit"
import apiReducer from "./reducers/apiSlice"
import userReducer from "./reducers/authSlice"

export const store = configureStore({
    reducer: {
        user: userReducer,
        api: apiReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch