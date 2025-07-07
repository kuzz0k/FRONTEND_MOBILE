import AsyncStorage from "@react-native-async-storage/async-storage"
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface UserState {
  isAuth: boolean
  isAdmin: boolean
  username: string | null
  callSign: string | null
  accessToken: string | null
  refreshToken: string | null
  isReady: boolean
}

const initialState: UserState = {
  isAuth: false,
  isAdmin: false,
  username: null,
  callSign: null,
  accessToken: null,
  refreshToken: null,
  isReady: false,
}

interface LoginPayload {
  access_token: string
  refresh_token: string
  expires_in: number
  username: string
  callSign?: string
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, actions: PayloadAction<LoginPayload>) => {
      state.isAuth = true
      state.username = actions.payload.username
      state.callSign = actions.payload.callSign || null
      state.accessToken = actions.payload.access_token
      state.refreshToken = actions.payload.refresh_token
      AsyncStorage.setItem("accessToken", actions.payload.access_token)
      AsyncStorage.setItem("refreshToken", actions.payload.refresh_token)
      AsyncStorage.setItem("username", actions.payload.username)
      if (actions.payload.callSign) {
        AsyncStorage.setItem("callSign", actions.payload.callSign)
      }
    },
    logout: (state) => {
      state.isAuth = false
      state.username = null
      state.callSign = null
      state.accessToken = null
      state.refreshToken = null
      AsyncStorage.removeItem("accessToken")
      AsyncStorage.removeItem("refreshToken")
      AsyncStorage.removeItem("username")
      AsyncStorage.removeItem("callSign")
    },
    toggleReady: (state) => {
      state.isReady = !state.isReady
    },
  },
})

export const { login, logout, toggleReady } = userSlice.actions

export default userSlice.reducer
