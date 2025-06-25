import { createSlice } from "@reduxjs/toolkit"

export interface UserState {
  isAuth: boolean
}

const initialState: UserState = {
  isAuth: false,
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state) => {
      state.isAuth = true
    },
    logout: (state) => {
      state.isAuth = false
    },
  },
})

export const { login, logout } = userSlice.actions

export default userSlice.reducer
