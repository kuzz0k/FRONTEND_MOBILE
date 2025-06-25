import { createSlice } from "@reduxjs/toolkit"

export interface apiStateType {
  wsUrl: string;
  loginUrl: string;
}

const initialState: apiStateType = {
  wsUrl: 'ws://192.168.31.50:8000/livestream/mog',
  loginUrl: 'http://192.168.31.50:8000/'
}

export const apiSlice = createSlice({
  name: "api",
  initialState,
  reducers: {
    test() {
      console.log('Slice is working')
    }
  }
})

export const { test } = apiSlice.actions

export default apiSlice.reducer
