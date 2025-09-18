import { STATUS, TASK, TASK_AIRCRAFT, TASK_DOT, TYPE_TO } from '@/types/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface TasksState {
  tasks: TASK[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Установка состояния загрузки
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Установка ошибки
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Загрузка всех задач (например, при загрузке страницы)
    setTasks: (state, action: PayloadAction<TASK[]>) => {
      state.tasks = action.payload;
      state.lastUpdated = Date.now();
      state.loading = false;
      state.error = null;
    },
    
    // Добавление новой задачи (например, через WebSocket)
    addTask: (state, action: PayloadAction<TASK>) => {
      const existingIndex = state.tasks.findIndex(task => task.id === action.payload.id);
      
      if (existingIndex >= 0) {
        // Если задача уже существует, обновляем её
        state.tasks[existingIndex] = action.payload;
      } else {
        // Добавляем новую задачу в начало списка
        state.tasks.unshift(action.payload);
      }
      state.lastUpdated = Date.now();
    },
    
    // Обновление статуса задачи
    updateTaskStatus: (state, action: PayloadAction<{ taskId: string; status: STATUS }>) => {
      const { taskId, status } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      
      if (taskIndex >= 0) {
        state.tasks[taskIndex].status = status;
        state.lastUpdated = Date.now();
      }
    },
    
    // Обновление задачи целиком
    updateTask: (state, action: PayloadAction<TASK>) => {
      const taskIndex = state.tasks.findIndex(task => task.id === action.payload.id);
      
      if (taskIndex >= 0) {
        state.tasks[taskIndex] = action.payload;
        state.lastUpdated = Date.now();
      }
    },
    
    // Удаление задачи
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      state.lastUpdated = Date.now();
    },
    
    // Очистка всех задач
    clearTasks: (state) => {
      state.tasks = [];
      state.lastUpdated = Date.now();
      state.error = null;
    },
    
    // Сброс состояния ошибки
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setTasks,
  addTask,
  updateTaskStatus,
  updateTask,
  removeTask,
  clearTasks,
  clearError,
} = tasksSlice.actions;

// Селекторы
export const selectTasks = (state: RootState) => state.tasks.tasks;
export const selectTasksLoading = (state: RootState) => state.tasks.loading;
export const selectTasksError = (state: RootState) => state.tasks.error;
export const selectTasksLastUpdated = (state: RootState) => state.tasks.lastUpdated;

// Селекторы для задач по статусу
export const selectTasksByStatus = (status: STATUS) => (state: RootState) =>
  state.tasks.tasks.filter(task => task.status === status);

export const selectPendingTasks = (state: RootState) =>
  selectTasksByStatus(STATUS.PENDING)(state);

export const selectAcceptedTasks = (state: RootState) =>
  selectTasksByStatus(STATUS.ACCEPTED)(state);

export const selectCompletedTasks = (state: RootState) =>
  selectTasksByStatus(STATUS.COMPLETED)(state);

export const selectRejectedTasks = (state: RootState) =>
  selectTasksByStatus(STATUS.REJECTED)(state);

// Селектор для получения задачи по ID
export const selectTaskById = (taskId: string) => (state: RootState) =>
  state.tasks.tasks.find(task => task.id === taskId);

// Селектор для подсчета задач
export const selectTasksCount = (state: RootState) => state.tasks.tasks.length;

export const selectTasksCountByStatus = (status: STATUS) => (state: RootState) =>
  state.tasks.tasks.filter(task => task.status === status).length;

// Селектор для получения только задач с координатами (TO_POINT)
export const selectPointTasks = (state: RootState) =>
  state.tasks.tasks.filter((task): task is TASK_DOT => 
    task.type === TYPE_TO.TO_POINT && 'coordinates' in task
  );

// Селектор для задач, привязанных к дрону (TO_AIRCRAFT)
export const selectAircraftTasks = (state: RootState) =>
  state.tasks.tasks.filter((task): task is TASK_AIRCRAFT =>
    task.type === TYPE_TO.TO_AIRCRAFT && 'aircraftId' in task
  );

export default tasksSlice.reducer;
