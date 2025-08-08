import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { AircraftType, TYPE } from "../../types/types"

export type ClassificationType = {
  color: string,
  type: string,
  name: string,
}

type InitialStateType = {
  data: AircraftType[],
  selectedAirCraft: AircraftType | null;
  airCraftClassification: ClassificationType[];
}

const initialState: InitialStateType = {
  data: [],
  selectedAirCraft: null,
  airCraftClassification: [
    {type: TYPE.ENEMY, name: 'Вражеский', color: '#F11D36'},
    {type: TYPE.EXTRAPOLATED, name: 'Экстраполируемый', color: 'grey'},
    {type: TYPE.FRIENDLY, name: 'Союзный', color: '#00FF09'},
    {type: TYPE.NEW, name: 'Неизвестный', color: '#ffffff'},
    {type: TYPE.MISLEADING, name: 'Ещкере', color: 'purple'},
  ]
}

export const airCraftsSlice = createSlice({
  name: "airCrafts",
  initialState,
  reducers: {
    // Добавляем полностью новый массив.
    setAirCraftsState: (state, action: PayloadAction<AircraftType[]>) => {
      state.data = action.payload;
    },
    // Добавляем 1 дрон
    addNewAirCraft: (state, action: PayloadAction<AircraftType>) => {
      state.data.push(action.payload);
    },
    // Меняет параметры дрона если изменились
    updateAircraftType: (state, action: PayloadAction<AircraftType>) => {
      const updatedAirCraft = action.payload;
      const index = state.data.findIndex(
        airCraft => airCraft.aircraftId === updatedAirCraft.aircraftId
      );

      // Приводим coordinates к массиву
      const incomingCoordinates = Array.isArray(updatedAirCraft.coordinates)
        ? updatedAirCraft.coordinates
        : [updatedAirCraft.coordinates];

      if (index !== -1) {
        const existing = state.data[index];

        state.data[index] = {
          ...existing,
          ...updatedAirCraft,
          coordinates: [...existing.coordinates, ...incomingCoordinates],
        };
      } else {
        // Если новый объект
        state.data.push({
          ...updatedAirCraft,
          coordinates: incomingCoordinates,
        });
      }
    },

    // Удаление дрона из массива
    deleteAirCraft: (state, action: PayloadAction<AircraftType>) => {
      state.data = state.data.filter(
        aircraft => aircraft.aircraftId !== action.payload.aircraftId
      );
    },
    // Дрон потерян - становится EXTRAPOLATED ОШИБКА ТИПО РЕРЕНДЕРА
    setAirCraftLost: (state, action: PayloadAction<AircraftType>) => {
      const lostedId = action.payload.aircraftId;
      console.log(lostedId);
      const airCraftIndex = state.data.findIndex(item => item.aircraftId === lostedId);

      if (airCraftIndex !== -1) {
        state.data[airCraftIndex] = {
          ...state.data[airCraftIndex],
          type: TYPE.EXTRAPOLATED
        }
      }
    },
    // Для выбора дрона для мога.
    setSelectedAirCraft: (state, action: PayloadAction<AircraftType | null>) => {
      state.selectedAirCraft = action.payload;
    },
    // Добавление новой классификации
    addClassification: (state, action: PayloadAction<ClassificationType>) => {
      state.airCraftClassification.push(action.payload)
    },
    // Удаление классификации
    deleteClassification: (state, action: PayloadAction<string>) => {
      state.airCraftClassification = state.airCraftClassification.filter(
        item => item.type !== action.payload
      );
    }
  }
})

export const {
  updateAircraftType,
  setAirCraftsState,
  setSelectedAirCraft,
  addNewAirCraft,
  deleteAirCraft,
  addClassification,
  deleteClassification,
  setAirCraftLost,
} = airCraftsSlice.actions;

export default airCraftsSlice.reducer;
