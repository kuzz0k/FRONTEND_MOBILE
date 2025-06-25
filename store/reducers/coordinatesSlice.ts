import { createSlice } from "@reduxjs/toolkit"

export interface CoordState {
  lat: number,
  lng: number,
}

const initialState: CoordState = {
  lat: 55.4343444,
  lng: 54.7676753,
}

export const coordinatesSlice = createSlice({
  name: "coordinates",
  initialState,
  reducers: {
    updateCoordinates: (state, actions) => {
      state.lat = actions.payload.lat
      state.lng = actions.payload.lng
    },
  },
})

export const { updateCoordinates } = coordinatesSlice.actions

export default coordinatesSlice.reducer
