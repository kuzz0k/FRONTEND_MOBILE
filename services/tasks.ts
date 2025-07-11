import { selectBaseUrl } from "@/store/reducers/appSettingsSlice";
import { RootState } from "@/store/store";
import { STATUS, TASK } from "@/types/types";
import { getToken } from "@/utils/globals";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const dynamicBaseQuery = fetchBaseQuery({
  baseUrl: '/',
});

const customBaseQuery = (args: any, api: any, extraOptions: any) => {
  const state = api.getState() as RootState;
  const baseUrl = selectBaseUrl(state);

  if (typeof args === 'string') {
    args = { url: baseUrl + args };
  } else if (typeof args === 'object' && args.url) {
    args = { ...args, url: baseUrl + args.url };
  }
  
  return dynamicBaseQuery(args, api, extraOptions);
};

interface UpdateTaskStatusRequest {
  taskId: string;
  status: STATUS;
}

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: customBaseQuery,
  tagTypes: ['Task'],
  refetchOnReconnect: true,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    getTasks: builder.query<TASK[], void>({
      query: () => {
        const token = getToken();
        return {
          url: `/api/tasks/mog`,
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        };
      },
      providesTags: ['Task'],
      keepUnusedDataFor: 0,
    }),
    updateTaskStatus: builder.mutation<void, UpdateTaskStatusRequest>({
      query: ({ taskId, status }) => ({
        url: `/api/tasks/${taskId}/status`,
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${getToken()}`,
          "Content-Type": "application/json"
        },
        body: {
          status: status
        }
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useUpdateTaskStatusMutation
} = tasksApi;

// Convenience hooks for specific status updates
export const useAcceptTaskMutation = () => {
  const [updateTaskStatus, result] = useUpdateTaskStatusMutation();
  
  const acceptTask = (taskId: string) => {
    return updateTaskStatus({ taskId, status: STATUS.ACCEPTED });
  };
  
  return [acceptTask, result] as const;
};

export const useRejectTaskMutation = () => {
  const [updateTaskStatus, result] = useUpdateTaskStatusMutation();
  
  const rejectTask = (taskId: string) => {
    return updateTaskStatus({ taskId, status: STATUS.REJECTED });
  };
  
  return [rejectTask, result] as const;
};

export const useCompleteTaskMutation = () => {
  const [updateTaskStatus, result] = useUpdateTaskStatusMutation();
  
  const completeTask = (taskId: string) => {
    return updateTaskStatus({ taskId, status: STATUS.COMPLETED });
  };
  
  return [completeTask, result] as const;
};
