import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { EquipmentType } from "@/types/types"

type RlsStateType = {
  visible: boolean,
  data: EquipmentType[],
}

const initialState: RlsStateType = {
  visible: true,
  data: []
}

export const equipmentSlice = createSlice({
  name: "equipment",
  initialState,
  reducers: {
    deleteEquipment: (state, action: PayloadAction<string[]>) => {
      // Удаляем устройства, чьи ID есть в массиве action.payload
      state.data = state.data.filter(equip => !action.payload.includes(equip.id));
    },
    setEquipments: (state, action: PayloadAction<EquipmentType[]> ) => {
      state.data = action.payload;
    },
    toggleVisible: (state) => {
      state.visible = !state.visible
    }
  }
})

export const { deleteEquipment, setEquipments, toggleVisible } = equipmentSlice.actions

export default equipmentSlice.reducer
