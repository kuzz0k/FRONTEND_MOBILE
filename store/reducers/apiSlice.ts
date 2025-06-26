import { createSlice } from "@reduxjs/toolkit"
import { API_BASE_URL, WS_URL } from "@/services/globals";

export interface apiStateType {
  wsUrl: string;
  loginUrl: string;
}

const initialState: apiStateType = {
  wsUrl: WS_URL,
  loginUrl: API_BASE_URL
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
