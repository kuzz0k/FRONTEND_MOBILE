import { Mog } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: Mog[] = [];

export const mogSlice = createSlice({
  name: "mog",
  initialState,
  reducers: {
    setMogs: (state, action: PayloadAction<Mog[]>) => action.payload,

    addMog: (state, action: PayloadAction<Mog>) => {
      state.push(action.payload);
    },

    deleteMog: (state, action: PayloadAction<Mog>) => {
      return state.filter(mog => mog.username !== action.payload.username)
    },

    updateMog: (state, action: PayloadAction<Partial<Mog>>) => {
      const updatedMog = action.payload;
      const index = state.findIndex(mog => mog.username === updatedMog.username);
      if (index !== -1) {
        state[index] = {
          ...state[index],
          ...updatedMog, connected: true,
        };
      }
    },

    disconnectMog: (state, action: PayloadAction<Partial<Mog>>) => {
      const updatedMog = action.payload;
      const index = state.findIndex(mog => mog.username === updatedMog.username);
      if (index !== -1) {
        state[index] = {
          ...state[index],
          ...updatedMog, connected: false,
        };
      }
    }

  }
});

export const { setMogs, updateMog, deleteMog, addMog, disconnectMog } = mogSlice.actions;

export default mogSlice.reducer;
