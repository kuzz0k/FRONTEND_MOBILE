import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { GlobalStateResponse } from "@/types/types";
import { selectBaseUrl } from "@/store/reducers/appSettingsSlice";
import { RootState } from "@/store/store";
import { getToken } from "@/utils/globals";

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

export const globalState = createApi({
  reducerPath: "globalState",
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getGlobalState: builder.query<GlobalStateResponse, void>({
      query: () => ({
        url: "/state/api/global-state",
        method: "GET",
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      }),
    }),
  }),
});

export const {
  useGetGlobalStateQuery,
} = globalState;
