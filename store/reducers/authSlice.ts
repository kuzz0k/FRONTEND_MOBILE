import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface UserState {
  isAuth: boolean,
  isAdmin: boolean,
  accessToken: string | null,
  refreshToken: string | null,
}

const initialState: UserState = {
  isAuth: true,
  isAdmin: false,
  accessToken: null,
  refreshToken: null,
}

interface LoginPayload {
  access_token: string,
  refresh_token: string,
  expires_in: number,
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, actions: PayloadAction<LoginPayload>) => {
      state.isAuth = true
      state.accessToken = actions.payload.access_token;
      state.refreshToken = actions.payload.refresh_token;
      AsyncStorage.setItem('accessToken', actions.payload.access_token)
      AsyncStorage.setItem('refreshToken', actions.payload.refresh_token);
    },
    logout: (state) => {
      state.isAuth = false;
      state.accessToken = null;
      state.refreshToken = null;
      AsyncStorage.removeItem('accessToken')
      AsyncStorage.removeItem('refreshToken');
    },
  },
})

export const { login, logout } = userSlice.actions

export default userSlice.reducer
