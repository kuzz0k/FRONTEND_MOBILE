import { selectBaseUrl } from "@/store/reducers/appSettingsSlice"
import {
  removeTask,
  setError,
  setLoading,
  setTasks,
  updateTaskStatus as updateTaskStatusInSlice,
} from "@/store/reducers/tasksSlice"
import { RootState } from "@/store/store"
import { STATUS, TASK } from "@/types/types"
import { getToken } from "@/utils/globals"
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

const dynamicBaseQuery = fetchBaseQuery({
  baseUrl: "/",
})

const customBaseQuery = (args: any, api: any, extraOptions: any) => {
  const state = api.getState() as RootState
  const baseUrl = selectBaseUrl(state)

  if (typeof args === "string") {
    args = { url: baseUrl + args }
  } else if (typeof args === "object" && args.url) {
    args = { ...args, url: baseUrl + args.url }
  }

  return dynamicBaseQuery(args, api, extraOptions)
}

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
      query: () => {
        const token = getToken()
        return {
          url: `/api/tasks/mog`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      },
      providesTags: ["Task"],
      keepUnusedDataFor: 0,
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          dispatch(setLoading(true))
          const { data } = await queryFulfilled
          dispatch(setTasks(data))
        } catch (error) {
          dispatch(setError("Ошибка загрузки задач"))
        }
      },
    }),
    updateTaskStatus: builder.mutation<void, UpdateTaskStatusRequest>({
      query: ({ taskId, status }) => ({
        url: `/api/tasks/${taskId}/status`,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: {
          status: status,
        },
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
      query: (taskId) => {
        const request = {
          url: `/api/tasks/${taskId}`,
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        }
        return request
      },
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
