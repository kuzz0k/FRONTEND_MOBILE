import { selectBaseUrl } from "@/store/reducers/appSettingsSlice";
import { GlobalStateResponse } from "@/types/types";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildDynamicBaseQueryWithReauth } from "./baseQueryWithReauth";

import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
const customBaseQuery: BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> = buildDynamicBaseQueryWithReauth(selectBaseUrl);

export const globalState = createApi({
  reducerPath: "globalState",
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getGlobalState: builder.query<GlobalStateResponse, void>({
      query: () => ({
        url: "/state/api/global-state",
  method: "GET",
      }),
    }),
  }),
});

export const {
  useGetGlobalStateQuery,
} = globalState;
