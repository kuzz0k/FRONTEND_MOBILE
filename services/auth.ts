import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "./globals";
import { AuthType, LoginResponse } from "@/types/types";

export const api = createApi({
  reducerPath: "apiQuery",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, AuthType>({
      query: (userData) => ({
        url: "/auth/api/login",
        method: "POST",
        body: {
          username: userData.username,
          password: userData.password
        }
      })
    }),
    validateToken: builder.mutation<any, string>({
      query: (accessToken) => ({
        url: "/auth/api/test",
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    }),
    refreshToken: builder.mutation<LoginResponse, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: "/auth/api/refresh",
        method: "POST",
        body: {
          refresh_token: refreshToken
        }
      })
    }),
    logout: builder.mutation<void, string>({
      query: (accessToken) => ({
        url: "/auth/api/logout",
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    })
  })
});

export const {
  useLoginMutation,
  useValidateTokenMutation,
  useRefreshTokenMutation,
  useLogoutMutation
} = api;
