import { createSlice } from "@reduxjs/toolkit"

export interface apiStateType {
  url: string;
}

const initialState: apiStateType = {
  url: 'ws://192.168.31.50:8079/ws',
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
