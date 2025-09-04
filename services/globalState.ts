import { selectBaseUrl } from "@/store/reducers/appSettingsSlice";
import { GlobalStateResponse } from "@/types/types";
import { createApi } from "@reduxjs/toolkit/query/react";
import { buildDynamicBaseQueryWithReauth } from "./baseQueryWithReauth";
import { safeSlice } from "@/utils/safeSlice";

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
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('[INIT][GLOBAL_STATE] success', safeSlice(data as any));
        } catch (e) {
          console.error('[INIT][GLOBAL_STATE] error', e);
        }
      }
    }),
  }),
});

export const {
  useGetGlobalStateQuery,
} = globalState;
