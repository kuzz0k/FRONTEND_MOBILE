import { selectBaseUrl } from "@/store/reducers/appSettingsSlice"
import {
  removeTask,
  setError,
  setLoading,
  setTasks,
  updateTaskStatus as updateTaskStatusInSlice,
} from "@/store/reducers/tasksSlice"
import { STATUS, TASK } from "@/types/types"
import { createApi } from "@reduxjs/toolkit/query/react"
import { buildDynamicBaseQueryWithReauth } from "./baseQueryWithReauth"

const customBaseQuery = buildDynamicBaseQueryWithReauth(selectBaseUrl)

interface UpdateTaskStatusRequest {
  taskId: string
  status: STATUS
}

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Task"],
  refetchOnReconnect: true,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    getTasks: builder.query<TASK[], void>({
      query: () => ({
        url: `/api/tasks/mog`,
        method: "GET",
      }),
      providesTags: ["Task"],
      keepUnusedDataFor: 0,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          dispatch(setLoading(true))
          const { data } = await queryFulfilled
          dispatch(setTasks(data))
        } catch {
          dispatch(setError("Ошибка загрузки задач"))
        }
      },
    }),
    updateTaskStatus: builder.mutation<void, UpdateTaskStatusRequest>({
      query: ({ taskId, status }) => ({
        url: `/api/tasks/${taskId}/status`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: { status },
      }),
      invalidatesTags: ["Task"],
      async onQueryStarted({ taskId, status }, { dispatch, queryFulfilled }) {
        try {
          // Оптимистичное обновление
          dispatch(updateTaskStatusInSlice({ taskId, status }))
          await queryFulfilled
        } catch {
          // В случае ошибки можно откатить изменения или показать ошибку
          dispatch(setError("Ошибка обновления статуса задачи"))
        }
      },
    }),
    deleteTask: builder.mutation<void, string>({
      query: (taskId) => ({
        url: `/api/tasks/${taskId}`,
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Task"],
      async onQueryStarted(taskId, { dispatch, queryFulfilled }) {
        try {
          // Оптимистичное удаление из store
          dispatch(removeTask(taskId))
          await queryFulfilled
        } catch {
          dispatch(setError("Ошибка удаления задачи"))
        }
      },
    }),
  }),
})

export const { useGetTasksQuery, useUpdateTaskStatusMutation, useDeleteTaskMutation } = tasksApi

// Convenience hooks for specific status updates
export const useAcceptTaskMutation = () => {
  const [updateTaskStatus, result] = useUpdateTaskStatusMutation()

  const acceptTask = (taskId: string) => {
    return updateTaskStatus({ taskId, status: STATUS.ACCEPTED })
  }

  return [acceptTask, result] as const
}

export const useRejectTaskMutation = () => {
  const [updateTaskStatus, result] = useUpdateTaskStatusMutation()

  const rejectTask = (taskId: string) => {
    return updateTaskStatus({ taskId, status: STATUS.REJECTED })
  }

  return [rejectTask, result] as const
}

export const useCompleteTaskMutation = () => {
  const [updateTaskStatus, result] = useUpdateTaskStatusMutation()

  const completeTask = (taskId: string) => {
    return updateTaskStatus({ taskId, status: STATUS.COMPLETED })
  }

  return [completeTask, result] as const
}
