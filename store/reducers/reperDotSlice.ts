import { createSlice } from "@reduxjs/toolkit"

export interface CoordState {
  lat: number | null,
  lng: number | null,
}

const initialState: CoordState = {
  lat: null,
  lng: null
}

export const reperDotSlice = createSlice({
  name: "reperDot",
  initialState,
  reducers: {
    setReperDot: (state, actions) => {
      state.lat = actions.payload.lat
      state.lng = actions.payload.lng
    },
  },
})

export const { setReperDot } = reperDotSlice.actions

export default reperDotSlice.reducer
